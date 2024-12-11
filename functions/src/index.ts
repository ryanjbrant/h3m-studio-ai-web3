import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

export const cleanupExpiredGenerations = onSchedule('0 0 * * *', async (event) => {
  const now = admin.firestore.Timestamp.now();
  
  try {
    const snapshot = await db
      .collection('generations')
      .where('expiresAt', '<=', now)
      .get();

    const batch = db.batch();
    const deletePromises: Promise<void>[] = [];

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Delete files from storage
      if (data.modelUrls) {
        Object.values(data.modelUrls).forEach(url => {
          if (typeof url === 'string') {
            const path = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
            const fileRef = storage.bucket().file(path);
            deletePromises.push(fileRef.delete().then(() => {}).catch(() => {}));
          }
        });
      }

      if (data.thumbnailUrl) {
        const path = decodeURIComponent(data.thumbnailUrl.split('/o/')[1].split('?')[0]);
        const fileRef = storage.bucket().file(path);
        deletePromises.push(fileRef.delete().then(() => {}).catch(() => {}));
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
  } catch (error) {
    console.error('Error cleaning up expired generations:', error);
    throw error;
  }
});

// Function to track user generation metrics
export const onGenerationCreated = onDocumentCreated('generations/{generationId}', async (event) => {
  const generation = event.data?.data();
  if (!generation) return;
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
  } catch (error) {
    console.error('Error updating user metrics:', error);
    throw error;
  }
});

// Function to handle scene saving
export const saveScene = onCall(async (request) => {
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
  } catch (error) {
    console.error('Error saving scene:', error);
    throw new Error('Error saving scene');
  }
}); 