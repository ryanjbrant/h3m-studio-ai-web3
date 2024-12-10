import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export const NavLink: React.FC<NavLinkProps> = ({ to, children, className = '' }) => {
  return (
    <Link
      to={to}
      className={`text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors ${className}`}
    >
      {children}
    </Link>
  );
};