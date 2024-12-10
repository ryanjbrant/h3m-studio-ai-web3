import React, { useState } from 'react';
import { Wallet, TrendingUp, Lock, Info, AlertCircle } from 'lucide-react';
import { StakingForm } from '../staking/StakingForm';
import { StakingStats } from '../staking/StakingStats';
import { StakingRewards } from '../staking/StakingRewards';
import { StakingInfo } from '../staking/StakingInfo';

export const InvestTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Staking Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
          {/* APY Banner */}
          <div className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Current APY</h3>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                24% APY
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Info className="w-4 h-4" />
              <span>Updated daily</span>
            </div>
          </div>

          {/* Staking/Unstaking Tabs */}
          <div className="flex gap-2 mb-6">
            {(['stake', 'unstake'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#242429] text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <StakingForm mode={activeTab} />
        </div>

        <StakingStats />
      </div>

      {/* Right Column - Info & Rewards */}
      <div className="space-y-6">
        <StakingRewards />
        <StakingInfo />
      </div>
    </div>
  );
};