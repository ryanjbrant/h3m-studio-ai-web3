import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const AdminHeader: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-[#121214] border-b border-[#242429] fixed top-0 right-0 left-64 z-50">
      <div className="h-full px-8 flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-[#242429] rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-[#242429] rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              {user?.email?.[0].toUpperCase()}
            </div>
            <span className="text-sm">{user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
};