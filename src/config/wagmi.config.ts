import { createConfig, http } from 'wagmi';
import { bsc } from 'viem/chains';
import { 
  injected,
  metaMask,
  coinbaseWallet,
  walletConnect 
} from 'wagmi/connectors';

const projectId = '95f1218daf6463ac29c55fd01e735d93';
if (!projectId) throw new Error('Missing VITE_WALLET_CONNECT_PROJECT_ID');

export const config = createConfig({
  chains: [bsc],
  connectors: [
    metaMask(),
    coinbaseWallet({ appName: 'H3M Studio' }),
    walletConnect({ projectId }),
    injected()
  ],
  transports: {
    [bsc.id]: http()
  }
});