import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { UserManagement } from '../../components/admin/UserManagement';
import { ContentManagement } from '../../components/admin/ContentManagement';
import { AnalyticsOverview } from '../../components/admin/AnalyticsOverview';
import { FinancialMetrics } from '../../components/admin/FinancialMetrics';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <AnalyticsOverview />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UserManagement />
          <ContentManagement />
        </div>
        <FinancialMetrics />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;