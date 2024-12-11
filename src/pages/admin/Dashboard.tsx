import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { withAdminAuth } from '../../middleware/auth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { UserManagement } from '../../components/admin/UserManagement';
import { ContentManagement } from '../../components/admin/ContentManagement';
import { AnalyticsOverview } from '../../components/admin/AnalyticsOverview';
import { GenerationsPanel } from '../../components/admin/GenerationsPanel';
import { Settings } from '../../components/admin/Settings';

const DashboardOverview = () => (
  <div className="space-y-8">
    <AnalyticsOverview />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Recent Users</h2>
        <UserManagement limit={5} />
      </div>
      <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Recent Generations</h2>
        <GenerationsPanel limit={5} />
      </div>
    </div>
  </div>
);

function Dashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<DashboardOverview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="generations" element={<GenerationsPanel />} />
        <Route path="analytics" element={<AnalyticsOverview />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default withAdminAuth(Dashboard);