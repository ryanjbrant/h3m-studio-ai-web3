import React from 'react';
import { User } from 'lucide-react';

interface WalletProfileProps {
  address: string;
  balance: number;
}

export const WalletProfile: React.FC<WalletProfileProps> = ({ address, balance }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#242429] flex items-center justify-center">
          <User className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400">Wallet</p>
          <p className="text-sm font-medium">{address}</p>
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-1">Balance</p>
        <p className="text-2xl font-bold">{balance.toLocaleString()} HMMM</p>
      </div>
    </div>
  );
};