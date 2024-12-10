import { collection } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Define collection references
export const texturesCollection = collection(db, 'textures');
export const usersCollection = collection(db, 'users');
export const projectsCollection = collection(db, 'projects');
export const settingsCollection = collection(db, 'settings');

// Collection path helpers
export const getTextureDocPath = (textureId: string) => `textures/${textureId}`;
export const getUserDocPath = (userId: string) => `users/${userId}`;
export const getProjectDocPath = (projectId: string) => `projects/${projectId}`;
export const getSettingsDocPath = (settingsId: string) => `settings/${settingsId}`;