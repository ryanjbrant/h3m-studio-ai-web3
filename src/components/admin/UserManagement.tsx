import React, { useEffect, useState } from 'react';
import { 
  Users, UserPlus, Shield, Trash2, Search, Download, Eye, 
  Wallet, Box, Clock, BarChart2, Settings, AlertCircle,
  ChevronDown, Filter, MoreVertical, Ban, CheckCircle, X, HardDrive
} from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

interface User {
  id: string;
  email: string;
  role: string;
  disabled?: boolean;
  walletConnected?: boolean;
  downloads?: number;
  lastVisit?: Timestamp;
  createdAt?: Timestamp;
  displayName?: string;
  photoURL?: string;
  generationMetrics?: {
    totalGenerations: number;
    lastGenerationDate: Timestamp | null;
    generationsByType: {
      text: number;
      image: number;
    }
  };
  sceneCount?: number;
  totalStorage?: number;
  lastGeneration?: Timestamp;
  lastScene?: Timestamp;
  status?: 'active' | 'inactive' | 'suspended';
  walletAddress?: string;
  apiUsage?: {
    calls: number;
    cost: number;
    lastCall?: Timestamp;
  };
}

interface UserActivityData {
  date: string;
  generations: number;
  scenes: number;
  apiCalls: number;
}

interface UserModal {
  type: 'activity' | 'generations' | 'scenes' | 'settings' | null;
  userId: string | null;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [modal, setModal] = useState<UserModal>({ type: null, userId: null });
  const [activityData, setActivityData] = useState<UserActivityData[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'lastVisit',
    direction: 'desc'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      setUsers(userData);
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async (userId: string) => {
    try {
      // Fetch user's generations
      const generationsRef = collection(db, 'generations');
      const generationsQuery = query(generationsRef, where('userId', '==', userId));
      const generationsSnapshot = await getDocs(generationsQuery);

      // Fetch user's scenes
      const scenesRef = collection(db, 'scenes');
      const scenesQuery = query(scenesRef, where('userId', '==', userId));
      const scenesSnapshot = await getDocs(scenesQuery);

      // Fetch user's API calls
      const apiCallsRef = collection(db, 'apiCalls');
      const apiCallsQuery = query(apiCallsRef, where('userId', '==', userId));
      const apiCallsSnapshot = await getDocs(apiCallsQuery);

      // Process data for chart
      const activityMap = new Map<string, UserActivityData>();

      // Helper function to increment counts
      const incrementCount = (date: string, type: 'generations' | 'scenes' | 'apiCalls') => {
        if (!activityMap.has(date)) {
          activityMap.set(date, {
            date,
            generations: 0,
            scenes: 0,
            apiCalls: 0
          });
        }
        const data = activityMap.get(date)!;
        data[type]++;
        activityMap.set(date, data);
      };

      // Process generations
      generationsSnapshot.docs.forEach(doc => {
        const date = new Date(doc.data().timestamp.toDate()).toLocaleDateString();
        incrementCount(date, 'generations');
      });

      // Process scenes
      scenesSnapshot.docs.forEach(doc => {
        const date = new Date(doc.data().timestamp.toDate()).toLocaleDateString();
        incrementCount(date, 'scenes');
      });

      // Process API calls
      apiCallsSnapshot.docs.forEach(doc => {
        const date = new Date(doc.data().timestamp.toDate()).toLocaleDateString();
        incrementCount(date, 'apiCalls');
      });

      setActivityData(Array.from(activityMap.values()));
    } catch (error) {
      console.error('Error fetching user activity:', error);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { 
        role,
        updatedAt: Timestamp.now()
      });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to update role:', error);
      setError('Failed to update user role');
    }
  };

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status,
        updatedAt: Timestamp.now()
      });
      await fetchUsers();
    } catch (error) {
      console.error('Failed to update status:', error);
      setError('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      await fetchUsers();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete user:', error);
      setError('Failed to delete user');
    }
  };

  const handleSort = (key: keyof User) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportUserData = () => {
    const csv = [
      [
        'Email',
        'Role',
        'Status',
        'Wallet Connected',
        'Wallet Address',
        'Downloads',
        'Generations',
        'Scenes',
        'Storage Used',
        'API Calls',
        'API Cost',
        'Last Visit',
        'Join Date'
      ].join(','),
      ...filteredUsers.map(user => [
        user.email,
        user.role,
        user.status || 'active',
        user.walletConnected ? 'Yes' : 'No',
        user.walletAddress || '',
        user.downloads || 0,
        user.generationMetrics?.totalGenerations || 0,
        user.sceneCount || 0,
        formatStorage(user.totalStorage || 0),
        user.apiUsage?.calls || 0,
        formatCurrency(user.apiUsage?.cost || 0),
        formatDate(user.lastVisit),
        formatDate(user.createdAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp.toDate()).toLocaleDateString();
  };

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = !selectedRole || user.role === selectedRole;
      const matchesStatus = !selectedStatus || user.status === selectedStatus;
      const matchesTab = selectedTab === 'all' ||
        (selectedTab === 'wallet' && user.walletConnected) ||
        (selectedTab === 'active' && user.status === 'active') ||
        (selectedTab === 'inactive' && user.status === 'inactive');
      return matchesSearch && matchesRole && matchesStatus && matchesTab;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key as keyof User];
      const bValue = b[sortConfig.key as keyof User];
      
      if (!aValue || !bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#242429'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9ca3af'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={exportUserData}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#242429] text-white rounded-lg hover:bg-[#2a2a2f] transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#242429] mb-6">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-4 py-2 -mb-px border-b-2 ${
              selectedTab === 'all'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setSelectedTab('wallet')}
            className={`px-4 py-2 -mb-px border-b-2 ${
              selectedTab === 'wallet'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Wallet Connected
          </button>
          <button
            onClick={() => setSelectedTab('active')}
            className={`px-4 py-2 -mb-px border-b-2 ${
              selectedTab === 'active'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Active Users
          </button>
          <button
            onClick={() => setSelectedTab('inactive')}
            className={`px-4 py-2 -mb-px border-b-2 ${
              selectedTab === 'inactive'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            Inactive Users
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0a0a0b] border border-[#242429] rounded-lg"
            />
          </div>
          <select
            value={selectedRole || ''}
            onChange={(e) => setSelectedRole(e.target.value || null)}
            className="px-4 py-2 bg-[#0a0a0b] border border-[#242429] rounded-lg"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
          <select
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value || null)}
            className="px-4 py-2 bg-[#0a0a0b] border border-[#242429] rounded-lg"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-500">Error</h4>
                <p className="text-sm text-gray-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#242429]">
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center gap-1 hover:text-blue-500"
                  >
                    Email
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Wallet</th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('generationMetrics.totalGenerations')}
                    className="flex items-center gap-1 hover:text-blue-500"
                  >
                    Generations
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('sceneCount')}
                    className="flex items-center gap-1 hover:text-blue-500"
                  >
                    Scenes
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('lastVisit')}
                    className="flex items-center gap-1 hover:text-blue-500"
                  >
                    Last Visit
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#242429]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || user.email}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                          {user.email[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user.email}</p>
                        {user.displayName && (
                          <p className="text-sm text-gray-400">{user.displayName}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={user.role || 'user'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-[#0a0a0b] border border-[#242429] rounded-lg px-2 py-1"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={user.status || 'active'}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className={`px-2 py-1 rounded-lg ${
                        user.status === 'active'
                          ? 'bg-green-500/10 text-green-500'
                          : user.status === 'suspended'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.walletConnected ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {user.walletConnected ? (
                        <div className="flex items-center gap-1">
                          <Wallet className="w-3 h-3" />
                          Connected
                        </div>
                      ) : 'Not Connected'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <span className="font-medium">{user.generationMetrics?.totalGenerations || 0}</span>
                        {user.generationMetrics?.generationsByType && (
                          <div className="text-xs text-gray-400 mt-1">
                            <span className="mr-2">Text: {user.generationMetrics.generationsByType.text}</span>
                            <span>Image: {user.generationMetrics.generationsByType.image}</span>
                          </div>
                        )}
                      </div>
                      {user.generationMetrics?.totalGenerations > 0 && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setModal({ type: 'generations', userId: user.id });
                          }}
                          className="p-1 hover:bg-[#242429] rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.sceneCount || 0}</span>
                      {user.sceneCount > 0 && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setModal({ type: 'scenes', userId: user.id });
                          }}
                          className="p-1 hover:bg-[#242429] rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">{formatDate(user.lastVisit)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setModal({ type: 'activity', userId: user.id });
                          fetchUserActivity(user.id);
                        }}
                        className="p-1 hover:bg-[#242429] rounded-lg transition-colors"
                        title="View Activity"
                      >
                        <BarChart2 className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setModal({ type: 'settings', userId: user.id });
                        }}
                        className="p-1 hover:bg-[#242429] rounded-lg transition-colors"
                        title="User Settings"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Modal */}
      {modal.type === 'activity' && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#121214] rounded-lg p-6 w-full max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">User Activity</h3>
              <button
                onClick={() => setModal({ type: null, userId: null })}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Box className="w-4 h-4 text-blue-500" />
                  <h4 className="font-medium">Total Generations</h4>
                </div>
                <p className="text-2xl font-bold">{selectedUser.generationMetrics?.totalGenerations || 0}</p>
              </div>
              <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Box className="w-4 h-4 text-purple-500" />
                  <h4 className="font-medium">Total Scenes</h4>
                </div>
                <p className="text-2xl font-bold">{selectedUser.sceneCount || 0}</p>
              </div>
              <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-4 h-4 text-green-500" />
                  <h4 className="font-medium">Storage Used</h4>
                </div>
                <p className="text-2xl font-bold">{formatStorage(selectedUser.totalStorage || 0)}</p>
              </div>
            </div>

            <div className="h-[300px]">
              {activityData.length > 0 ? (
                <Line
                  data={{
                    labels: activityData.map(d => d.date),
                    datasets: [
                      {
                        label: 'Generations',
                        data: activityData.map(d => d.generations),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                      },
                      {
                        label: 'Scenes',
                        data: activityData.map(d => d.scenes),
                        borderColor: 'rgb(168, 85, 247)',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        tension: 0.4
                      },
                      {
                        label: 'API Calls',
                        data: activityData.map(d => d.apiCalls),
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4
                      }
                    ]
                  }}
                  options={chartOptions}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No activity data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#121214] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Delete User</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete {selectedUser.email}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-[#242429] rounded-lg hover:bg-[#2a2a2f]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && modal.type === 'generations' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#121214] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-[#242429] flex justify-between items-center">
              <h3 className="text-lg font-medium">Generation Details</h3>
              <button
                onClick={() => setModal({ type: null, userId: null })}
                className="p-2 hover:bg-[#242429] rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Box className="w-4 h-4" />
                  <h4 className="font-medium">Total Generations</h4>
                </div>
                <p className="text-2xl font-bold">{selectedUser.generationMetrics?.totalGenerations || 0}</p>
                <div className="mt-2 text-sm text-gray-400">
                  <div>Text to 3D: {selectedUser.generationMetrics?.generationsByType.text || 0}</div>
                  <div>Image to 3D: {selectedUser.generationMetrics?.generationsByType.image || 0}</div>
                </div>
              </div>
              
              <div className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" />
                  <h4 className="font-medium">Last Generation</h4>
                </div>
                <p className="text-lg">
                  {selectedUser.generationMetrics?.lastGenerationDate
                    ? new Date(selectedUser.generationMetrics.lastGenerationDate.toMillis()).toLocaleString()
                    : 'Never'}
                </p>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#242429]">
              <h4 className="font-medium mb-4">Recent Generations</h4>
              <div className="space-y-4">
                {activityData.map((activity, index) => (
                  <div key={index} className="bg-[#0a0a0b] border border-[#242429] rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{activity.date}</p>
                        <div className="text-sm text-gray-400 mt-1">
                          <span className="mr-4">Generations: {activity.generations}</span>
                          <span>Scenes: {activity.scenes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};