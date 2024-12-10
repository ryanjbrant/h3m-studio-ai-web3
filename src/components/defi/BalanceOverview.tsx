import React from 'react';
import { BalanceChart } from './BalanceChart';

interface BalanceOverviewProps {
  balance: number;
  change: number;
  profit: number;
}

export const BalanceOverview: React.FC<BalanceOverviewProps> = ({
  balance,
  change,
  profit,
}) => {
  return (
    <div className="bg-[#121214] border border-[#242429] rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Total Staked</h2>
        <div className="flex items-baseline gap-4">
          <p className="text-3xl font-bold">{balance.toLocaleString()} HMMM</p>
          <p className="text-green-500">
            +{change}% ({profit.toLocaleString()} HMMM)
          </p>
        </div>
      </div>
      <div className="h-[300px]">
        <BalanceChart />
      </div>
    </div>
  );
};