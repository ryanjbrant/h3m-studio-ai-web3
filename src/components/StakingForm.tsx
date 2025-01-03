import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useContracts } from '../hooks/useContracts';
import { useStakingData } from '../hooks/useStakingData';
import { parseUnits } from 'viem';

interface StakingFormProps {
  mode: 'stake' | 'unstake';
  onSuccess?: () => void;
}

const HMMM_DECIMALS = 9;

export const StakingForm: React.FC<StakingFormProps> = ({ mode, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { stake, unstake, allowance, isPending, approve } = useContracts();
  const { stakedBalance, tokenBalance: walletBalance } = useStakingData();

  // Reset error when amount changes
  useEffect(() => {
    setError(null);
  }, [amount]);

  const handleApprove = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setError(null);
      console.log('Approving amount:', amount);
      await approve(amount);
      console.log('Approval successful');
      alert('Approval successful! You can now stake your tokens.');
    } catch (err) {
      console.error('Approval failed:', err);
      setError(err instanceof Error ? err.message : 'Approval failed');
      alert('Failed to approve tokens. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setError(null);
      console.log(`${mode}ing amount:`, amount);
      
      if (mode === 'stake') {
        // Check if amount exceeds balance
        if (parseFloat(amount) > parseFloat(walletBalance)) {
          throw new Error('Insufficient balance');
        }
        await stake(amount);
        alert(`Successfully staked ${amount} HMMM!`);
      } else {
        // Check if amount exceeds staked balance
        if (parseFloat(amount) > parseFloat(stakedBalance || '0')) {
          throw new Error('Insufficient staked balance');
        }
        await unstake(amount);
        alert(`Successfully unstaked ${amount} HMMM!`);
      }

      setAmount(''); // Clear form after successful transaction
      onSuccess?.(); // Trigger any parent component updates
    } catch (err) {
      console.error('Transaction failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      alert(`Failed to ${mode}: ${errorMessage}`);
    }
  };

  const handleMax = () => {
    if (mode === 'stake') {
      setAmount(walletBalance);
    } else {
      setAmount(stakedBalance || '0');
    }
  };

  const needsApproval = () => {
    if (!amount || !allowance) return false;
    try {
      const parsedAmount = parseUnits(amount, HMMM_DECIMALS);
      const currentAllowance = BigInt(allowance?.toString() || '0');
      return currentAllowance < parsedAmount;
    } catch (err) {
      console.error('Error checking approval:', err);
      return false;
    }
  };

  const availableBalance = mode === 'stake' ? walletBalance : stakedBalance || '0';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium">Amount</label>
          <span className="text-sm text-gray-400">
            Available: {parseFloat(availableBalance).toLocaleString()} HMMM
          </span>
        </div>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.000000001"
            className="w-full px-4 py-3 bg-[#0a0a0b] border border-[#242429] rounded-lg pr-20"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={handleMax}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-blue-500 hover:text-blue-400"
            disabled={isPending}
          >
            MAX
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>

      {/* Gas Fee Estimation */}
      <div className="p-4 bg-[#0a0a0b] border border-[#242429] rounded-lg">
        <div className="flex items-center gap-2 text-sm text-yellow-500">
          <AlertCircle className="w-4 h-4" />
          <span>Transaction may require multiple confirmations</span>
        </div>
      </div>

      {mode === 'stake' && needsApproval() ? (
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending || !amount || parseFloat(amount) <= 0}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Approving...' : 'Approve HMMM'}
        </button>
      ) : (
        <button
          type="submit"
          disabled={isPending || !amount || parseFloat(amount) <= 0}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending 
            ? mode === 'stake' ? 'Staking...' : 'Unstaking...'
            : mode === 'stake' ? 'Stake HMMM' : 'Unstake HMMM'
          }
        </button>
      )}
    </form>
  );
}; 