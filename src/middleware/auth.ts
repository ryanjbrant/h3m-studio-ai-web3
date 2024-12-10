import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const withAuth = (WrappedComponent: React.ComponentType) => {
  return function WithAuthComponent(props: any) {
    const { user, loading } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && !user) {
        navigate('/login');
      }
    }, [user, loading, navigate]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export const withAdminAuth = (WrappedComponent: React.ComponentType) => {
  return function WithAdminAuthComponent(props: any) {
    const { user, loading } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && (!user || !user.isAdmin)) {
        navigate('/login');
      }
    }, [user, loading, navigate]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!user?.isAdmin) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};