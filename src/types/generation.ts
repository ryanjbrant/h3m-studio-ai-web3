import { Timestamp } from 'firebase/firestore';

export interface GenerationData {
  id: string;
  userId: string;
  generationType: string;
  timestamp: Timestamp;
  expiresAt: Timestamp;
  modelUrls: Record<string, string>;
  thumbnailUrl?: string;
  prompt?: string;
  status: 'pending' | 'completed' | 'failed';
} 