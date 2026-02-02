'use client';

import { formatCurrency } from '@/lib/utils';

export default function PortfolioHeader({ totalValue, futuresAccount, lastUpdated, onRefresh, loading }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Portfolio Dashboard</h1>
        <p className="text-gray-400">
          {lastUpdated && `Last updated: ${new Date(lastUpdated).toLocaleString()}`}
        </p>
      </div>
      <div className="flex items-center gap-6">
        {futuresAccount && (
          <div className="text-right">
            <p className="text-gray-400 text-sm">Futures Margin</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(futuresAccount.totalMarginBalance)}</p>
          </div>
        )}
        <div className="text-right">
          <p className="text-gray-400 text-sm">Spot Value</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
        >
          <svg
            className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`}
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
    </div>
  );
}
