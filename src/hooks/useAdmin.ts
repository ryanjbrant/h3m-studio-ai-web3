import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useAdmin = () => {
  const { user } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        setIsAdmin(
          userData?.role === 'admin' || 
          user.email === 'ryanjbrant@gmail.com'
        );
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return {
    isAdmin,
    loading,
    user
  };
};