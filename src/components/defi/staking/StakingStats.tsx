import React from 'react';
import { TrendingUp, Users, Clock } from 'lucide-react';

export const StakingStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[#121214] border border-[#242429] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h4 className="font-medium">TVL</h4>
        </div>
        <p className="text-2xl font-bold">$2.5M</p>
        <p className="text-sm text-gray-400">+15.3% this week</p>
      </div>

      <div className="bg-[#121214] border border-[#242429] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-blue-500" />
          <h4 className="font-medium">Stakers</h4>
        </div>
        <p className="text-2xl font-bold">1,234</p>
        <p className="text-sm text-gray-400">+52 this week</p>
      </div>

      <div className="bg-[#121214] border border-[#242429] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <h4 className="font-medium">Avg Lock Time</h4>
        </div>
        <p className="text-2xl font-bold">45 days</p>
        <p className="text-sm text-gray-400">+5 days vs last week</p>
      </div>
    </div>
  );
};