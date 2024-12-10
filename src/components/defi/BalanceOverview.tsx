import React from 'react';
import { BalanceChart } from './BalanceChart';

interface BalanceOverviewProps {
  balance: number;
  change: number;
  profit: number;
}

export const BalanceOverview: React.FC<BalanceOverviewProps> = ({
  balance = 0,
  change = 0,
  profit = 0,
}) => {
  return (
    <div className="bg-[#121214] border border-[#242429] rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Total Staked</h2>
        <div className="flex items-baseline gap-4">
          <p className="text-3xl font-bold">{balance.toLocaleString()} HMMM</p>
          <p className={`${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}% ({profit.toLocaleString()} HMMM)
          </p>
        </div>
      </div>
      <div className="h-[300px]">
        <BalanceChart />
      </div>
    </div>
  );
};