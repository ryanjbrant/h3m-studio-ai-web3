import React from 'react';
import { Wallet, Loader2 } from 'lucide-react';
import { useWeb3 } from '../../hooks/useWeb3';
import { useLocation } from 'react-router-dom';

export const WalletButton: React.FC = () => {
  const { connect, isConnecting, address, error } = useWeb3();
  const location = useLocation();

  // Only show the button in the DeFi section
  const isDefiSection = location.pathname.startsWith('/defi');
  
  if (!isDefiSection) return null;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#242429] text-sm font-medium rounded-md text-white bg-[#0a0a0b] hover:bg-[#242429] transition-colors disabled:opacity-50"
    >
      {isConnecting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Wallet className="w-4 h-4" />
      )}
      {address ? formatAddress(address) : 'Connect Wallet'}
      {error && (
        <span className="text-red-500 text-xs ml-2">{error}</span>
      )}
    </button>
  );
};