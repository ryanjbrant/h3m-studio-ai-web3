import { 
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getUserDocPath } from './collections';

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  website?: string;
  textureCount: number;
  favorites: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const createUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, getUserDocPath(userId));
    await setDoc(userRef, {
      ...data,
      textureCount: 0,
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, getUserDocPath(userId));
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      throw new Error('User profile not found');
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, getUserDocPath(userId));
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const incrementTextureCount = async (userId: string) => {
  try {
    const userRef = doc(db, getUserDocPath(userId));
    await updateDoc(userRef, {
      textureCount: increment(1),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error incrementing texture count:', error);
    throw error;
  }
};

export const addToFavorites = async (userId: string, textureId: string) => {
  try {
    const userRef = doc(db, getUserDocPath(userId));
    await updateDoc(userRef, {
      favorites: arrayUnion(textureId),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (userId: string, textureId: string) => {
  try {
    const userRef = doc(db, getUserDocPath(userId));
    await updateDoc(userRef, {
      favorites: arrayRemove(textureId),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};