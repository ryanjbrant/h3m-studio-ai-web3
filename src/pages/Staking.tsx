import React, { useState } from 'react';
import { Eye, Clock, LineChart, Send } from 'lucide-react';
import { WalletProfile } from '../components/defi/WalletProfile';
import { SidebarNav } from '../components/defi/SidebarNav';
import { BalanceOverview } from '../components/defi/BalanceOverview';
import { NetworkAssets } from '../components/defi/NetworkAssets';
import { ActionButtons } from '../components/defi/ActionButtons';
import { HistoryTab } from '../components/defi/tabs/HistoryTab';
import { InvestTab } from '../components/defi/tabs/InvestTab';
import { SendTab } from '../components/defi/tabs/SendTab';
import { useWallet } from '../hooks/useWallet';
import { useStakingData } from '../hooks/useStakingData';

type TabType = 'overview' | 'history' | 'invest' | 'send';

const Staking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { address, formatAddress } = useWallet();
  const { tokenBalance, stakedBalance } = useStakingData();

  const navItems = [
    { icon: Eye, label: 'Overview', id: 'overview' as TabType, isActive: activeTab === 'overview' },
    { icon: Clock, label: 'History', id: 'history' as TabType, isActive: activeTab === 'history' },
    { icon: LineChart, label: 'Invest', id: 'invest' as TabType, isActive: activeTab === 'invest' },
    { icon: Send, label: 'Send', id: 'send' as TabType, isActive: activeTab === 'send', hasNew: true },
  ].map(item => ({
    ...item,
    onClick: () => setActiveTab(item.id)
  }));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'history':
        return <HistoryTab />;
      case 'invest':
        return <InvestTab />;
      case 'send':
        return <SendTab />;
      default:
        return (
          <div className="flex gap-8">
            <div className="flex-1">
              <BalanceOverview 
                balance={parseFloat(stakedBalance)}
                change={13.7}
                profit={313.65}
              />
            </div>
            <div className="w-80">
              <NetworkAssets
                network="Binance Smart Chain"
                totalValue={20.78}
                assets={[
                  { symbol: 'BUSD', amount: 11.504 },
                  { symbol: 'BNB', amount: 0.011 },
                  { symbol: 'ADA', amount: 1.925 },
                  { symbol: 'USDT', amount: 3.529 },
                ]}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#0a0a0b] text-white">
      <div className="flex">
        <div className="w-64 min-h-[calc(100vh-44px)] border-r border-[#242429] p-6">
          <WalletProfile 
            address={address ? formatAddress(address) : ''}
            balance={parseFloat(tokenBalance || '0')}
          />
          <SidebarNav items={navItems} />
        </div>

        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-8">
              <h1 className="text-2xl font-bold capitalize">{activeTab}</h1>
              <ActionButtons />
            </div>

            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staking;