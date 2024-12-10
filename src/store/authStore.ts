import { create } from 'zustand';
import { User } from 'firebase/auth';
import { 
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  signOut as firebaseSignOut,
  signInWithGoogle as firebaseSignInWithGoogle
} from '../services/auth';

interface AuthState {
  user: User | null;
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
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));