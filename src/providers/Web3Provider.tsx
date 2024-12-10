import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { bsc } from 'viem/chains';
import { metaMask } from 'wagmi/connectors';

const queryClient = new QueryClient();

const config = createConfig({
  chains: [bsc],
  connectors: [
    metaMask()
  ],
  transports: {
    [bsc.id]: http('https://bsc-dataseed.binance.org')
  }
});

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}