import { useState, useCallback } from 'react';
import { DocumentSnapshot } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import * as textureService from '../services/firestore/textures';
import * as userService from '../services/firestore/users';
import { TextureDocument } from '../services/firestore/textures';
import { UserProfile } from '../services/firestore/users';

interface FirestoreState {
  loading: boolean;
  error: Error | null;
  lastDoc: DocumentSnapshot | null;
}

export const useFirestore = () => {
  const [state, setState] = useState<FirestoreState>({
    loading: false,
    error: null,
    lastDoc: null
  });

  const { user } = useAuthStore();

  const handleError = (error: unknown) => {
    console.error('Firestore operation failed:', error);
    setState(prev => ({
      ...prev,
      loading: false,
      error: error instanceof Error ? error : new Error('Operation failed')
    }));
  };

  const createTexture = useCallback(async (
    data: Omit<TextureDocument, 'createdAt' | 'updatedAt' | 'userId'>
  ) => {
    if (!user) throw new Error('User must be authenticated');

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const textureId = await textureService.createTexture({
        ...data,
        userId: user.uid
      });
      await userService.incrementTextureCount(user.uid);
      setState(prev => ({ ...prev, loading: false }));
      return textureId;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [user]);

  const getUserTextures = useCallback(async (pageSize?: number) => {
    if (!user) throw new Error('User must be authenticated');

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await textureService.getUserTextures(
        user.uid,
        state.lastDoc,
        pageSize
      );
      setState(prev => ({
        ...prev,
        loading: false,
        lastDoc: result.lastDoc
      }));
      return result.textures;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [user, state.lastDoc]);

  const resetPagination = useCallback(() => {
    setState(prev => ({ ...prev, lastDoc: null }));
  }, []);

  return {
    ...state,
    createTexture,
    getUserTextures,
    resetPagination,
    updateTexture: textureService.updateTexture,
    deleteTexture: textureService.deleteTexture,
    getPublicTextures: textureService.getPublicTextures,
    getUserProfile: userService.getUserProfile,
    updateUserProfile: userService.updateUserProfile,
    addToFavorites: userService.addToFavorites,
    removeFromFavorites: userService.removeFromFavorites
  };
};