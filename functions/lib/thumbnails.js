"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateThumbnail = void 0;
const storage_1 = require("firebase-functions/v2/storage");
const admin = require("firebase-admin");
const storage_2 = require("@google-cloud/storage");
const sharp = require("sharp");
const path = require("path");
const os = require("os");
const fs = require("fs");
const storage = new storage_2.Storage();
const THUMB_MAX_WIDTH = 400;
const THUMB_MAX_HEIGHT = 400;
exports.generateThumbnail = (0, storage_1.onObjectFinalized)({
    memory: '1GiB',
    timeoutSeconds: 540,
    cpu: 1
}, async (event) => {
    var _a;
    const object = event.data;
    if (!object.name)
        return;
    const filePath = object.name;
    const fileName = path.basename(filePath);
    const fileExtension = ((_a = fileName.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    const contentType = object.contentType || '';
    // Check if this is an image that needs a thumbnail
    if (!contentType.startsWith('image/') && !['glb', 'gltf', 'obj'].includes(fileExtension)) {
        return;
    }
    const workingDir = path.join(os.tmpdir(), 'thumbnails');
    const tmpFilePath = path.join(workingDir, fileName);
    // Create the temp directory
    await fs.promises.mkdir(workingDir, { recursive: true });
    // Download file from bucket
    const bucket = storage.bucket(object.bucket);
    await bucket.file(filePath).download({
        destination: tmpFilePath
    });
    try {
        let thumbnailPath;
        if (contentType.startsWith('image/')) {
            // Process image files
            const thumbFileName = `thumb_${fileName}`;
            thumbnailPath = path.join(workingDir, thumbFileName);
            // Generate thumbnail using sharp
            await sharp(tmpFilePath)
                .resize(THUMB_MAX_WIDTH, THUMB_MAX_HEIGHT, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .toFile(thumbnailPath);
        }
        else if (['glb', 'gltf', 'obj'].includes(fileExtension)) {
            // For 3D models, use a placeholder for now
            thumbnailPath = path.join(__dirname, '../assets/model-placeholder.png');
        }
        else {
            return;
        }
        // Upload thumbnail to storage
        const thumbDestination = `thumbnails/${path.dirname(filePath)}/${path.basename(thumbnailPath)}`;
        await bucket.upload(thumbnailPath, {
            destination: thumbDestination,
            metadata: {
                contentType: 'image/png',
                metadata: {
                    originalFile: filePath
                }
            }
        });
        // Get thumbnail URL
        const [thumbnailUrl] = await bucket
            .file(thumbDestination)
            .getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        // Update Firestore metadata with thumbnail URL
        const resourcesSnapshot = await admin.firestore()
            .collection('resources')
            .where('path', '==', filePath)
            .get();
        if (!resourcesSnapshot.empty) {
            const resourceDoc = resourcesSnapshot.docs[0];
            await resourceDoc.ref.update({
                thumbnailUrl
            });
        }
        // Cleanup
        await fs.promises.unlink(tmpFilePath);
        if (thumbnailPath !== tmpFilePath) {
            await fs.promises.unlink(thumbnailPath);
        }
        await fs.promises.rmdir(workingDir);
        console.log(`Generated thumbnail for ${filePath}`);
        return { success: true, thumbnailUrl };
    }
    catch (error) {
        console.error('Error generating thumbnail:', error);
        throw new Error('Error generating thumbnail');
    }
});
//# sourceMappingURL=thumbnails.js.map