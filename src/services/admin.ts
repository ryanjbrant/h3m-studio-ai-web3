import { 
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AdminUser } from '../types/admin'; // Import AdminUser type

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