'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFetch } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import FuturesPositions from '@/components/FuturesPositions';
import FuturesRiskMetrics from '@/components/FuturesRiskMetrics';

export default function Home() {
  const [displayError, setDisplayError] = useState(null);
  const [goalData, setGoalData] = useState(null);
  const REFRESH_INTERVAL = 3000; // 3 seconds

  const {
    data: futuresData,
    loading: futuresLoading,
    error: futuresError,
    refetch: refetchFutures,
    apiWeight
  } = useFetch('/api/futures?type=positions', { refreshInterval: REFRESH_INTERVAL });

  // Load goal data
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

  useEffect(() => {
    if (futuresError) {
      setDisplayError(futuresError);
    } else if (displayError) {
      const timer = setTimeout(() => setDisplayError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [futuresError, displayError]);

  if (futuresLoading && !futuresData) {
    return (
      <div className="min-h-screen bg-gray-900">
        <LoadingSpinner text="Loading futures data..." />
      </div>
    );
  }

  const { account: futuresAccount, positions: futuresPositions, riskMetrics: futuresRiskMetrics } = futuresData || {};
  
  const currentBalance = (futuresAccount?.totalWalletBalance || 0) + (futuresAccount?.totalUnrealizedProfit || 0);
  const startingBalance = goalData?.startingBalance || futuresAccount?.totalWalletBalance || 0;
  const completedTrades = goalData?.completedTrades?.length || 0;
  const targetAmount = 100000;

  const calculateTotalTrades = () => {
    if (startingBalance <= 0) return 0;
    let balance = startingBalance;
    let trades = 0;
    while (balance < targetAmount && trades < 500) {
      balance *= 1.02;
      trades++;
    }
    return trades;
  };
  const totalTrades = calculateTotalTrades();
  const tradesProgress = totalTrades > 0 ? (completedTrades / totalTrades) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <nav className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-white font-bold hidden sm:block">Bala Dashboard</span>
              </Link>
              <div className="flex items-center gap-1">
                <span className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg">
                  Futures
                </span>
                <Link href="/spot" className="px-3 py-1.5 text-gray-400 hover:text-white text-sm font-medium rounded-lg hover:bg-gray-700/50 transition-colors">
                  Spot
                </Link>
                <Link href="/compound" className="px-3 py-1.5 text-gray-400 hover:text-white text-sm font-medium rounded-lg hover:bg-gray-700/50 transition-colors">
                  🎯 Goal
                </Link>
                <Link href="/trades" className="px-3 py-1.5 text-gray-400 hover:text-white text-sm font-medium rounded-lg hover:bg-gray-700/50 transition-colors">
                  📊 History
                </Link>
              </div>
            </div>
            <button
              onClick={refetchFutures}
              disabled={futuresLoading}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 rounded-lg transition-all"
            >
              <svg className={`w-4 h-4 text-white ${futuresLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Balance Header Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Current Balance</p>
                <p className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                  {formatCurrency(currentBalance)}
                </p>
                {futuresAccount?.totalUnrealizedProfit !== undefined && (
                  <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    futuresAccount.totalUnrealizedProfit >= 0 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {futuresAccount.totalUnrealizedProfit >= 0 ? '↑' : '↓'}
                    {futuresAccount.totalUnrealizedProfit >= 0 ? '+' : ''}{formatCurrency(futuresAccount.totalUnrealizedProfit)} unrealized
                  </div>
                )}
              </div>
              <div className="text-left md:text-right">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Goal Target</p>
                <p className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text">
                  {formatCurrency(targetAmount)}
                </p>
                <p className="text-gray-500 text-xs mt-1">{completedTrades} of {totalTrades} trades</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
              <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                <span>Progress to $100K</span>
                <span className="font-mono text-white">{tradesProgress.toFixed(1)}%</span>
              </div>
              <div className="relative w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(tradesProgress, 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 md:p-4 border border-gray-700/50">
            <p className="text-gray-500 text-xs mb-1">Wallet</p>
            <p className="text-base md:text-xl font-bold text-white">
              {formatCurrency(futuresAccount?.totalWalletBalance || 0)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 md:p-4 border border-gray-700/50">
            <p className="text-gray-500 text-xs mb-1">Margin</p>
            <p className="text-base md:text-xl font-bold text-white">
              {formatCurrency(futuresAccount?.availableBalance || 0)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 md:p-4 border border-gray-700/50">
            <p className="text-gray-500 text-xs mb-1">PnL</p>
            <p className={`text-base md:text-xl font-bold ${(futuresAccount?.totalUnrealizedProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(futuresAccount?.totalUnrealizedProfit || 0) >= 0 ? '+' : ''}{formatCurrency(futuresAccount?.totalUnrealizedProfit || 0)}
            </p>
          </div>
        </div>

        {/* API Weight Display */}
        {apiWeight !== null && (
          <div className={`mb-4 px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2 ${
            apiWeight > 1000 ? 'bg-red-500/20 border border-red-500/30 text-red-400' :
            apiWeight > 600 ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400' :
            'bg-green-500/20 border border-green-500/30 text-green-400'
          }`}>
            <span>⚡ API Weight:</span>
            <span className="font-bold">{apiWeight}/1200</span>
            <div className="flex-1 bg-gray-700 rounded-full h-1.5 ml-2">
              <div 
                className={`h-1.5 rounded-full transition-all ${
                  apiWeight > 1000 ? 'bg-red-500' : apiWeight > 600 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min((apiWeight / 1200) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Futures Risk Metrics */}
        <section className="mb-4 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Futures Risk Analysis</h2>
          {futuresLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <FuturesRiskMetrics metrics={futuresRiskMetrics} account={futuresAccount} positions={futuresPositions} />
          )}
        </section>

        {/* Futures Positions */}
        <section className="bg-gray-800/50 rounded-xl border border-gray-700 p-3 md:p-6 mb-4 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Open Positions</h2>
          {futuresLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <FuturesPositions positions={futuresPositions} onRefresh={refetchFutures} />
          )}
        </section>

        {/* Error Card */}
        {displayError && (
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
            <div className="bg-gray-800 border border-red-500/50 rounded-xl shadow-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-xl">⚠️</span>
                <div className="flex-1">
                  <h4 className="text-red-400 font-medium text-sm mb-1">API Error</h4>
                  <p className="text-gray-300 text-xs">{displayError}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={refetchFutures} className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium">
                  Retry
                </button>
                <button onClick={() => setDisplayError(null)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="text-center text-gray-500 text-xs md:text-sm py-4">
          <p>Binance Portfolio Risk Dashboard</p>
        </footer>
      </div>
    </div>
  );
}
