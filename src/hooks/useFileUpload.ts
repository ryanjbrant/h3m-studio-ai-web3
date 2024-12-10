import { useState } from 'react';
import { uploadTexture, UploadOptions, UploadResult } from '../services/upload';
import { TextureSettings } from '../types';
import { useAuthStore } from '../store/authStore';

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

export const useFileUpload = () => {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null
  });

  const { user } = useAuthStore();

  const upload = async (
    file: File,
    settings: TextureSettings,
    options: UploadOptions
  ): Promise<UploadResult | null> => {
    if (!user) {
      setState({ ...state, error: 'User must be authenticated to upload' });
      return null;
    }

    try {
      setState({ uploading: true, progress: 0, error: null });

      const result = await uploadTexture(file, user.uid, settings, options);

      setState({ uploading: false, progress: 100, error: null });
      return result;
    } catch (error) {
      setState({
        uploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
      return null;
    }
  };

  const resetState = () => {
    setState({ uploading: false, progress: 0, error: null });
  };

  return {
    ...state,
    upload,
    resetState
  };
};