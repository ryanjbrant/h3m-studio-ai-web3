import React from 'react';
import { useWallet } from '../../hooks/useWallet';

export const ConnectWallet: React.FC = () => {
  const { address, isConnecting, connectMetaMask, disconnect, formatAddress } = useWallet();

  const handleConnect = async () => {
    try {
      await connectMetaMask();
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  if (address) {
    return (
      <button
        onClick={() => disconnect()}
        className="px-4 py-2 bg-[#242429] rounded-lg hover:bg-[#2a2a2f] transition-colors"
      >
        {formatAddress(address)}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
};
