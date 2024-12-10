import React from 'react';
import { QrCode, CreditCard } from 'lucide-react';

export const ActionButtons: React.FC = () => {
  return (
    <div className="flex gap-3">
      <button className="flex items-center gap-2 px-4 py-2 bg-[#121214] border border-[#242429] rounded-lg text-sm font-medium hover:bg-[#242429] transition-colors">
        <QrCode className="w-4 h-4" />
        QR Code
      </button>
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
        <CreditCard className="w-4 h-4" />
        Buy Crypto
      </button>
    </div>
  );
};