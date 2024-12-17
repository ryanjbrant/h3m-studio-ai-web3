import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, query, where, getDocs, deleteDoc, Timestamp, getDoc, orderBy, doc, setDoc } from 'firebase/firestore';
import { storage, db } from '../config/firebase';
import { GenerationData } from '../types/generation';
import { MeshyPreviewTask } from '../types/meshy';
import { proxyFetchModel } from './meshyApi';

interface GenerationMetadata {
  userId: string;
  generationType: 'text' | 'image';
  prompt?: string;
  modelUrls: { [key: string]: string };
  thumbnailUrl?: string;
  status: string;
  timestamp: Date;
  expiresAt: Date;
}

export async function saveGeneration(
  userId: string,
  task: MeshyPreviewTask,
  generationType: 'text' | 'image',
  prompt?: string
) {
  try {
    console.log('Saving generation:', { userId, task, generationType });

    // Only save GLB file initially since it's self-contained and used for preview
    const modelUrls: { [key: string]: string } = {};
    const glbUrl = task.model_urls.glb;
    if (glbUrl) {
      console.log('Downloading GLB model from:', glbUrl);
      const modelData = await proxyFetchModel(glbUrl);
      
      const modelPath = `models/${userId}/${task.id}/glb`;
      console.log('Uploading to path:', modelPath);
      
      const modelRef = ref(storage, modelPath);
      await uploadBytes(modelRef, modelData);
      const downloadUrl = await getDownloadURL(modelRef);
      modelUrls.glb = downloadUrl;
    }

    // Download and upload thumbnail if available
    let thumbnailUrl = '';
    if (task.thumbnail_url) {
      console.log('Downloading thumbnail from:', task.thumbnail_url);
      const thumbnailResponse = await fetch(`http://localhost:3001/api/model?url=${encodeURIComponent(task.thumbnail_url)}`);
      const thumbnailBlob = await thumbnailResponse.blob();
      
      const thumbnailPath = `thumbnails/${userId}/${task.id}`;
      console.log('Uploading thumbnail to path:', thumbnailPath);
      
      const thumbnailRef = ref(storage, thumbnailPath);
      await uploadBytes(thumbnailRef, thumbnailBlob);
      thumbnailUrl = await getDownloadURL(thumbnailRef);
    }

    // Save metadata to Firestore with proper timestamp handling
    const generationRef = doc(db, 'generations', task.id);
    const timestamp = Timestamp.now();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days
    
    await setDoc(generationRef, {
      id: task.id,
      userId,
      generationType,
      prompt,
      modelUrls,
      thumbnailUrl,
      status: task.status,
      timestamp,
      expiresAt
    });

    // Update user metrics
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
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
    metrics.lastGenerationDate = timestamp;
    metrics.generationsByType[generationType] += 1;

    await setDoc(userRef, { 
      generationMetrics: metrics,
      updatedAt: timestamp
    }, { merge: true });

    console.log('Generation saved successfully');
  } catch (error) {
    console.error('Error saving generation:', error);
    throw error;
  }
}

export async function getUserGenerations(userId: string): Promise<GenerationData[]> {
  try {
    const q = query(
      collection(db, 'generations'),
      where('userId', '==', userId),
      where('expiresAt', '>', Timestamp.now()),
      orderBy('expiresAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GenerationData[];
  } catch (error) {
    console.error('Error fetching user generations:', error);
    throw error;
  }
}

export async function deleteExpiredGenerations() {
  try {
    const q = query(
      collection(db, 'generations'),
      where('expiresAt', '<=', Timestamp.now())
    );

    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(async (doc) => {
      const data = doc.data() as GenerationMetadata;
      
      // Delete files from storage
      const deleteFilePromises = [];
      for (const url of Object.values(data.modelUrls)) {
        const fileRef = ref(storage, url);
        deleteFilePromises.push(deleteObject(fileRef));
      }
      
      if (data.thumbnailUrl) {
        const fileRef = ref(storage, data.thumbnailUrl);
        deleteFilePromises.push(deleteObject(fileRef));
      }

      await Promise.all(deleteFilePromises);
      await deleteDoc(doc.ref);
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting expired generations:', error);
    throw error;
  }
}

export async function deleteGeneration(userId: string, generationId: string) {
  try {
    // Get the generation data first
    const generationRef = doc(db, 'generations', generationId);
    const generationDoc = await getDoc(generationRef);
    const generationData = generationDoc.data();

    if (!generationData) {
      throw new Error('Generation not found');
    }

    // Check if user owns this generation
    if (generationData.userId !== userId) {
      throw new Error('Unauthorized to delete this generation');
    }

    // Delete files from storage
    const deletePromises = [];

    // Delete model files
    for (const url of Object.values(generationData.modelUrls)) {
      if (url && typeof url === 'string') {
        const fileRef = ref(storage, url);
        deletePromises.push(deleteObject(fileRef));
      }
    }

    // Delete thumbnail
    if (generationData.thumbnailUrl) {
      const thumbnailRef = ref(storage, generationData.thumbnailUrl);
      deletePromises.push(deleteObject(thumbnailRef));
    }

    // Wait for all files to be deleted
    await Promise.all(deletePromises);

    // Delete the Firestore document
    await deleteDoc(generationRef);

    // Update user metrics
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() || {};
    
    if (userData.generationMetrics) {
      const metrics = userData.generationMetrics;
      metrics.totalGenerations = Math.max(0, metrics.totalGenerations - 1);
      metrics.generationsByType[generationData.generationType] = 
        Math.max(0, metrics.generationsByType[generationData.generationType] - 1);

      await setDoc(userRef, { 
        generationMetrics: metrics,
        updatedAt: Timestamp.now()
      }, { merge: true });
    }

  } catch (error) {
    console.error('Error deleting generation:', error);
    throw error;
  }
}