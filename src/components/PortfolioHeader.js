'use client';

import { formatCurrency } from '@/lib/utils';

export default function PortfolioHeader({ totalValue, futuresAccount, lastUpdated, onRefresh, loading }) {
  return (
    <div className="flex flex-col gap-4 mb-6 md:mb-8">
      {/* Title and Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-white mb-1">Portfolio Dashboard</h1>
          <p className="text-gray-400 text-xs md:text-sm">
            {lastUpdated && `Updated: ${new Date(lastUpdated).toLocaleTimeString()}`}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 md:p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
        >
          <svg
            className={`w-4 h-4 md:w-5 md:h-5 text-white ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
      
      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {futuresAccount && (
          <div className="bg-gray-800/50 rounded-xl p-3 md:p-4 border border-gray-700">
            <p className="text-gray-400 text-xs md:text-sm">Futures Margin</p>
            <p className="text-lg md:text-2xl font-bold text-white">{formatCurrency(futuresAccount.totalMarginBalance)}</p>
          </div>
        )}
        <div className="bg-gray-800/50 rounded-xl p-3 md:p-4 border border-gray-700">
          <p className="text-gray-400 text-xs md:text-sm">Spot Value</p>
          <p className="text-lg md:text-2xl font-bold text-white">{formatCurrency(totalValue)}</p>
        </div>
      </div>
    </div>
  );
}
