import { create } from 'zustand';
import { User } from 'firebase/auth';
import { 
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  signOut as firebaseSignOut,
  signInWithGoogle as firebaseSignInWithGoogle
} from '../services/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AuthState {
  user: (User & { isAdmin?: boolean }) | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const user = await firebaseSignIn(email, password);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        (user as any).isAdmin = userData?.role === 'admin' || user.email === 'ryanjbrant@gmail.com';
      }
      set({ user, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  signUp: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const user = await firebaseSignUp(email, password);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        (user as any).isAdmin = userData?.role === 'admin' || user.email === 'ryanjbrant@gmail.com';
      }
      set({ user, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      const user = await firebaseSignInWithGoogle();
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        (user as any).isAdmin = userData?.role === 'admin' || user.email === 'ryanjbrant@gmail.com';
      }
      set({ user, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      await firebaseSignOut();
      set({ user: null, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  setUser: async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      (user as any).isAdmin = userData?.role === 'admin' || user.email === 'ryanjbrant@gmail.com';
    }
    set({ user });
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));