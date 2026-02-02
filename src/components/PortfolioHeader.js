'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function PortfolioHeader({ totalValue, futuresAccount, lastUpdated, onRefresh, loading }) {
  const [goalData, setGoalData] = useState(null);
  const targetAmount = 100000; // $100,000 target

  // Load goal data from database
  useEffect(() => {
    const loadGoalData = async () => {
      try {
        const res = await fetch('/api/compound');
        const data = await res.json();
        setGoalData(data);
      } catch (error) {
        console.error('Failed to load goal data:', error);
      }
    };
    loadGoalData();
  }, []);

  const currentBalance = futuresAccount?.totalWalletBalance || 0;
  const startingBalance = goalData?.startingBalance || currentBalance;
  const completedTrades = goalData?.completedTrades?.length || 0;
  
  // Calculate progress to goal
  const progressPercent = startingBalance > 0 
    ? Math.min(((currentBalance - startingBalance) / (targetAmount - startingBalance)) * 100, 100)
    : 0;
  
  // Calculate total trades needed
  const calculateTotalTrades = () => {
    if (startingBalance <= 0) return 0;
    let balance = startingBalance;
    let trades = 0;
    while (balance < targetAmount && trades < 500) {
      balance *= 1.02; // 2% compound
      trades++;
    }
    return trades;
  };
  
  const totalTrades = calculateTotalTrades();
  const tradesProgress = totalTrades > 0 ? (completedTrades / totalTrades) * 100 : 0;

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
      
      {/* Main Balance Card with Goal Progress */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 md:p-6 border border-blue-500/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Current Running Balance */}
          <div>
            <p className="text-gray-400 text-xs md:text-sm">Current Balance</p>
            <p className="text-2xl md:text-4xl font-bold text-white">
              {formatCurrency((futuresAccount?.totalWalletBalance || 0) + (futuresAccount?.totalUnrealizedProfit || 0))}
            </p>
            {futuresAccount?.totalUnrealizedProfit !== undefined && (
              <p className={`text-sm ${futuresAccount.totalUnrealizedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                Unrealized: {futuresAccount.totalUnrealizedProfit >= 0 ? '+' : ''}{formatCurrency(futuresAccount.totalUnrealizedProfit)}
              </p>
            )}
          </div>

          {/* Goal Target */}
          <div className="text-left md:text-right">
            <p className="text-gray-400 text-xs md:text-sm">Goal Target</p>
            <p className="text-xl md:text-2xl font-bold text-green-400">{formatCurrency(targetAmount)}</p>
            <p className="text-gray-500 text-xs">
              {completedTrades}/{totalTrades} trades completed
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress to $100K</span>
            <span>{tradesProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(tradesProgress, 0)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-500">Start: {formatCurrency(startingBalance)}</span>
            <Link href="/compound" className="text-blue-400 hover:text-blue-300">
              View Goal →
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Balance Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-3 md:p-4 border border-gray-700">
          <p className="text-gray-400 text-xs md:text-sm">Wallet Balance</p>
          <p className="text-lg md:text-xl font-bold text-white">
            {formatCurrency(futuresAccount?.totalWalletBalance || 0)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 md:p-4 border border-gray-700">
          <p className="text-gray-400 text-xs md:text-sm">Available Margin</p>
          <p className="text-lg md:text-xl font-bold text-white">
            {formatCurrency(futuresAccount?.availableBalance || 0)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 md:p-4 border border-gray-700">
          <p className="text-gray-400 text-xs md:text-sm">Unrealized PnL</p>
          <p className={`text-lg md:text-xl font-bold ${(futuresAccount?.totalUnrealizedProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(futuresAccount?.totalUnrealizedProfit || 0) >= 0 ? '+' : ''}{formatCurrency(futuresAccount?.totalUnrealizedProfit || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
