import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';

interface StakingData {
  stakedBalance: string;
  pendingRewards: string;
  tokenBalance: string;
  apr: number;
  lockPeriod: number;
  cooldownPeriod: number;
}

export const useStakingData = () => {
  const { address, stakingContract, tokenContract } = useWeb3();
  const [data, setData] = useState<StakingData>({
    stakedBalance: '0',
    pendingRewards: '0',
    tokenBalance: '0',
    apr: 0,
    lockPeriod: 0,
    cooldownPeriod: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!stakingContract || !tokenContract || !address) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [
        stakedBalance,
        pendingRewards,
        tokenBalance,
        apr,
        lockPeriod,
        cooldownPeriod
      ] = await Promise.all([
        stakingContract.stakedBalance(address),
        stakingContract.pendingRewards(address),
        tokenContract.balanceOf(address),
        stakingContract.apr(),
        stakingContract.lockPeriod(),
        stakingContract.cooldownPeriod()
      ]);

      setData({
        stakedBalance: ethers.utils.formatEther(stakedBalance),
        pendingRewards: ethers.utils.formatEther(pendingRewards),
        tokenBalance: ethers.utils.formatEther(tokenBalance),
        apr: apr.toNumber() / 100, // Convert from basis points
        lockPeriod: lockPeriod.toNumber(),
        cooldownPeriod: cooldownPeriod.toNumber()
      });
    } catch (err) {
      console.error('Error fetching staking data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch staking data');
    } finally {
      setIsLoading(false);
    }
  }, [stakingContract, tokenContract, address]);

  useEffect(() => {
    fetchData();

    // Set up event listeners for updates
    if (stakingContract && address) {
      const filters = [
        stakingContract.filters.Staked(address),
        stakingContract.filters.Unstaked(address),
        stakingContract.filters.RewardsClaimed(address)
      ];

      filters.forEach(filter => {
        stakingContract.on(filter, fetchData);
      });

      return () => {
        filters.forEach(filter => {
          stakingContract.off(filter, fetchData);
        });
      };
    }
  }, [stakingContract, address, fetchData]);

  return {
    ...data,
    isLoading,
    error,
    refresh: fetchData
  };
};