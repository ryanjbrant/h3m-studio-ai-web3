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
const POLLING_INTERVAL = 1000; // Poll every second for real-time updates

interface StakingData {
  stakedBalance: string;
  pendingRewards: string;
  tokenBalance: string;
  apr: number;
  lockPeriod: number;
  cooldownPeriod: number;
  rewardsValue: number;
  profitPercentage: number;
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
  cooldownPeriod: 0,
  rewardsValue: 0,
  profitPercentage: 0
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
    functionName: 'TokensStaked',
    args: address ? [address] : undefined,
  });

  console.log('Raw staked balance from contract:', stakedBalance);
  console.log('Address being used:', address);
  console.log('Contract address:', STAKING_CONTRACT_ADDRESS);

  // Pending rewards
  const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_CONTRACT_ABI,
    functionName: 'pendingRewards',
    args: address ? [address] : undefined,
  });

  console.log('Raw pending rewards from contract:', pendingRewards);
  console.log('User address for rewards:', address);

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
    }, POLLING_INTERVAL);

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
    cooldownPeriod: typeof cooldownPeriod === 'bigint' ? Number(cooldownPeriod) : 0,
    rewardsValue: 0,
    profitPercentage: 0
  };

  console.log('Formatted pending rewards:', formattedData.pendingRewards);

  // Calculate profit percentage and rewards value with proper decimal handling
  const stakedBalanceNum = parseFloat(formattedData.stakedBalance);
  const pendingRewardsNum = parseFloat(formattedData.pendingRewards);
  
  // Format small numbers to show more decimal places for better precision
  const formatSmallNumber = (num: number): string => {
    if (num === 0) return '0';
    if (num < 0.000001) return num.toExponential(4);
    if (num < 0.01) return num.toFixed(6);
    return num.toFixed(4);
  };

  const profitPercentage = stakedBalanceNum > 0 ? (pendingRewardsNum / stakedBalanceNum) * 100 : 0;

  // Debug the values with better formatting
  console.log('Staked balance raw:', stakedBalance);
  console.log('Staked balance formatted:', formatSmallNumber(stakedBalanceNum));
  console.log('Pending rewards:', formatSmallNumber(pendingRewardsNum));
  console.log('Profit percentage:', formatSmallNumber(profitPercentage));

  // Log the raw and formatted values for debugging
  console.log('Raw staked balance:', stakedBalance?.toString());
  console.log('Formatted staked balance:', formatSmallNumber(stakedBalanceNum));
  console.log('Staking data:', formattedData);
  console.log('History:', history);

  return {
    ...formattedData,
    isLoading: false,
    error: null,
    history,
    rewardsValue: pendingRewardsNum,
    profitPercentage,
    refetch: () => {
      refetchTokenBalance();
      refetchStakedBalance();
      refetchRewards();
    }
  };
};