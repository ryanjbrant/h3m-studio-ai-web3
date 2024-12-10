import { nanoid } from 'nanoid';
import { uploadTextureToFirebase, uploadTextureToS3 } from './storage';
import { saveTexture } from './firestore';
import { TextureSettings } from '../types';

export interface UploadOptions {
  storageProvider: 'firebase' | 's3';
  generateThumbnail?: boolean;
  preserveOriginalName?: boolean;
}

export interface UploadResult {
  url: string;
  key: string;
  thumbnailUrl?: string;
}

export const uploadTexture = async (
  file: File,
  userId: string,
  settings: TextureSettings,
  options: UploadOptions
): Promise<UploadResult> => {
  try {
    // Validate file
    validateFile(file);

    // Generate unique filename
    const filename = options.preserveOriginalName 
      ? file.name 
      : `${nanoid()}_${file.name}`;

    // Upload to selected storage provider
    const url = await (options.storageProvider === 'firebase'
      ? uploadTextureToFirebase(file, userId)
      : uploadTextureToS3(file, userId));

    // Save metadata to Firestore
    await saveTexture({
      userId,
      name: file.name,
      url,
      settings
    });

    return {
      url,
      key: filename
    };
  } catch (error) {
    console.error('Error uploading texture:', error);
    throw new Error('Failed to upload texture');
  }
};

export const validateFile = (file: File) => {
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/tiff'
  ];

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`
    );
  }

  if (file.size > MAX_SIZE) {
    throw new Error(`File size must be less than ${MAX_SIZE / 1024 / 1024}MB`);
  }
};