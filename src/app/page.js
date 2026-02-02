'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFetch } from '@/lib/utils';
import PortfolioHeader from '@/components/PortfolioHeader';
import RiskMetrics from '@/components/RiskMetrics';
import HoldingsTable from '@/components/HoldingsTable';
import AllocationChart from '@/components/AllocationChart';
import OpenOrders from '@/components/OpenOrders';
import LoadingSpinner from '@/components/LoadingSpinner';
import FuturesPositions from '@/components/FuturesPositions';
import FuturesRiskMetrics from '@/components/FuturesRiskMetrics';

export default function Home() {
  const [activeTab, setActiveTab] = useState('futures');
  const REFRESH_INTERVAL = 2000; // 2 seconds

  const { 
    data: portfolioData, 
    loading: portfolioLoading, 
    error: portfolioError,
    refetch: refetchPortfolio 
  } = useFetch('/api/portfolio', { refreshInterval: REFRESH_INTERVAL });

  const { 
    data: ordersData, 
    loading: ordersLoading 
  } = useFetch('/api/orders?type=open', { refreshInterval: REFRESH_INTERVAL });

  const {
    data: futuresData,
    loading: futuresLoading,
    error: futuresError,
    refetch: refetchFutures
  } = useFetch('/api/futures?type=positions', { refreshInterval: REFRESH_INTERVAL });

  if (portfolioLoading && futuresLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <LoadingSpinner text="Loading portfolio data..." />
      </div>
    );
  }

  const { totalValue, holdings, riskMetrics, lastUpdated } = portfolioData || {};
  const { account: futuresAccount, positions: futuresPositions, riskMetrics: futuresRiskMetrics } = futuresData || {};

  const handleRefresh = () => {
    refetchPortfolio();
    refetchFutures();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header with Total Value */}
        <PortfolioHeader
          totalValue={totalValue}
          futuresAccount={futuresAccount}
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          loading={portfolioLoading || futuresLoading}
        />

        {/* Error Alert */}
        {(portfolioError || futuresError) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
            <p className="text-red-400 text-sm md:text-base">Error: {portfolioError || futuresError}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4 md:mb-6">
          <button
            onClick={() => setActiveTab('futures')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-medium text-sm md:text-base transition-colors ${
              activeTab === 'futures'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Futures
          </button>
          <button
            onClick={() => setActiveTab('spot')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-medium text-sm md:text-base transition-colors ${
              activeTab === 'spot'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            Spot
          </button>
          <Link
            href="/compound"
            className="flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-medium text-sm md:text-base transition-colors bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 text-center"
          >
            🎯 Goal Tracker
          </Link>
        </div>

        {activeTab === 'futures' ? (
          <>
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
          </>
        ) : (
          <>
            {/* Spot Risk Metrics */}
            <section className="mb-4 md:mb-8">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Spot Risk Analysis</h2>
              <RiskMetrics metrics={riskMetrics} />
            </section>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 mb-4 md:mb-8">
              {/* Holdings Table */}
              <div className="lg:col-span-2 bg-gray-800/50 rounded-xl border border-gray-700 p-3 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Holdings</h2>
                <HoldingsTable holdings={holdings} />
              </div>

              {/* Allocation Chart */}
              <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-3 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Allocation</h2>
                <AllocationChart holdings={holdings} />
              </div>
            </div>

            {/* Open Orders */}
            <section className="bg-gray-800/50 rounded-xl border border-gray-700 p-3 md:p-6 mb-4 md:mb-8">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Open Spot Orders</h2>
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <OpenOrders orders={ordersData} />
              )}
            </section>
          </>
        )}

        {/* Footer */}
        <footer className="text-center text-gray-500 text-xs md:text-sm py-4">
          <p>Binance Portfolio Risk Dashboard</p>
        </footer>
      </div>
    </div>
  );
}
