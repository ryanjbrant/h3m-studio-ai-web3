import React from 'react';
import { BarChart2 } from 'lucide-react';

interface Asset {
  symbol: string;
  amount: number;
}

interface NetworkAssetsProps {
  network: string;
  totalValue: number;
  assets: Asset[];
}

export const NetworkAssets: React.FC<NetworkAssetsProps> = ({
  network,
  totalValue,
  assets,
}) => {
  return (
    <div className="bg-[#121214] border border-[#242429] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium">{network}</h2>
          <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
        </div>
        <button className="p-2 hover:bg-[#242429] rounded-lg transition-colors">
          <BarChart2 className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {assets.map((asset) => (
          <div key={asset.symbol} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#242429] flex items-center justify-center">
                <span className="text-xs font-medium">{asset.symbol}</span>
              </div>
              <span className="font-medium">{asset.amount}</span>
            </div>
            <span className="text-gray-400">{asset.symbol}</span>
          </div>
        ))}
      </div>
    </div>
  );
};