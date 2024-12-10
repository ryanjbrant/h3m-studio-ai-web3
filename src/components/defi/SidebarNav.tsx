import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  icon: LucideIcon;
  label: string;
  id: string;
  isActive?: boolean;
  hasNew?: boolean;
  onClick?: () => void;
}

interface SidebarNavProps {
  items: NavItem[];
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ items }) => {
  return (
    <nav className="space-y-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={item.onClick}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            item.isActive
              ? 'bg-[#242429] text-white'
              : 'text-gray-400 hover:bg-[#242429] hover:text-white'
          }`}
        >
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
          {item.hasNew && (
            <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
              New
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};