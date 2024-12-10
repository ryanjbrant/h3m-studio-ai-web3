import React, { useState } from 'react';
import { Menu, X, User, MoreVertical } from 'lucide-react';
import { DropdownMenu } from './DropdownMenu';
import { Logo } from './Logo';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AuthModal } from '../auth/AuthModal';
import { UserMenu } from '../auth/UserMenu';
import { WalletButton } from './WalletButton';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user } = useAuthStore();

  const toolsItems = [
    { label: 'Text to 3D', href: '/tools/text-to-3d' },
    { label: 'Map Generator', href: '/tools/texture-generator' },
    { label: 'Scene Builder', href: '/tools/scene-builder' },
    { label: 'Resources', href: '/tools/resources' },
  ];

  const defiItems = [
    { label: 'Staking', href: '/defi/staking' },
    { label: 'Tokenomics', href: '/defi/tokenomics' },
    { label: 'Roadmap', href: '/defi/roadmap' },
    { label: 'Whitepaper', href: '/defi/whitepaper' },
  ];

  const aboutItems = [
    { label: 'Mission', href: '/about/mission' },
    { label: 'Vision', href: '/about/vision' },
    { label: 'Team', href: '/about/team' },
  ];

  return (
    <nav className="bg-[#0a0a0b] border-b border-[#242429] h-11">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-11">
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <DropdownMenu label="Tools" items={toolsItems} />
            <DropdownMenu label="DeFi" items={defiItems} />
            <DropdownMenu label="About" items={aboutItems} />
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <WalletButton />
            {user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuth(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0b] border border-[#242429] text-white rounded-md hover:bg-[#242429] transition-colors text-sm"
                >
                  <User className="w-4 h-4" />
                  Sign Up
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setShowAuth(true);
                  }}
                  className="p-1.5 hover:bg-[#242429] rounded-md transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white"
            >
              {isMobileMenuOpen ? (
                <X className="block h-5 w-5" />
              ) : (
                <Menu className="block h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute w-full bg-[#0a0a0b] border-b border-[#242429] z-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="px-3 py-2 text-sm font-medium text-gray-400">Tools</div>
            {toolsItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block px-3 py-2 text-base font-medium text-white hover:bg-[#242429]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="px-3 py-2 text-sm font-medium text-gray-400">DeFi</div>
            {defiItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block px-3 py-2 text-base font-medium text-white hover:bg-[#242429]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="px-3 py-2 text-sm font-medium text-gray-400">About</div>
            {aboutItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block px-3 py-2 text-base font-medium text-white hover:bg-[#242429]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="px-3 py-2 space-y-2">
              <WalletButton />
              {!user && (
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuth(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0b] border border-[#242429] text-white rounded-md hover:bg-[#242429] transition-colors text-sm"
                  >
                    <User className="w-4 h-4" />
                    Sign Up
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signin');
                      setShowAuth(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center p-1.5 hover:bg-[#242429] rounded-md transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onToggleMode={() => setAuthMode(mode => mode === 'signin' ? 'signup' : 'signin')}
        />
      )}
    </nav>
  );
};