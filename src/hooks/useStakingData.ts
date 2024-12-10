import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { formatUnits } from 'viem';
import { useEffect, useState } from 'react';
import {
  STAKING_CONTRACT_ADDRESS,
  HMMM_TOKEN_ADDRESS,
  STAKING_CONTRACT_ABI,
  HMMM_TOKEN_ABI
} from '../config/contracts';

const HMMM_DECIMALS = 9;

interface StakingData {
  stakedBalance: string;
  pendingRewards: string;
  tokenBalance: string;
  apr: number;
  lockPeriod: number;
  cooldownPeriod: number;
}

interface StakingEvent {
  type: 'stake' | 'unstake' | 'claim';
  amount: string;
  timestamp: number;
  transactionHash: `0x${string}`;
}

const initialData: StakingData = {
  stakedBalance: '0',
  pendingRewards: '0',
  tokenBalance: '0',
  apr: 0,
  lockPeriod: 0,
  cooldownPeriod: 0
};

export const useStakingData = () => {
  const { address, isConnected } = useAccount();
  const [history, setHistory] = useState<StakingEvent[]>([]);

  // Token balance
  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: HMMM_TOKEN_ADDRESS,
    abi: HMMM_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Staked balance
  const { data: stakedBalance, refetch: refetchStakedBalance } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'stakedBalance',
    args: address ? [address] : undefined,
  });

  // Pending rewards
  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'pendingRewards',
    args: address ? [address] : undefined,
  });

  // APR
  const { data: apr } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'apr',
  });

  // Lock period
  const { data: lockPeriod } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'lockPeriod',
  });

  // Cooldown period
  const { data: cooldownPeriod } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'cooldownPeriod',
  });

  // Refresh data periodically
  useEffect(() => {
    if (!isConnected || !address) return;

    const interval = setInterval(() => {
      refetchTokenBalance();
      refetchStakedBalance();
      refetchRewards();
    }, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [isConnected, address, refetchTokenBalance, refetchStakedBalance, refetchRewards]);

  // Watch for staking events
  useWatchContractEvent({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    eventName: 'Staked',
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (log.args.user === address && log.args.amount) {
          const newEvent: StakingEvent = {
            type: 'stake',
            amount: formatUnits(log.args.amount, HMMM_DECIMALS),
            timestamp: Date.now(),
            transactionHash: log.transactionHash
          };
          setHistory(prev => [newEvent, ...prev]);
          
          // Refresh balances
          refetchTokenBalance();
          refetchStakedBalance();
          refetchRewards();
        }
      });
    },
  });

  // Watch for unstaking events
  useWatchContractEvent({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    eventName: 'Unstaked',
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (log.args.user === address && log.args.amount) {
          const newEvent: StakingEvent = {
            type: 'unstake',
            amount: formatUnits(log.args.amount, HMMM_DECIMALS),
            timestamp: Date.now(),
            transactionHash: log.transactionHash
          };
          setHistory(prev => [newEvent, ...prev]);
          
          // Refresh balances
          refetchTokenBalance();
          refetchStakedBalance();
          refetchRewards();
        }
      });
    },
  });

  // Watch for reward claims
  useWatchContractEvent({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    eventName: 'RewardsClaimed',
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (log.args.user === address && log.args.amount) {
          const newEvent: StakingEvent = {
            type: 'claim',
            amount: formatUnits(log.args.amount, HMMM_DECIMALS),
            timestamp: Date.now(),
            transactionHash: log.transactionHash
          };
          setHistory(prev => [newEvent, ...prev]);
          
          // Refresh balances
          refetchTokenBalance();
          refetchStakedBalance();
          refetchRewards();
        }
      });
    },
  });

  if (!isConnected || !address) {
    console.log('Not connected');
    return { ...initialData, isLoading: false, error: null, history: [] };
  }

  const formattedData: StakingData = {
    stakedBalance: typeof stakedBalance === 'bigint' ? formatUnits(stakedBalance, HMMM_DECIMALS) : '0',
    pendingRewards: typeof pendingRewards === 'bigint' ? formatUnits(pendingRewards, HMMM_DECIMALS) : '0',
    tokenBalance: typeof tokenBalance === 'bigint' ? formatUnits(tokenBalance, HMMM_DECIMALS) : '0',
    apr: typeof apr === 'bigint' ? Number(apr) / 100 : 0,
    lockPeriod: typeof lockPeriod === 'bigint' ? Number(lockPeriod) : 0,
    cooldownPeriod: typeof cooldownPeriod === 'bigint' ? Number(cooldownPeriod) : 0
  };

  console.log('Raw token balance:', tokenBalance?.toString());
  console.log('Formatted token balance:', formattedData.tokenBalance);
  console.log('Staking data:', formattedData);
  console.log('History:', history);

  return {
    ...formattedData,
    isLoading: false,
    error: null,
    history,
    refetch: () => {
      refetchTokenBalance();
      refetchStakedBalance();
      refetchRewards();
    }
  };
};