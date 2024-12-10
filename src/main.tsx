import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Web3Provider } from './providers/Web3Provider';
import './styles/theme.css';
import './config/firebase';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <React.StrictMode>
    <Web3Provider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Web3Provider>
  </React.StrictMode>
);