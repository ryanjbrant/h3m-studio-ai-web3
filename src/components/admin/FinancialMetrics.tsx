import React from 'react';
import { DollarSign, TrendingUp, CreditCard, Activity } from 'lucide-react';

export const FinancialMetrics: React.FC = () => {
  return (
    <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Financial Metrics
        </h2>
        <button className="text-sm text-blue-500 hover:text-blue-400">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Revenue</span>
          </div>
          <p className="text-2xl font-bold mb-1">$45,242</p>
          <p className="text-sm text-green-500">+12.5% vs last month</p>
        </div>

        <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Transactions</span>
          </div>
          <p className="text-2xl font-bold mb-1">1,234</p>
          <p className="text-sm text-green-500">+8.3% vs last month</p>
        </div>

        <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium">Average Order</span>
          </div>
          <p className="text-2xl font-bold mb-1">$36.65</p>
          <p className="text-sm text-green-500">+5.2% vs last month</p>
        </div>
      </div>

      <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-4">
        <h3 className="font-medium mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="font-medium">Transaction #{1000 + i}</p>
                <p className="text-sm text-gray-400">2 hours ago</p>
              </div>
              <p className="font-medium">$24.99</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};