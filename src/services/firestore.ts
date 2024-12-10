import { 
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface TextureDocument {
  userId: string;
  name: string;
  url: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export const saveTexture = async (textureData: Omit<TextureDocument, 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'textures'), {
      ...textureData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const updateTexture = async (textureId: string, updates: Partial<TextureDocument>) => {
  try {
    const textureRef = doc(db, 'textures', textureId);
    await updateDoc(textureRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    throw error;
  }
};

export const deleteTexture = async (textureId: string) => {
  try {
    const textureRef = doc(db, 'textures', textureId);
    await deleteDoc(textureRef);
  } catch (error) {
    throw error;
  }
};

export const getUserTextures = async (userId: string) => {
  try {
    const texturesQuery = query(
      collection(db, 'textures'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(texturesQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};