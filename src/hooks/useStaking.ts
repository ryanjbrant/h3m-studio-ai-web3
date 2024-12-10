import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';

export const useStaking = () => {
  const { address, stakingContract, tokenContract } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stake = useCallback(async (amount: string) => {
    if (!stakingContract || !tokenContract || !address) {
      setError('Wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const parsedAmount = ethers.utils.parseEther(amount);
      
      // Check allowance
      const allowance = await tokenContract.allowance(address, stakingContract.address);
      
      if (allowance.lt(parsedAmount)) {
        const approveTx = await tokenContract.approve(
          stakingContract.address,
          ethers.constants.MaxUint256
        );
        await approveTx.wait();
      }

      const tx = await stakingContract.stake(parsedAmount);
      await tx.wait();

      return tx.hash;
    } catch (err) {
      console.error('Staking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to stake tokens');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [stakingContract, tokenContract, address]);

  const unstake = useCallback(async (amount: string) => {
    if (!stakingContract || !address) {
      setError('Wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const tx = await stakingContract.unstake(ethers.utils.parseEther(amount));
      await tx.wait();

      return tx.hash;
    } catch (err) {
      console.error('Unstaking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to unstake tokens');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [stakingContract, address]);

  const claimRewards = useCallback(async () => {
    if (!stakingContract || !address) {
      setError('Wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const tx = await stakingContract.getRewards();
      await tx.wait();

      return tx.hash;
    } catch (err) {
      console.error('Claim rewards error:', err);
      setError(err instanceof Error ? err.message : 'Failed to claim rewards');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [stakingContract, address]);

  return {
    stake,
    unstake,
    claimRewards,
    isLoading,
    error
  };
};