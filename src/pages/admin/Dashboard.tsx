import { withAdminAuth } from '../../middleware/auth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { GenerationsPanel } from '../../components/admin/GenerationsPanel';
import { UserManagement } from '../../components/admin/UserManagement';
import { ContentManagement } from '../../components/admin/ContentManagement';
import { AnalyticsOverview } from '../../components/admin/AnalyticsOverview';
import { Routes, Route, Navigate } from 'react-router-dom';

function Dashboard() {
  return (
    <AdminLayout>
      <div className="p-6">
        <Routes>
          <Route index element={<AnalyticsOverview />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="generations" element={<GenerationsPanel />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(Dashboard);