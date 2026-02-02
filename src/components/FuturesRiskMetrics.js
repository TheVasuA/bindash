'use client';

import { formatCurrency, formatPercent } from '@/lib/utils';

export default function FuturesRiskMetrics({ metrics, account, positions }) {
  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No futures data available
      </div>
    );
  }

  // Calculate total potential loss if all stop losses hit
  const totalStopLossValue = positions?.reduce((sum, p) => {
    if (p.stopLossValue && p.stopLossValue < 0) {
      return sum + p.stopLossValue;
    }
    return sum;
  }, 0) || 0;

  // Remaining balance if all SL hit
  const balanceAfterSL = (account?.totalWalletBalance || 0) + totalStopLossValue;

  const getRiskColor = (level) => {
    switch (level) {
      case 'Very High': return 'text-red-500 bg-red-500/10';
      case 'High': return 'text-orange-500 bg-orange-500/10';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'Low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const metricCards = [
    {
      label: 'Unrealized PnL',
      value: formatCurrency(parseFloat(metrics.totalPnL)),
      subValue: `${metrics.totalPnLPercent}%`,
      color: parseFloat(metrics.totalPnL) >= 0 ? 'text-green-500' : 'text-red-500',
    },
    {
      label: 'Wallet Balance',
      value: formatCurrency(account?.totalWalletBalance || 0),
      subValue: `Available: ${formatCurrency(account?.availableBalance || 0)}`,
      color: 'text-blue-500',
    },
    {
      label: 'If All SL Hit',
      value: formatCurrency(balanceAfterSL),
      subValue: `Loss: ${formatCurrency(totalStopLossValue)}`,
      color: balanceAfterSL > 0 ? 'text-yellow-500' : 'text-red-500',
    },
    {
      label: 'Margin Usage',
      value: `${metrics.marginUsage}%`,
      subValue: 'Used margin ratio',
      color: parseFloat(metrics.marginUsage) > 50 ? 'text-red-500' : 'text-green-500',
    },
    {
      label: 'Max Leverage',
      value: `${metrics.maxLeverage}x`,
      subValue: `Avg: ${metrics.avgLeverage}x`,
      color: metrics.maxLeverage >= 20 ? 'text-red-500' : metrics.maxLeverage >= 10 ? 'text-yellow-500' : 'text-green-500',
    },
    {
      label: 'Open Positions',
      value: metrics.positionCount,
      subValue: `Notional: ${formatCurrency(parseFloat(metrics.totalNotional))}`,
      color: 'text-purple-500',
    },
    {
      label: 'Long Exposure',
      value: formatCurrency(parseFloat(metrics.longExposure)),
      subValue: 'Total long value',
      color: 'text-green-500',
    },
    {
      label: 'Short Exposure',
      value: formatCurrency(parseFloat(metrics.shortExposure)),
      subValue: 'Total short value',
      color: 'text-red-500',
    },
    {
      label: 'Risk Level',
      value: metrics.riskLevel,
      subValue: 'Based on leverage & margin',
      isRisk: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3 md:gap-4">
      {metricCards.map((metric, index) => (
        <div key={index} className="bg-gray-800/50 rounded-xl p-3 md:p-4 border border-gray-700">
          <p className="text-gray-400 text-xs mb-1">{metric.label}</p>
          <p className={`text-base md:text-lg font-bold ${metric.isRisk ? getRiskColor(metric.value).split(' ')[0] : metric.color}`}>
            {metric.value}
          </p>
          <p className="text-gray-500 text-xs mt-1 truncate">{metric.subValue}</p>
        </div>
      ))}
    </div>
  );
}
