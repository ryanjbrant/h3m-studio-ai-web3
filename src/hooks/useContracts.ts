import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { useState, useEffect } from 'react';
import {
  STAKING_CONTRACT_ADDRESS,
  HMMM_TOKEN_ADDRESS,
  STAKING_CONTRACT_ABI,
  HMMM_TOKEN_ABI
} from '../config/contracts';

const HMMM_DECIMALS = 9;

export const useContracts = () => {
  const { address, isConnected } = useAccount();
  const client = usePublicClient();
  const [isPending, setIsPending] = useState(false);

  // Read token balance
  const { data: tokenBalance } = useReadContract({
    address: HMMM_TOKEN_ADDRESS,
    abi: HMMM_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: HMMM_TOKEN_ADDRESS,
    abi: HMMM_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, STAKING_CONTRACT_ADDRESS] : undefined,
  });

  // Listen for allowance updates
  useEffect(() => {
    const handleAllowanceUpdate = () => {
      refetchAllowance();
    };

    window.addEventListener('allowanceUpdated', handleAllowanceUpdate);
    return () => window.removeEventListener('allowanceUpdated', handleAllowanceUpdate);
  }, [refetchAllowance]);

  // Contract writes
  const { writeContractAsync: writeToken } = useWriteContract();
  const { writeContractAsync: writeStake } = useWriteContract();
  const { writeContractAsync: writeUnstake } = useWriteContract();
  const { writeContractAsync: writeClaim } = useWriteContract();

  const approve = async (amount: string) => {
    if (!isConnected || !address || !client) {
      throw new Error('Not connected');
    }
    
    try {
      setIsPending(true);
      const parsedAmount = parseUnits(amount, HMMM_DECIMALS);
      
      console.log('Approving tokens...', {
        address: HMMM_TOKEN_ADDRESS,
        spender: STAKING_CONTRACT_ADDRESS,
        amount: parsedAmount.toString(),
        decimals: HMMM_DECIMALS,
        currentAllowance: allowance?.toString()
      });

      const hash = await writeToken({
        address: HMMM_TOKEN_ADDRESS,
        abi: HMMM_TOKEN_ABI,
        functionName: 'approve',
        args: [STAKING_CONTRACT_ADDRESS, parsedAmount]
      });
      
      console.log('Waiting for approval confirmation...', hash);
      const receipt = await client.waitForTransactionReceipt({ hash });
      console.log('Approval confirmed:', receipt);
      
      return receipt;
    } catch (error) {
      console.error('Error approving:', error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  const stake = async (amount: string) => {
    if (!isConnected || !address || !client) {
      throw new Error('Not connected');
    }
    
    try {
      setIsPending(true);
      const parsedAmount = parseUnits(amount, HMMM_DECIMALS);
      
      // Check allowance first
      const currentAllowance = BigInt(allowance?.toString() || '0');
      console.log('Checking allowance...', {
        currentAllowance: currentAllowance.toString(),
        requiredAmount: parsedAmount.toString()
      });
      
      if (currentAllowance < parsedAmount) {
        throw new Error('Please approve tokens first');
      }
      
      console.log('Staking tokens...', {
        amount: parsedAmount.toString(),
        decimals: HMMM_DECIMALS
      });

      const hash = await writeStake({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'stake',
        args: [parsedAmount]
      });
      
      console.log('Waiting for stake confirmation...', hash);
      const receipt = await client.waitForTransactionReceipt({ hash });
      console.log('Stake confirmed:', receipt);
      
      return receipt;
    } catch (error) {
      console.error('Error staking:', error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  const claimRewards = async () => {
    if (!isConnected || !address || !client) {
      throw new Error('Not connected');
    }
    
    try {
      setIsPending(true);
      console.log('Claiming rewards...');
      const hash = await writeClaim({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'claimRewards'
      });
      
      console.log('Waiting for claim confirmation...', hash);
      const receipt = await client.waitForTransactionReceipt({ hash });
      console.log('Claim confirmed:', receipt);
      
      return receipt;
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  const unstake = async (amount: string) => {
    if (!isConnected || !address || !client) {
      throw new Error('Not connected');
    }
    
    try {
      setIsPending(true);
      const parsedAmount = parseUnits(amount, HMMM_DECIMALS);
      
      console.log('Unstaking tokens...', {
        amount: parsedAmount.toString(),
        decimals: HMMM_DECIMALS
      });

      const hash = await writeUnstake({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'unstake',
        args: [parsedAmount]
      });
      
      console.log('Waiting for unstake confirmation...', hash);
      const receipt = await client.waitForTransactionReceipt({ hash });
      console.log('Unstake confirmed:', receipt);
      
      return receipt;
    } catch (error) {
      console.error('Error unstaking:', error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    address,
    stake,
    unstake,
    claimRewards,
    tokenBalance: tokenBalance || 0n,
    allowance,
    decimals: HMMM_DECIMALS,
    isPending,
    approve
  };
};