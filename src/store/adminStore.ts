import { create } from 'zustand';
import { 
  getAdminStats, 
  getUsersList,
  updateUserRole
} from '../services/admin';
import { AdminUser } from '../types/admin';

interface AdminState {
  stats: {
    activeUsers: number;
    modelsGenerated: number;
    monthlyRevenue: number;
    storageUsed: number;
  };
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: {
    activeUsers: 0,
    modelsGenerated: 0,
    monthlyRevenue: 0,
    storageUsed: 0
  },
  users: [],
  loading: false,
  error: null,
  fetchStats: async () => {
    try {
      set({ loading: true, error: null });
      const stats = await getAdminStats();
      set({ stats, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch stats',
        loading: false 
      });
    }
  },
  fetchUsers: async () => {
    try {
      set({ loading: true, error: null });
      const users = await getUsersList();
      set({ users, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch users',
        loading: false
      });
    }
  },
  updateUserRole: async (userId: string, role: string) => {
    try {
      set({ loading: true, error: null });
      await updateUserRole(userId, role);
      const users = await getUsersList();
      set({ users, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update user role',
        loading: false
      });
    }
  }
}));