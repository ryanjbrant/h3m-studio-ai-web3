"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertUsdzToGlb = exports.saveScene = exports.onGenerationCreated = exports.cleanupExpiredGenerations = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-functions/v2/firestore");
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const os = require("os");
const path = require("path");
const fs = require("fs");
const Busboy = require("busboy");
const storage_1 = require("@google-cloud/storage");
admin.initializeApp();
const db = admin.firestore();
const storage = new storage_1.Storage();
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
                        const path = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
                        const fileRef = storage.bucket().file(path);
                        deletePromises.push(fileRef.delete().then(() => { }).catch(() => { }));
                    }
                });
            }
            if (data.thumbnailUrl) {
                const path = decodeURIComponent(data.thumbnailUrl.split('/o/')[1].split('?')[0]);
                const fileRef = storage.bucket().file(path);
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
exports.convertUsdzToGlb = functions.runWith({
    timeoutSeconds: 540,
    memory: '2GB',
}).https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const busboy = Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();
    const uploads = {};
    busboy.on('file', (fieldname, file, { filename }) => {
        if (!filename)
            return;
        const filepath = path.join(tmpdir, filename);
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
            // Generate unique output path
            const outputFilename = path.basename(inputFile, '.usdz') + '.glb';
            const bucket = storage.bucket('your-firebase-storage-bucket');
            // Upload the input file to Cloud Storage
            await bucket.upload(inputFile, {
                destination: `conversions/input/${path.basename(inputFile)}`,
            });
            // Here we would typically trigger a Cloud Run service to do the actual conversion
            // For now, we'll return a placeholder response
            res.json({
                message: 'File uploaded successfully',
                originalName: path.basename(inputFile),
                convertedName: outputFilename,
            });
            // Clean up
            Object.values(uploads).forEach(filepath => {
                fs.unlinkSync(filepath);
            });
        }
        catch (error) {
            console.error('Error processing file:', error);
            res.status(500).send('Error processing file');
        }
    });
    busboy.end(req.rawBody);
});
//# sourceMappingURL=index.js.map