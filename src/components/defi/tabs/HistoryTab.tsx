import React from 'react';
import { Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'stake' | 'unstake' | 'reward';
  amount: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

const transactions: Transaction[] = [
  {
    id: '1',
    type: 'stake',
    amount: 500,
    timestamp: '2024-02-20T10:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    type: 'reward',
    amount: 25,
    timestamp: '2024-02-19T15:45:00Z',
    status: 'completed'
  },
  {
    id: '3',
    type: 'unstake',
    amount: 200,
    timestamp: '2024-02-18T09:15:00Z',
    status: 'completed'
  }
];

export const HistoryTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold">Transaction History</h2>
        <button className="text-sm text-blue-500 hover:text-blue-400">
          Export CSV
        </button>
      </div>

      <div className="space-y-4">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-[#121214] border border-[#242429] rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${
                tx.type === 'stake' ? 'bg-green-500/10' :
                tx.type === 'unstake' ? 'bg-red-500/10' :
                'bg-blue-500/10'
              }`}>
                {tx.type === 'stake' ? (
                  <ArrowUpRight className={`w-5 h-5 text-green-500`} />
                ) : tx.type === 'unstake' ? (
                  <ArrowDownRight className={`w-5 h-5 text-red-500`} />
                ) : (
                  <Clock className={`w-5 h-5 text-blue-500`} />
                )}
              </div>
              <div>
                <p className="font-medium capitalize">{tx.type}</p>
                <p className="text-sm text-gray-400">
                  {new Date(tx.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-medium ${
                tx.type === 'stake' ? 'text-green-500' :
                tx.type === 'unstake' ? 'text-red-500' :
                'text-blue-500'
              }`}>
                {tx.type === 'stake' ? '+' : tx.type === 'unstake' ? '-' : '+'}
                {tx.amount} HMMM
              </p>
              <p className="text-sm text-gray-400 capitalize">{tx.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};