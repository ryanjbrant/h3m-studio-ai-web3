import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  BSC_CHAIN_ID, 
  BSC_RPC_URL,
  STAKING_CONTRACT_ADDRESS,
  HMMM_TOKEN_ADDRESS,
  STAKING_CONTRACT_ABI,
  HMMM_TOKEN_ABI
} from '../config/contracts';

export const useWeb3 = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already connected
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
          }
        })
        .catch(console.error);

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAddress(accounts[0] || null);
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('Please install MetaMask');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // Check if connected to BSC
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });

      if (parseInt(chainId, 16) !== BSC_CHAIN_ID) {
        try {
          // Try to switch to BSC
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${BSC_CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: any) {
          // If BSC is not added, prompt to add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${BSC_CHAIN_ID.toString(16)}`,
                chainName: 'Binance Smart Chain',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18
                },
                rpcUrls: [BSC_RPC_URL],
                blockExplorerUrls: ['https://bscscan.com/']
              }]
            });
          } else {
            throw switchError;
          }
        }
      }

      setAddress(accounts[0]);
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  return {
    address,
    connect,
    isConnecting,
    error
  };
};