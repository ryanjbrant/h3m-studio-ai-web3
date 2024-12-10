import React, { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#242429] transition-colors"
      >
        <User className="w-4 h-4" />
        <span className="text-sm">{user.email}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#121214] border border-[#242429] rounded-md shadow-lg">
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm hover:bg-[#242429] flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};