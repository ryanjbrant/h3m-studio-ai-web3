import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Box, 
  BarChart2, 
  FileText,
  Settings,
  Shield,
  Database
} from 'lucide-react';

const menuItems = [
  { icon: BarChart2, label: 'Overview', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Box, label: '3D Content', path: '/admin/content' },
  { icon: FileText, label: 'Resources', path: '/admin/resources' },
  { icon: Database, label: 'Storage', path: '/admin/storage' },
  { icon: Shield, label: 'Security', path: '/admin/security' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' }
];

export const AdminSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#121214] border-r border-[#242429] fixed top-0 left-0 h-screen">
      <div className="p-6">
        <Link to="/" className="text-xl font-bold">H3M Studio</Link>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-[#242429] text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1f]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};