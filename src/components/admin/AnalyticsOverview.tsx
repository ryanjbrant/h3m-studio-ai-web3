import React, { useEffect, useState } from 'react';
import { 
  Users, Box, DollarSign, HardDrive, TrendingUp, ArrowUpRight, 
  ArrowDownRight, Wallet, Activity, Clock, AlertCircle, Settings
} from 'lucide-react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { analytics } from '../../config/firebase';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, loading }) => (
  <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-[#242429] rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-bold mb-2">{value}</p>
        )}
        {!loading && change !== undefined && (
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

interface TabProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-500 text-white' 
        : 'text-gray-400 hover:bg-[#242429]'
    }`}
  >
    {icon}
    {label}
  </button>
);

export const AnalyticsOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeUsers: 0,
    modelsGenerated: 0,
    monthlyRevenue: 0,
    storageUsed: 0,
    walletsConnected: 0,
    apiCalls: 0,
    apiCost: 0,
    averageGenerationTime: 0
  });
  const [timeRange, setTimeRange] = useState('7d');
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetchStats();
    fetchChartData();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Get active users count
      const usersRef = collection(db, 'users');
      const activeUsersQuery = query(
        usersRef,
        where('lastVisit', '>=', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
      );
      const activeUsersSnapshot = await getDocs(activeUsersQuery);
      
      // Get models count
      const generationsRef = collection(db, 'generations');
      const generationsSnapshot = await getDocs(generationsRef);
      
      // Get wallets count
      const walletsQuery = query(usersRef, where('walletConnected', '==', true));
      const walletsSnapshot = await getDocs(walletsQuery);

      // Calculate API usage and costs
      const apiCallsQuery = query(
        collection(db, 'apiCalls'),
        where('timestamp', '>=', Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
      );
      const apiCallsSnapshot = await getDocs(apiCallsQuery);
      
      const totalApiCalls = apiCallsSnapshot.docs.length;
      const apiCost = totalApiCalls * 0.05; // Assuming $0.05 per API call

      setStats({
        activeUsers: activeUsersSnapshot.docs.length,
        modelsGenerated: generationsSnapshot.docs.length,
        monthlyRevenue: apiCost, // This should be replaced with actual revenue data
        storageUsed: generationsSnapshot.docs.length * 5 * 1024 * 1024, // Rough estimate: 5MB per model
        walletsConnected: walletsSnapshot.docs.length,
        apiCalls: totalApiCalls,
        apiCost: apiCost,
        averageGenerationTime: 45 // This should be calculated from actual generation times
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const generationsRef = collection(db, 'generations');
      const generationsQuery = query(
        generationsRef,
        where('timestamp', '>=', Timestamp.fromDate(startDate))
      );
      const snapshot = await getDocs(generationsQuery);

      // Process data for charts
      const dailyData: { [key: string]: number } = {};
      snapshot.docs.forEach(doc => {
        const date = new Date(doc.data().timestamp.toDate()).toLocaleDateString();
        dailyData[date] = (dailyData[date] || 0) + 1;
      });

      const labels = Object.keys(dailyData);
      const values = Object.values(dailyData);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Daily Generations',
            data: values,
            fill: true,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#242429',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#363639',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: '#363639'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      y: {
        grid: {
          color: '#363639'
        },
        ticks: {
          color: '#9ca3af'
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Monitor your platform's performance and metrics.</p>
      </div>

      <div className="flex gap-2 border-b border-[#242429] pb-4">
        <Tab
          label="Overview"
          icon={<Activity className="w-4 h-4" />}
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        />
        <Tab
          label="Performance"
          icon={<TrendingUp className="w-4 h-4" />}
          active={activeTab === 'performance'}
          onClick={() => setActiveTab('performance')}
        />
        <Tab
          label="System"
          icon={<Settings className="w-4 h-4" />}
          active={activeTab === 'system'}
          onClick={() => setActiveTab('system')}
        />
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              change={12}
              icon={<Users className="w-6 h-6 text-blue-500" />}
              loading={loading}
            />
            <StatCard
              title="Models Generated"
              value={stats.modelsGenerated}
              change={8}
              icon={<Box className="w-6 h-6 text-purple-500" />}
              loading={loading}
            />
            <StatCard
              title="Monthly Revenue"
              value={formatRevenue(stats.monthlyRevenue)}
              change={15}
              icon={<DollarSign className="w-6 h-6 text-green-500" />}
              loading={loading}
            />
            <StatCard
              title="Storage Used"
              value={formatStorage(stats.storageUsed)}
              change={-5}
              icon={<HardDrive className="w-6 h-6 text-orange-500" />}
              loading={loading}
            />
          </div>

          <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Generation Activity</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    timeRange === '7d' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#242429]'
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    timeRange === '30d' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#242429]'
                  }`}
                >
                  30D
                </button>
                <button
                  onClick={() => setTimeRange('90d')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    timeRange === '90d' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#242429]'
                  }`}
                >
                  90D
                </button>
              </div>
            </div>
            <div className="h-[300px]">
              {chartData ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Loading chart data...
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Connected Wallets"
              value={stats.walletsConnected}
              change={10}
              icon={<Wallet className="w-6 h-6 text-blue-500" />}
              loading={loading}
            />
            <StatCard
              title="API Calls"
              value={stats.apiCalls}
              change={5}
              icon={<Activity className="w-6 h-6 text-purple-500" />}
              loading={loading}
            />
            <StatCard
              title="API Cost"
              value={formatRevenue(stats.apiCost)}
              change={-2}
              icon={<DollarSign className="w-6 h-6 text-green-500" />}
              loading={loading}
            />
            <StatCard
              title="Avg Generation Time"
              value={`${stats.averageGenerationTime}s`}
              change={-8}
              icon={<Clock className="w-6 h-6 text-orange-500" />}
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-6">
              <h3 className="text-lg font-bold mb-6">API Usage Distribution</h3>
              <div className="h-[300px]">
                {chartData ? (
                  <Bar
                    data={{
                      ...chartData,
                      datasets: [{
                        ...chartData.datasets[0],
                        backgroundColor: 'rgb(59, 130, 246)'
                      }]
                    }}
                    options={chartOptions}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Loading chart data...
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-6">
              <h3 className="text-lg font-bold mb-6">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#121214] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>API Status</span>
                  </div>
                  <span className="text-green-500">Operational</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#121214] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Database Status</span>
                  </div>
                  <span className="text-green-500">Healthy</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#121214] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>Storage Usage</span>
                  </div>
                  <span className="text-yellow-500">75% Capacity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-6">
            <h3 className="text-lg font-bold mb-6">Critical Alerts</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-500">High API Usage Warning</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    API usage is approaching the monthly limit. Consider upgrading your plan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-6">
              <h3 className="text-lg font-bold mb-6">System Resources</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Storage Usage</span>
                    <span className="text-sm">75%</span>
                  </div>
                  <div className="h-2 bg-[#242429] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">API Rate Limit</span>
                    <span className="text-sm">45%</span>
                  </div>
                  <div className="h-2 bg-[#242429] rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Database Connections</span>
                    <span className="text-sm">60%</span>
                  </div>
                  <div className="h-2 bg-[#242429] rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-6">
              <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-[#121214] hover:bg-[#242429] rounded-lg transition-colors text-left">
                  <h4 className="font-medium mb-1">Clear Cache</h4>
                  <p className="text-sm text-gray-400">Reset system cache</p>
                </button>
                <button className="p-4 bg-[#121214] hover:bg-[#242429] rounded-lg transition-colors text-left">
                  <h4 className="font-medium mb-1">Sync Data</h4>
                  <p className="text-sm text-gray-400">Force data sync</p>
                </button>
                <button className="p-4 bg-[#121214] hover:bg-[#242429] rounded-lg transition-colors text-left">
                  <h4 className="font-medium mb-1">Backup</h4>
                  <p className="text-sm text-gray-400">Create backup</p>
                </button>
                <button className="p-4 bg-[#121214] hover:bg-[#242429] rounded-lg transition-colors text-left">
                  <h4 className="font-medium mb-1">Test API</h4>
                  <p className="text-sm text-gray-400">Check API status</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};