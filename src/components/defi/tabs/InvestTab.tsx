import React from 'react';
import { StakingForm } from '../staking/StakingForm';
import { useStakingData } from '../../../hooks/useStakingData';
import { useStaking } from '../../../hooks/useStaking';
import { Clock, Gift, Loader2 } from 'lucide-react';

export const InvestTab: React.FC = () => {
  const { stakedBalance, pendingRewards, apr, cooldownPeriod } = useStakingData();
  const { claimRewards, isLoading } = useStaking();

  const totalValue = Number(stakedBalance) + Number(pendingRewards);
  const nextClaimDate = new Date(Date.now() + (cooldownPeriod * 1000));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-8">
        <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
          <h3 className="text-lg font-bold mb-6">Your Investment</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Value</p>
              <p className="text-3xl font-bold">{totalValue.toFixed(6)} HMMM</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-400">Base: {Number(stakedBalance).toFixed(6)}</p>
                <p className="text-sm text-green-500">+{Number(pendingRewards).toFixed(6)} rewards</p>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-lg flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Next Claim Available</p>
                <p className="text-sm text-gray-400">{nextClaimDate.toLocaleDateString()}</p>
              </div>
            </div>

            <button
              onClick={() => claimRewards()}
              disabled={isLoading || Number(pendingRewards) === 0}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <Gift className="w-4 h-4" />
              Claim Rewards
            </button>

            <div className="p-4 bg-[#0a0a0b] rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Current APR</p>
              <p className="text-xl font-bold">{apr}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
          <h3 className="text-lg font-bold mb-6">Stake/Unstake</h3>
          <StakingForm mode="stake" />
        </div>
      </div>
    </div>
  );
};