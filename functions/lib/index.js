"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertUsdzToGlb = exports.saveScene = exports.onGenerationCreated = exports.cleanupExpiredGenerations = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-functions/v2/firestore");
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const os = require("os");
const path = require("path");
const fs = require("fs");
const Busboy = require("busboy");
const storage_1 = require("@google-cloud/storage");
const https_2 = require("firebase-functions/v2/https");
// Initialize Firebase Admin only if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        storageBucket: 'h3m-studio-b17e2.appspot.com'
    });
}
const db = admin.firestore();
const storage = new storage_1.Storage();
const bucket = storage.bucket('h3m-studio-b17e2.appspot.com');
exports.cleanupExpiredGenerations = (0, scheduler_1.onSchedule)('0 0 * * *', async (event) => {
    const now = admin.firestore.Timestamp.now();
    try {
        const snapshot = await db
            .collection('generations')
            .where('expiresAt', '<=', now)
            .get();
        const batch = db.batch();
        const deletePromises = [];
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            // Delete files from storage
            if (data.modelUrls) {
                Object.values(data.modelUrls).forEach(url => {
                    if (typeof url === 'string') {
                        const filePath = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
                        const fileRef = bucket.file(filePath);
                        deletePromises.push(fileRef.delete().then(() => { }).catch(() => { }));
                    }
                });
            }
            if (data.thumbnailUrl) {
                const filePath = decodeURIComponent(data.thumbnailUrl.split('/o/')[1].split('?')[0]);
                const fileRef = bucket.file(filePath);
                deletePromises.push(fileRef.delete().then(() => { }).catch(() => { }));
            }
            // Delete Firestore document
            batch.delete(doc.ref);
        });
        // Execute all deletions
        await Promise.all([
            batch.commit(),
            ...deletePromises
        ]);
        console.log(`Cleaned up ${snapshot.size} expired generations`);
    }
    catch (error) {
        console.error('Error cleaning up expired generations:', error);
        throw error;
    }
});
// Function to track user generation metrics
exports.onGenerationCreated = (0, firestore_1.onDocumentCreated)('generations/{generationId}', async (event) => {
    var _a;
    const generation = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!generation)
        return;
    const userId = generation.userId;
    try {
        // Update user metrics
        const userRef = db.collection('users').doc(userId);
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            const userData = userDoc.data() || {};
            const metrics = userData.generationMetrics || {
                totalGenerations: 0,
                lastGenerationDate: null,
                generationsByType: {
                    text: 0,
                    image: 0
                }
            };
            metrics.totalGenerations += 1;
            metrics.lastGenerationDate = generation.timestamp;
            metrics.generationsByType[generation.generationType] += 1;
            transaction.set(userRef, { generationMetrics: metrics }, { merge: true });
        });
    }
    catch (error) {
        console.error('Error updating user metrics:', error);
        throw error;
    }
});
// Function to handle scene saving
exports.saveScene = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new Error('Must be logged in to save scenes');
    }
    const { sceneData, name } = request.data;
    const userId = request.auth.uid;
    try {
        // Save scene to Firestore
        const sceneRef = await db.collection('scenes').add({
            userId,
            name,
            data: sceneData,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
        });
        return { sceneId: sceneRef.id };
    }
    catch (error) {
        console.error('Error saving scene:', error);
        throw new Error('Error saving scene');
    }
});
exports.convertUsdzToGlb = (0, https_2.onRequest)({
    memory: '1GiB',
    timeoutSeconds: 540
}, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const busboy = Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();
    const uploads = {};
    busboy.on('file', (fieldname, file, info) => {
        if (!info.filename)
            return;
        const filepath = path.join(tmpdir, info.filename);
        uploads[fieldname] = filepath;
        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);
    });
    busboy.on('finish', async () => {
        const inputFile = uploads['file'];
        if (!inputFile) {
            res.status(400).send('No file uploaded');
            return;
        }
        try {
            // Generate unique filenames
            const timestamp = Date.now();
            const inputFilename = `${timestamp}-${path.basename(inputFile)}`;
            const outputFilename = `${timestamp}-${path.basename(inputFile, '.usdz')}.glb`;
            // Upload the input file to Cloud Storage
            await bucket.upload(inputFile, {
                destination: `conversions/input/${inputFilename}`,
                metadata: {
                    contentType: 'model/vnd.usdz+zip'
                }
            });
            // Get signed URLs for input and output
            const [inputUrl] = await bucket.file(`conversions/input/${inputFilename}`).getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 15 * 60 * 1000 // 15 minutes
            });
            // Call the Cloud Run service for conversion
            const cloudRunUrl = process.env.CONVERSION_SERVICE_URL;
            if (!cloudRunUrl) {
                throw new Error('CONVERSION_SERVICE_URL environment variable not set');
            }
            const response = await fetch(cloudRunUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputUrl,
                    outputBucket: bucket.name,
                    outputPath: `conversions/output/${outputFilename}`
                })
            });
            if (!response.ok) {
                throw new Error(`Conversion service returned status ${response.status}`);
            }
            // Get signed URL for the converted file
            const [outputUrl] = await bucket.file(`conversions/output/${outputFilename}`).getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
            });
            res.json({
                message: 'File converted successfully',
                originalName: path.basename(inputFile),
                convertedName: outputFilename,
                downloadUrl: outputUrl
            });
            // Clean up temporary files
            Object.values(uploads).forEach(filepath => {
                fs.unlinkSync(filepath);
            });
        }
        catch (error) {
            console.error('Error processing file:', error);
            res.status(500).send('Error processing file');
        }
    });
    if (req.rawBody) {
        busboy.end(req.rawBody);
    }
});
__exportStar(require("./resources"), exports);
//# sourceMappingURL=index.js.map