import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex-shrink-0 flex items-center h-11">
      <img
        src="https://h3mstudio-web.s3.us-west-1.amazonaws.com/logos/h3m-logo-02-white.gif"
        alt="H3M Logo"
        className="h-3.5 w-auto object-contain"
      />
    </Link>
  );
};