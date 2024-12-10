import React, { useState, useEffect } from 'react';
import { AlertCircle, PartyPopper, X } from 'lucide-react';
import { useContracts } from '../../../hooks/useContracts';
import { useStakingData } from '../../../hooks/useStakingData';
import { parseUnits } from 'viem';
import ReactConfetti from 'react-confetti';

interface StakingFormProps {
  mode: 'stake' | 'unstake';
  onSuccess?: () => void;
}

const HMMM_DECIMALS = 9;

export const StakingForm: React.FC<StakingFormProps> = ({ mode, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { stake, unstake, allowance, isPending, approve } = useContracts();
  const { stakedBalance, tokenBalance: walletBalance } = useStakingData();

  // Reset error when amount changes
  useEffect(() => {
    setError(null);
  }, [amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      if (mode === 'stake') {
        // Check if approval is needed before staking
        if (needsApproval()) {
          setError('Please approve HMMM tokens first');
          return;
        }
        await stake(amount);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000); // Hide after 5 seconds
      } else {
        await unstake(amount);
      }
      setAmount('');
      onSuccess?.();
    } catch (err: unknown) {
      console.error(`Error ${mode}ing:`, err);
      // Check if the error is due to user rejection
      if (err instanceof Error && (err.message.includes('User rejected') || err.message.includes('User denied'))) {
        setError('Transaction was cancelled');
      } else {
        setError(`Failed to ${mode}. Please try again.`);
      }
    }
  };

  const handleApprove = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    try {
      await approve(amount);
      // Force a re-render to update the approval state
      const event = new Event('allowanceUpdated');
      window.dispatchEvent(event);
    } catch (err: unknown) {
      console.error('Error approving:', err);
      // Check if the error is due to user rejection
      if (err instanceof Error && (err.message.includes('User rejected') || err.message.includes('User denied'))) {
        setError('Approval was cancelled');
      } else {
        setError('Failed to approve. Please try again.');
      }
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
    if (mode === 'unstake') return false; // No approval needed for unstaking
    if (!amount) return false;
    
    try {
      const parsedAmount = parseUnits(amount, HMMM_DECIMALS);
      const currentAllowance = BigInt(allowance?.toString() || '0');
      console.log('Checking approval...', {
        amount,
        parsedAmount: parsedAmount.toString(),
        currentAllowance: currentAllowance.toString(),
        needsApproval: currentAllowance < parsedAmount
      });
      return currentAllowance < parsedAmount;
    } catch (err) {
      console.error('Error checking approval:', err);
      return false;
    }
  };

  const availableBalance = mode === 'stake' ? walletBalance : stakedBalance || '0';
  const showApproveButton = mode === 'stake' && needsApproval();

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6" aria-label="Staking Form">
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
            <div className="mt-2 flex items-center gap-2 text-red-500" role="alert">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {showApproveButton ? (
          <button
            type="button"
            onClick={handleApprove}
            disabled={isPending}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            Approve HMMM
          </button>
        ) : (
          <button
            type="submit"
            disabled={!amount || isPending}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {mode === 'stake' ? 'Stake' : 'Unstake'} HMMM
          </button>
        )}
      </form>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={500}
          />
          <div className="bg-[#121214] border border-[#242429] rounded-lg p-6 max-w-md mx-4 relative">
            <button
              onClick={() => setShowSuccess(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <PartyPopper className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Congratulations! 🎉</h3>
              <p className="text-gray-400 mb-4">
                You've successfully staked {parseFloat(amount).toLocaleString()} HMMM tokens!
                Your investment is now earning rewards.
              </p>
              <div className="bg-blue-500/10 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-500">
                  Watch your rewards grow in real-time on the dashboard!
                </p>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};