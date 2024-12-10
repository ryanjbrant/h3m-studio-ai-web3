import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { AuthModal } from './auth/AuthModal';
import { UserMenu } from './auth/UserMenu';

export const Header: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user } = useAuthStore();

  return (
    <header className="h-14 border-b border-[#242429] bg-[#0a0a0b]">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <h1 className="text-xl font-bold">Texture Generator</h1>
        
        {user ? (
          <UserMenu />
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Sign In
          </button>
        )}

        {showAuth && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuth(false)}
            onToggleMode={() => setAuthMode(mode => mode === 'signin' ? 'signup' : 'signin')}
          />
        )}
      </div>
    </header>
  );
};