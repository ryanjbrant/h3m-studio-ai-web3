import React from 'react';
import { Info } from 'lucide-react';

export const StakingInfo: React.FC = () => {
  return (
    <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
      <h3 className="text-lg font-bold mb-6">Staking Info</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            Lock Period
          </h4>
          <p className="text-sm text-gray-400">
            Staked tokens are locked for 14 days. Early unstaking will result in a 10% penalty fee.
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            Rewards
          </h4>
          <p className="text-sm text-gray-400">
            Rewards are distributed daily and can be claimed after a 7-day cooling period.
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            APY Calculation
          </h4>
          <p className="text-sm text-gray-400">
            APY is calculated based on total staked amount and current token price. Rate adjusts dynamically.
          </p>
        </div>
      </div>
    </div>
  );
};