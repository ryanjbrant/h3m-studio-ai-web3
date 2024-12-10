import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface StakingFormProps {
  mode: 'stake' | 'unstake';
}

export const StakingForm: React.FC<StakingFormProps> = ({ mode }) => {
  const [amount, setAmount] = useState('');
  const [isApproved, setIsApproved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle staking/unstaking
    console.log(`${mode}ing ${amount} HMMM`);
  };

  const handleApprove = () => {
    setIsApproved(true);
  };

  const estimatedGas = '0.001 ETH';
  const balance = mode === 'stake' ? '1,000 HMMM' : '500 HMMM Staked';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium">Amount</label>
          <span className="text-sm text-gray-400">
            Available: {balance}
          </span>
        </div>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-[#0a0a0b] border border-[#242429] rounded-lg pr-20"
          />
          <button
            type="button"
            onClick={() => setAmount('1000')}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-blue-500 hover:text-blue-400"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Gas Fee Estimation */}
      <div className="p-4 bg-[#0a0a0b] border border-[#242429] rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Estimated Gas Fee</span>
          <span className="text-sm">{estimatedGas}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-yellow-500">
          <AlertCircle className="w-4 h-4" />
          <span>Gas fees may vary during peak times</span>
        </div>
      </div>

      {mode === 'stake' && !isApproved ? (
        <button
          type="button"
          onClick={handleApprove}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Approve HMMM
        </button>
      ) : (
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {mode === 'stake' ? 'Stake HMMM' : 'Unstake HMMM'}
        </button>
      )}
    </form>
  );
};