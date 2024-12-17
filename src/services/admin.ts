import { 
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  Timestamp,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AdminUser, GenerationData, AdminUserData } from '../types/admin'; // Import AdminUser type

export interface AdminStats {
  activeUsers: number;
  modelsGenerated: number;
  monthlyRevenue: number;
  storageUsed: number;
}

export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const statsRef = doc(db, 'admin', 'stats');
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      throw new Error('Stats not found');
    }

    return statsDoc.data() as AdminStats;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

export const getUsersList = async (): Promise<AdminUser[]> => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      email: doc.data().email,
      role: doc.data().role || 'user',
      disabled: doc.data().disabled || false,
      ...doc.data()
    })) as AdminUser[];
  } catch (error) {
    console.error('Error fetching users list:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 
      role,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const getStorageStats = async () => {
  try {
    const statsRef = doc(db, 'admin', 'storage');
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      throw new Error('Storage stats not found');
    }

    return statsDoc.data();
  } catch (error) {
    console.error('Error fetching storage stats:', error);
    throw error;
  }
};

const GENERATIONS_PER_PAGE = 20;

interface GenerationFilters {
  userId?: string;
  type?: 'text' | 'image';
  status?: 'pending' | 'complete' | 'failed';
  limit?: number;
}

export const getGenerations = async (lastTimestamp?: Timestamp, filters: GenerationFilters = {}) => {
  try {
    let q = query(
      collection(db, 'generations'),
      orderBy('timestamp', 'desc'),
      limit(GENERATIONS_PER_PAGE)
    );

    if (lastTimestamp) {
      q = query(q, startAfter(lastTimestamp));
    }

    if (filters?.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }

    if (filters?.type) {
      q = query(q, where('generationType', '==', filters.type));
    }

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GenerationData[];
  } catch (error) {
    console.error('Error fetching generations:', error);
    throw error;
  }
};

export async function getUsersWithGenerations(lastUserId?: string) {
  try {
    let q = query(
      collection(db, 'users'),
      where('generationMetrics.totalGenerations', '>', 0),
      orderBy('generationMetrics.totalGenerations', 'desc'),
      limit(GENERATIONS_PER_PAGE)
    );

    if (lastUserId) {
      const lastDocRef = doc(db, 'users', lastUserId);
      const lastUserDoc = await getDoc(lastDocRef);
      q = query(q, startAfter(lastUserDoc));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AdminUserData[];
  } catch (error) {
    console.error('Error fetching users with generations:', error);
    throw error;
  }
}

export async function deleteGeneration(generationId: string) {
  try {
    await deleteDoc(doc(db, 'generations', generationId));
  } catch (error) {
    console.error('Error deleting generation:', error);
    throw error;
  }
}

export async function getUserGenerationStats(userId: string) {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data() as AdminUserData;
    
    const recentGenerationsQuery = query(
      collection(db, 'generations'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    
    const recentGenerations = await getDocs(recentGenerationsQuery);
    
    return {
      metrics: userData.generationMetrics,
      recentGenerations: recentGenerations.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GenerationData[]
    };
  } catch (error) {
    console.error('Error fetching user generation stats:', error);
    throw error;
  }
}

export async function getUserGenerations(userId: string, lastDocId?: string | null) {
  try {
    let q = query(
      collection(db, 'generations'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(12)
    );

    if (lastDocId) {
      const lastDoc = await getDoc(doc(db, 'generations', lastDocId));
      if (lastDoc.exists()) {
        q = query(q, startAfter(lastDoc));
      }
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GenerationData[];
  } catch (error) {
    console.debug('No generations found:', error);
    return [];
  }
}