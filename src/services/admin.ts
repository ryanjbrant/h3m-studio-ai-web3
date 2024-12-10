import { 
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const getAdminStats = async () => {
  try {
    const statsRef = doc(db, 'admin', 'stats');
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      throw new Error('Stats not found');
    }

    return statsDoc.data();
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

export const getUsersList = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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