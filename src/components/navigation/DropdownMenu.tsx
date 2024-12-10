import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface DropdownItem {
  label: string;
  href: string;
}

interface DropdownMenuProps {
  label: string;
  items: DropdownItem[];
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<number>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleItemClick = (href: string) => {
    setIsOpen(false);
    navigate(href);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="flex items-center gap-1 text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
      >
        {label}
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-[#0a0a0b] border border-[#242429] z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="py-1">
            {items.map((item) => (
              <button
                key={item.href}
                onClick={() => handleItemClick(item.href)}
                className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-[#242429] transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};