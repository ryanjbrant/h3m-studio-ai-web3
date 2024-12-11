import React, { useEffect } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { Users, Box, DollarSign, HardDrive, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => (
  <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold mb-2">{value}</p>
        {change !== undefined && (
          <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(change)}% from last month</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-[#242429] rounded-lg">
        {icon}
      </div>
    </div>
  </div>
);

export const AnalyticsOverview: React.FC = () => {
  const { stats, fetchStats } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatStorage = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Monitor your platform's performance and metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          change={12}
          icon={<Users className="w-6 h-6 text-blue-500" />}
        />
        <StatCard
          title="Models Generated"
          value={stats.modelsGenerated}
          change={8}
          icon={<Box className="w-6 h-6 text-purple-500" />}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatRevenue(stats.monthlyRevenue)}
          change={15}
          icon={<DollarSign className="w-6 h-6 text-green-500" />}
        />
        <StatCard
          title="Storage Used"
          value={formatStorage(stats.storageUsed)}
          change={-5}
          icon={<HardDrive className="w-6 h-6 text-orange-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">User Growth</h3>
            <div className="flex items-center gap-2 text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+24% this month</span>
            </div>
          </div>
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            [User Growth Chart Placeholder]
          </div>
        </div>

        <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Revenue Overview</h3>
            <div className="flex items-center gap-2 text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+18% this month</span>
            </div>
          </div>
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            [Revenue Chart Placeholder]
          </div>
        </div>
      </div>
    </div>
  );
};