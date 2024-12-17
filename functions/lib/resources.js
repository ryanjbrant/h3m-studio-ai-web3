"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyMeshyAsset = exports.processUploadedFile = void 0;
const storage_1 = require("firebase-functions/v2/storage");
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const storage_2 = require("@google-cloud/storage");
const path = require("path");
const os = require("os");
const fs = require("fs");
const unzipper = require("unzipper");
const uuid_1 = require("uuid");
const node_fetch_1 = require("node-fetch");
const storage = new storage_2.Storage();
const FILE_TYPE_MAP = {
    // 3D Models
    fbx: { type: 'models', subType: 'fbx' },
    gltf: { type: 'models', subType: 'gltf' },
    glb: { type: 'models', subType: 'glb' },
    obj: { type: 'models', subType: 'obj' },
    usdz: { type: 'models', subType: 'usdz' },
    // Project Files
    c4d: { type: 'projects', subType: 'c4d' },
    blend: { type: 'projects', subType: 'blend' },
    unity: { type: 'projects', subType: 'unity' },
    unreal: { type: 'projects', subType: 'unreal' },
    // Images
    jpg: { type: 'images', subType: 'image' },
    jpeg: { type: 'images', subType: 'image' },
    png: { type: 'images', subType: 'image' },
    gif: { type: 'images', subType: 'image' },
    webp: { type: 'images', subType: 'image' },
    // Videos
    mp4: { type: 'videos', subType: 'video' },
    mov: { type: 'videos', subType: 'video' },
    webm: { type: 'videos', subType: 'video' },
    // Code
    glsl: { type: 'code', subType: 'shader' },
    hlsl: { type: 'code', subType: 'shader' },
    shader: { type: 'code', subType: 'shader' }
};
exports.processUploadedFile = (0, storage_1.onObjectFinalized)({
    memory: '1GiB',
    timeoutSeconds: 540
}, async (event) => {
    const object = event.data;
    if (!object.name)
        return;
    const filePath = object.name;
    const fileExtension = path.extname(filePath).toLowerCase().slice(1);
    const fileName = path.basename(filePath);
    const uploadedBy = filePath.split('/')[1];
    // Handle ZIP files
    if (fileExtension === 'zip') {
        await processZipFile(object, uploadedBy);
        return;
    }
    // Handle individual files
    await processIndividualFile(object, uploadedBy, fileName, fileExtension);
});
async function processZipFile(object, uploadedBy) {
    const workingDir = path.join(os.tmpdir(), 'zip-processing');
    const zipPath = path.join(workingDir, 'archive.zip');
    try {
        // Create temp directory
        await fs.promises.mkdir(workingDir, { recursive: true });
        // Download zip file
        await storage.bucket(object.bucket).file(object.name).download({
            destination: zipPath
        });
        // Extract and process files
        const directory = await unzipper.Open.file(zipPath);
        for (const entry of directory.files) {
            if (entry.type === 'File') {
                const fileExtension = path.extname(entry.path).toLowerCase().slice(1);
                const typeInfo = FILE_TYPE_MAP[fileExtension];
                if (typeInfo) {
                    const tempFilePath = path.join(workingDir, entry.path);
                    await fs.promises.mkdir(path.dirname(tempFilePath), { recursive: true });
                    // Extract file
                    await new Promise((resolve, reject) => {
                        entry.stream()
                            .pipe(fs.createWriteStream(tempFilePath))
                            .on('error', reject)
                            .on('finish', resolve);
                    });
                    // Upload to appropriate location
                    const destination = `resources/${typeInfo.type}/${uploadedBy}/${(0, uuid_1.v4)()}_${path.basename(entry.path)}`;
                    await storage.bucket(object.bucket).upload(tempFilePath, {
                        destination,
                        metadata: {
                            contentType: `application/${fileExtension}`
                        }
                    });
                    // Create metadata
                    const [downloadUrl] = await storage
                        .bucket(object.bucket)
                        .file(destination)
                        .getSignedUrl({
                        version: 'v4',
                        action: 'read',
                        expires: Date.now() + 7 * 24 * 60 * 60 * 1000
                    });
                    const metadata = {
                        id: (0, uuid_1.v4)(),
                        name: path.basename(entry.path),
                        type: typeInfo.type,
                        subType: typeInfo.subType,
                        size: entry.uncompressedSize || 0,
                        uploadedBy,
                        uploadedAt: admin.firestore.Timestamp.now(),
                        path: destination,
                        bucket: object.bucket,
                        tags: [],
                        extension: fileExtension,
                        downloadUrl,
                        isPublic: false,
                        downloads: 0,
                        version: '1.0.0'
                    };
                    await admin.firestore().collection('resources').add(metadata);
                }
            }
        }
        // Cleanup
        await fs.promises.rm(workingDir, { recursive: true, force: true });
    }
    catch (error) {
        console.error('Error processing zip file:', error);
        throw new Error('Failed to process zip file');
    }
}
exports.proxyMeshyAsset = (0, https_1.onRequest)(async (req, res) => {
    const meshyUrl = req.query.url;
    if (!meshyUrl || !meshyUrl.startsWith('https://assets.meshy.ai/')) {
        res.status(400).send('Invalid Meshy asset URL');
        return;
    }
    try {
        const response = await (0, node_fetch_1.default)(meshyUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch Meshy asset: ${response.statusText}`);
        }
        // Forward the content type
        res.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
        res.set('Access-Control-Allow-Origin', '*');
        // Stream the response with null check
        if (!response.body) {
            throw new Error('No response body received');
        }
        response.body.pipe(res);
    }
    catch (error) {
        console.error('Error proxying Meshy asset:', error);
        res.status(500).send('Failed to proxy Meshy asset');
    }
});
async function processIndividualFile(object, uploadedBy, fileName, fileExtension) {
    const typeInfo = FILE_TYPE_MAP[fileExtension];
    if (!typeInfo)
        return;
    try {
        let downloadUrl;
        let destination;
        // Check if this is a Meshy asset URL
        if (object.name.startsWith('https://assets.meshy.ai/')) {
            // For Meshy assets, we'll use our proxy
            downloadUrl = `${process.env.FUNCTION_URL}/proxyMeshyAsset?url=${encodeURIComponent(object.name)}`;
            destination = object.name; // Keep the original Meshy URL as the path
        }
        else {
            // Handle regular file uploads as before
            destination = `resources/${typeInfo.type}/${uploadedBy}/${(0, uuid_1.v4)()}_${fileName}`;
            await storage.bucket(object.bucket).file(object.name).move(destination);
            [downloadUrl] = await storage
                .bucket(object.bucket)
                .file(destination)
                .getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000
            });
        }
        const metadata = {
            id: (0, uuid_1.v4)(),
            name: fileName,
            type: typeInfo.type,
            subType: typeInfo.subType,
            size: parseInt(String(object.size || '0')),
            uploadedBy,
            uploadedAt: admin.firestore.Timestamp.now(),
            path: destination,
            bucket: object.bucket,
            tags: [],
            extension: fileExtension,
            downloadUrl,
            isPublic: false,
            downloads: 0,
            version: '1.0.0'
        };
        await admin.firestore().collection('resources').add(metadata);
        console.log(`File ${fileName} processed and stored at ${destination}`);
        return { success: true, path: destination };
    }
    catch (error) {
        console.error('Error processing file:', error);
        throw new Error('Failed to process file');
    }
}
//# sourceMappingURL=resources.js.map