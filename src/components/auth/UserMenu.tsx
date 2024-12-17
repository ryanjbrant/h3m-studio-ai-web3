import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, LayoutDashboard, Users, Box, BarChart2, Settings, UserCircle, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Box, label: 'Content', path: '/admin/content' },
  { icon: FileText, label: 'Resources', path: '/admin/resources' },
  { icon: BarChart2, label: 'Analytics', path: '/admin/analytics' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuthStore();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/login');
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#242429] transition-colors"
      >
        <User className="w-4 h-4" />
        <span className="text-sm">{user.email}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#121214] border border-[#242429] rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={() => {
                navigate('/profile');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-[#242429] flex items-center gap-2"
            >
              <UserCircle className="w-4 h-4" />
              Profile
            </button>
          </div>

          {isAdmin && (
            <>
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-gray-400">Admin</p>
              </div>
              {adminMenuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[#242429] flex items-center gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
              <div className="border-t border-[#242429] my-2"></div>
            </>
          )}
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm hover:bg-[#242429] flex items-center gap-2 text-red-500"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};