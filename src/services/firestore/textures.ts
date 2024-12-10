import { 
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { texturesCollection } from './collections';
import { TextureSettings } from '../../types';

export interface TextureDocument {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  settings: TextureSettings;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

export const createTexture = async (data: Omit<TextureDocument, 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(texturesCollection, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating texture:', error);
    throw error;
  }
};

export const getTexture = async (textureId: string) => {
  try {
    const docRef = doc(db, 'textures', textureId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Texture not found');
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as TextureDocument;
  } catch (error) {
    console.error('Error getting texture:', error);
    throw error;
  }
};

export const updateTexture = async (textureId: string, updates: Partial<TextureDocument>) => {
  try {
    const docRef = doc(db, 'textures', textureId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating texture:', error);
    throw error;
  }
};

export const deleteTexture = async (textureId: string) => {
  try {
    const docRef = doc(db, 'textures', textureId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting texture:', error);
    throw error;
  }
};

export const getUserTextures = async (
  userId: string,
  lastDoc?: DocumentSnapshot,
  pageSize: number = 20
) => {
  try {
    let baseQuery = query(
      texturesCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      baseQuery = query(baseQuery, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(baseQuery);
    
    return {
      textures: querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TextureDocument[],
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    };
  } catch (error) {
    console.error('Error getting user textures:', error);
    throw error;
  }
};

export const getPublicTextures = async (
  lastDoc?: DocumentSnapshot,
  pageSize: number = 20
) => {
  try {
    let baseQuery = query(
      texturesCollection,
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      baseQuery = query(baseQuery, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(baseQuery);
    
    return {
      textures: querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TextureDocument[],
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    };
  } catch (error) {
    console.error('Error getting public textures:', error);
    throw error;
  }
};