import React from 'react';
import { Box, Filter, Search } from 'lucide-react';

export const ContentManagement: React.FC = () => {
  return (
    <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Box className="w-5 h-5" />
          Content Management
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search content..."
              className="pl-9 pr-4 py-1.5 bg-[#0a0a0b] border border-[#242429] rounded-lg text-sm"
            />
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button className="p-1.5 hover:bg-[#242429] rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-4">
            <div className="aspect-video bg-[#242429] rounded-lg mb-4" />
            <h3 className="font-medium mb-1">Content Title {i + 1}</h3>
            <p className="text-sm text-gray-400 mb-4">Created by User {i + 1}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">2 days ago</span>
              <button className="text-sm text-blue-500 hover:text-blue-400">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};