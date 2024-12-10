import { bsc } from 'viem/chains';

export const SUPPORTED_CHAINS = [bsc] as const;

export const BSC_CHAIN_CONFIG = {
  id: bsc.id,
  name: bsc.name,
  nativeCurrency: bsc.nativeCurrency,
  rpcUrls: {
    default: { http: ['https://bsc-dataseed.binance.org'] },
    public: { http: ['https://bsc-dataseed.binance.org'] }
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://bscscan.com' }
  }
};