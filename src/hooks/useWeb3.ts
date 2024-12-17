import { useState, useCallback, useEffect } from 'react';
import { BSC_CHAIN_ID, BSC_RPC_URL } from '../config/contracts';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: any) => void;
      removeListener: (event: string, callback: any) => void;
      isMetaMask?: boolean;
    };
  }
}

interface Web3State {
  address: string | null;
  connect: () => Promise<void>;
  isConnecting: boolean;
  error: string | null;
  chainId: number | null;
  isMetaMaskInstalled: boolean;
}

export const useWeb3 = (): Web3State => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);

  // Check if MetaMask is installed
  useEffect(() => {
    setIsMetaMaskInstalled(!!window.ethereum?.isMetaMask);
  }, []);

  const checkAndSwitchChain = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask');
      return;
    }
    
    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdNumber = parseInt(currentChainId, 16);
      console.log('Current chain ID:', chainIdNumber);
      setChainId(chainIdNumber);

      if (chainIdNumber !== BSC_CHAIN_ID) {
        console.log('Switching to BSC network...');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${BSC_CHAIN_ID.toString(16)}` }],
          });
          console.log('Successfully switched to BSC');
        } catch (switchError: any) {
          console.log('Error switching chain:', switchError);
          if (switchError.code === 4902) {
            console.log('BSC network not found, adding it...');
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
            console.log('BSC network added successfully');
          } else {
            throw switchError;
          }
        }
      }
    } catch (error) {
      console.error('Error checking/switching chain:', error);
      throw error;
    }
  };

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask to connect your wallet');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // First switch to BSC network
      await checkAndSwitchChain();

      // Then request accounts with proper error handling
      console.log('Requesting account access...');
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts'
        });
        console.log('Accounts received:', accounts);

        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found');
        }

        setAddress(accounts[0]);
        console.log('Connection successful:', accounts[0]);
      } catch (err: any) {
        if (err.code === -32002) {
          setError('Please check MetaMask. Connection request already pending.');
        } else if (err.code === 4001) {
          setError('Please connect your wallet to continue.');
        } else {
          setError('Failed to connect wallet. Please try again.');
        }
        throw err;
      }

      // Verify we're still on BSC
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdNumber = parseInt(chainId, 16);
      if (chainIdNumber !== BSC_CHAIN_ID) {
        setError('Please switch to BSC network');
      }
    } catch (err) {
      console.error('Connection error:', err);
      if (!error) { // Only set error if not already set
        setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Check initial connection and set up listeners
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) {
        setIsMetaMaskInstalled(false);
        return;
      }

      setIsMetaMaskInstalled(true);
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          await checkAndSwitchChain();
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
        setAddress(accounts[0] || null);
      };

      const handleChainChanged = (newChainId: string) => {
        console.log('Chain changed:', parseInt(newChainId, 16));
        const chainIdNumber = parseInt(newChainId, 16);
        setChainId(chainIdNumber);
        if (chainIdNumber !== BSC_CHAIN_ID) {
          setError('Please switch to BSC network');
        } else {
          setError(null);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  return {
    address,
    connect,
    isConnecting,
    error,
    chainId,
    isMetaMaskInstalled
  };
};