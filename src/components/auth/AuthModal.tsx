import React from 'react';
import { X } from 'lucide-react';
import { AuthForm } from './AuthForm';

interface AuthModalProps {
  mode: 'signin' | 'signup';
  onClose: () => void;
  onToggleMode: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onToggleMode }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0a0a0b] rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-6">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>
        <AuthForm mode={mode} />
        <div className="mt-4 text-center">
          <button
            onClick={onToggleMode}
            className="text-blue-500 hover:text-blue-400 text-sm"
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};