import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Box, 
  Settings as SettingsIcon,
  BarChart2,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Box, label: 'Generations', path: '/admin/generations' },
  { icon: BarChart2, label: 'Analytics', path: '/admin/analytics' },
  { icon: SettingsIcon, label: 'Settings', path: '/admin/settings' }
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { signOut } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Side Navigation */}
      <div className="fixed left-0 top-0 w-64 h-screen bg-[#121214] border-r border-[#242429] pt-16">
        <nav className="p-4 flex flex-col h-full">
          <div className="flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-1 transition-colors ${
                    isActive 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-400 hover:bg-[#242429]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-[#242429] rounded-lg transition-colors mt-auto"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};