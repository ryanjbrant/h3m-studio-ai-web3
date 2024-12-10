import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        role: email === 'ryanjbrant@gmail.com' ? 'admin' : 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const userData = userDoc.data();
    return {
      ...userCredential.user,
      isAdmin: userData?.role === 'admin' || email === 'ryanjbrant@gmail.com'
    };
  } catch (error: any) {
    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('User not found');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password');
    }
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      callback({
        ...user,
        isAdmin: userData?.role === 'admin' || user.email === 'ryanjbrant@gmail.com'
      } as User);
    } else {
      callback(null);
    }
  });
};