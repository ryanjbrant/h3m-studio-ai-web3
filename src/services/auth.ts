import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const googleProvider = new GoogleAuthProvider();

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      displayName: '',
      bio: '',
      website: '',
      textureCount: 0,
      favorites: [],
      walletConnected: false,
      downloads: 0,
      lastVisit: new Date()
    });
    return userCredential.user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        role: result.user.email === 'ryanjbrant@gmail.com' ? 'admin' : 'user',
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        createdAt: new Date(),
        updatedAt: new Date(),
        bio: '',
        website: '',
        textureCount: 0,
        favorites: [],
        walletConnected: false,
        downloads: 0,
        lastVisit: new Date()
      });
    }

    return result.user;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        role: email === 'ryanjbrant@gmail.com' ? 'admin' : 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        displayName: '',
        bio: '',
        website: '',
        textureCount: 0,
        favorites: [],
        walletConnected: false,
        downloads: 0,
        lastVisit: new Date()
      });
    } else {
      // Update last visit
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        lastVisit: new Date()
      }, { merge: true });
    }

    const userData = userDoc.exists() ? userDoc.data() : { role: 'user' };
    Object.defineProperty(userCredential.user, 'isAdmin', {
      get: () => userData.role === 'admin' || email === 'ryanjbrant@gmail.com'
    });

    return userCredential.user;
  } catch (error) {
    console.error('Sign in error:', error);
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
      const isAdmin = userData?.role === 'admin' || user.email === 'ryanjbrant@gmail.com';
      
      Object.defineProperty(user, 'isAdmin', {
        get: () => isAdmin
      });

      // Update last visit
      await setDoc(doc(db, 'users', user.uid), {
        lastVisit: new Date()
      }, { merge: true });
    }
    callback(user);
  });
};