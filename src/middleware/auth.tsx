import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAdmin } from '../hooks/useAdmin';

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export const withAuth = (WrappedComponent: React.ComponentType) => {
  return function WithAuthComponent(props: any) {
    const { user, loading } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && !user) {
        navigate('/login', { replace: true });
      }
    }, [user, loading, navigate]);

    if (loading) {
      return <LoadingSpinner />;
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export const withAdminAuth = (WrappedComponent: React.ComponentType) => {
  return function WithAdminAuthComponent(props: any) {
    const { user, loading: authLoading } = useAuthStore();
    const { isAdmin, loading: adminLoading } = useAdmin();
    const navigate = useNavigate();

    useEffect(() => {
      if (!authLoading && !adminLoading) {
        if (!user) {
          navigate('/login', { replace: true });
        } else if (!isAdmin) {
          navigate('/', { replace: true });
        }
      }
    }, [user, authLoading, adminLoading, isAdmin, navigate]);

    if (authLoading || adminLoading) {
      return <LoadingSpinner />;
    }

    if (!user || !isAdmin) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}; 