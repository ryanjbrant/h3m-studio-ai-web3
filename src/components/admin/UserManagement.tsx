import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, Trash2, Search, Download } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';

export const UserManagement: React.FC = () => {
  const { users, error, fetchUsers, updateUserRole } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const exportUserData = () => {
    const csv = [
      ['Email', 'Role', 'Status', 'Wallet Connected', 'Downloads', 'Last Visit', 'Join Date'].join(','),
      ...filteredUsers.map(user => [
        user.email,
        user.role,
        user.disabled ? 'Disabled' : 'Active',
        user.walletConnected ? 'Yes' : 'No',
        user.downloads || 0,
        user.lastVisit?.toLocaleDateString() || 'Never',
        user.createdAt?.toLocaleDateString()
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

  return (
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
      </div>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#242429]">
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Wallet</th>
              <th className="text-left py-3 px-4">Downloads</th>
              <th className="text-left py-3 px-4">Last Visit</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-[#242429]">
                <td className="py-3 px-4">{user.email}</td>
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
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.disabled ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                  }`}>
                    {user.disabled ? 'Disabled' : 'Active'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.walletConnected ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    {user.walletConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </td>
                <td className="py-3 px-4">{user.downloads || 0}</td>
                <td className="py-3 px-4">
                  {user.lastVisit?.toLocaleDateString() || 'Never'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-1 hover:bg-[#242429] rounded-lg transition-colors"
                      title="Manage Permissions"
                    >
                      <Shield className="w-4 h-4 text-blue-500" />
                    </button>
                    <button 
                      className="p-1 hover:bg-[#242429] rounded-lg transition-colors"
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
  );
};