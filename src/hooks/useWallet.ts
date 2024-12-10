import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { metaMask, coinbaseWallet, walletConnect } from 'wagmi/connectors';

export function useWallet() {
  const { address, isConnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const connectMetaMask = async () => {
    try {
      await connect({ connector: metaMask() });
    } catch (error) {
      console.error('MetaMask connection error:', error);
      throw error;
    }
  };
  const connectCoinbase = () => connect({ connector: coinbaseWallet({ appName: 'H3M Studio' }) });
  const connectWalletConnect = () => connect({ 
    connector: walletConnect({ 
      projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '' 
    }) 
  });

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return {
    address,
    isConnecting,
    connectMetaMask,
    connectCoinbase,
    connectWalletConnect,
    disconnect,
    formatAddress
  };
}