import { Timestamp } from 'firebase/firestore';

export interface GenerationData {
  id: string;
  userId: string;
  generationType: 'text' | 'image';
  timestamp: Timestamp;
  expiresAt: Timestamp;
  modelUrls: {
    glb?: string;
    usdz?: string;
    fbx?: string;
  };
  thumbnailUrl?: string;
  prompt?: string;
  status: 'pending' | 'complete' | 'failed';
  progress?: number;
} 