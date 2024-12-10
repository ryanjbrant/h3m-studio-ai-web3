import React, { useState } from 'react';
import { QrCode, Send, Clock } from 'lucide-react';

interface RecentContact {
  address: string;
  name: string;
  lastSent: string;
}

const recentContacts: RecentContact[] = [
  {
    address: '0x1234...5678',
    name: 'Alice',
    lastSent: '2024-02-19'
  },
  {
    address: '0x8765...4321',
    name: 'Bob',
    lastSent: '2024-02-18'
  },
  {
    address: '0x9876...5432',
    name: 'Charlie',
    lastSent: '2024-02-17'
  }
];

export const SendTab: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle send transaction
    console.log('Sending', amount, 'HMMM to', address);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Recipient Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter wallet address"
              className="w-full px-4 py-2 bg-[#0a0a0b] border border-[#242429] rounded-lg pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-[#242429] rounded-lg transition-colors"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Amount (HMMM)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2 bg-[#0a0a0b] border border-[#242429] rounded-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send HMMM
        </button>
      </form>

      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Contacts
        </h3>
        <div className="space-y-3">
          {recentContacts.map((contact) => (
            <button
              key={contact.address}
              onClick={() => setAddress(contact.address)}
              className="w-full p-4 bg-[#121214] border border-[#242429] rounded-lg hover:bg-[#242429] transition-colors flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-gray-400">{contact.address}</p>
              </div>
              <p className="text-sm text-gray-400">
                {new Date(contact.lastSent).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};