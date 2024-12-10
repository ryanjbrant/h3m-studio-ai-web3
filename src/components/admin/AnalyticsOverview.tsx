import React from 'react';
import { Users, Box, ArrowUp, DollarSign } from 'lucide-react';

export const AnalyticsOverview: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <Users className="w-8 h-8 text-blue-500" />
          <span className="text-sm text-green-500 flex items-center gap-1">
            <ArrowUp className="w-4 h-4" />
            12%
          </span>
        </div>
        <h3 className="text-2xl font-bold mb-1">2,543</h3>
        <p className="text-sm text-gray-400">Active Users</p>
      </div>

      <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <Box className="w-8 h-8 text-purple-500" />
          <span className="text-sm text-green-500 flex items-center gap-1">
            <ArrowUp className="w-4 h-4" />
            8%
          </span>
        </div>
        <h3 className="text-2xl font-bold mb-1">12,721</h3>
        <p className="text-sm text-gray-400">3D Models Generated</p>
      </div>

      <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <DollarSign className="w-8 h-8 text-green-500" />
          <span className="text-sm text-green-500 flex items-center gap-1">
            <ArrowUp className="w-4 h-4" />
            15%
          </span>
        </div>
        <h3 className="text-2xl font-bold mb-1">$45,242</h3>
        <p className="text-sm text-gray-400">Monthly Revenue</p>
      </div>

      <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <Box className="w-8 h-8 text-orange-500" />
          <span className="text-sm text-green-500 flex items-center gap-1">
            <ArrowUp className="w-4 h-4" />
            5%
          </span>
        </div>
        <h3 className="text-2xl font-bold mb-1">85.2 TB</h3>
        <p className="text-sm text-gray-400">Storage Used</p>
      </div>
    </div>
  );
};