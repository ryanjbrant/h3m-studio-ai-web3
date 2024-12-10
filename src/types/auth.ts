import { User as FirebaseUser } from 'firebase/auth';

export interface AuthUser extends FirebaseUser {
  isAdmin?: boolean;
} 