import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAdmin } from '../../hooks/useAdmin';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { UserManagement } from '../../components/admin/UserManagement';
import { ContentManagement } from '../../components/admin/ContentManagement';
import { AnalyticsOverview } from '../../components/admin/AnalyticsOverview';
import { FinancialMetrics } from '../../components/admin/FinancialMetrics';

const DashboardOverview = () => (
  <div className="space-y-8">
    <AnalyticsOverview />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <UserManagement />
      <ContentManagement />
    </div>
    <FinancialMetrics />
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/content" element={<ContentManagement />} />
        <Route path="/analytics" element={<AnalyticsOverview />} />
        <Route path="/settings" element={<div>Settings</div>} />
      </Routes>
    </AdminLayout>
  );
};

export default Dashboard;