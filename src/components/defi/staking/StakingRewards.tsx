import React from 'react';
import { Clock, Gift, Loader2 } from 'lucide-react';
import { useStaking } from '../../../hooks/useStaking';
import { useStakingData } from '../../../hooks/useStakingData';
import { ethers } from 'ethers';

export const StakingRewards: React.FC = () => {
  const { claimRewards, isLoading } = useStaking();
  const { pendingRewards, cooldownPeriod } = useStakingData();

  const formattedRewards = parseFloat(ethers.utils.formatEther(pendingRewards || '0')).toFixed(2);
  const nextClaimDate = new Date(Date.now() + (cooldownPeriod * 1000));

  return (
    <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
      <h3 className="text-lg font-bold mb-6">Your Rewards</h3>
      
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-400 mb-1">Pending Rewards</p>
          <p className="text-3xl font-bold">{formattedRewards} HMMM</p>
          <p className="text-sm text-gray-400">≈ ${(parseFloat(formattedRewards) * 2).toFixed(2)}</p>
        </div>

        <div className="p-4 bg-blue-500/10 rounded-lg flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Next Claim Available</p>
            <p className="text-sm text-gray-400">
              {nextClaimDate.toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => claimRewards()}
          disabled={isLoading || parseFloat(formattedRewards) === 0}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <Gift className="w-4 h-4" />
          Claim Rewards
        </button>
      </div>
    </div>
  );
};