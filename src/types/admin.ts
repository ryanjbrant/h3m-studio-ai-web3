import { Timestamp } from 'firebase/firestore';

export interface AdminUser {
    id: string;
    email: string;
    role: string;
    disabled: boolean;
    walletConnected: boolean;
    downloads: number;
    lastVisit?: Date;
    createdAt?: Date;
  }
  
  export interface AdminStats {
    activeUsers: number;
    modelsGenerated: number;
    monthlyRevenue: number;
    storageUsed: number;
  }

export interface UserGenerationMetrics {
  totalGenerations: number;
  lastGenerationDate: Timestamp | null;
  generationsByType: {
    text: number;
    image: number;
  };
}

export interface GenerationData {
  id: string;
  userId: string;
  generationType: 'text' | 'image';
  prompt?: string;
  timestamp: Timestamp;
  modelUrls: {
    glb?: string;
    usdz?: string;
    fbx?: string;
  };
  thumbnailUrl?: string;
  status: 'pending' | 'complete' | 'failed';
  progress?: number;
  expiresAt: Timestamp;
}

export interface AdminUserData {
  id: string;
  email: string;
  displayName?: string;
  generationMetrics?: UserGenerationMetrics;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

export interface SceneData {
  id: string;
  userId: string;
  name: string;
  data: {
    objects: Array<{
      id: string;
      type: string;
      position: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number, number];
      modelUrl?: string;
    }>;
    lights: Array<{
      id: string;
      type: string;
      position: [number, number, number];
      intensity: number;
      color: string;
    }>;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}