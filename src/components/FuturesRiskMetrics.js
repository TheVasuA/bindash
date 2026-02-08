import { formatCurrency, formatPercent } from '@/lib/utils';
export default function FuturesRiskMetrics({ metrics, account, positions }) {
  // Target value for achievement
  const TARGET_VALUE = 100000;
  const targetAchieved = (account?.totalWalletBalance || 0) >= TARGET_VALUE;
  const finalValue = account?.totalWalletBalance || 0;
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
    // Target achievement card
    ...(targetAchieved ? [{
      label: '🎯 Target Achieved',
      value: formatCurrency(Math.round(finalValue), 0),
      subValue: `Final Value`,
      color: 'text-green-500',
    }] : []),
    {
      label: 'Unrealized PnL',
      value: formatCurrency(Math.round(parseFloat(metrics.totalPnL)), 0),
      subValue: `${Math.round(metrics.totalPnLPercent)}%`,
      color: parseFloat(metrics.totalPnL) >= 0 ? 'text-green-500' : 'text-red-500',
    },
    {
      label: 'Wallet Balance',
      value: formatCurrency(Math.round(account?.totalWalletBalance || 0), 0),
      subValue: `Available: ${formatCurrency(Math.round(account?.availableBalance || 0), 0)}`,
      color: 'text-blue-500',
    },
    {
      label: 'If All SL Hit',
      value: formatCurrency(Math.round(balanceAfterSL), 0),
      subValue: `Loss: ${formatCurrency(Math.round(totalStopLossValue), 0)}`,
      color: balanceAfterSL > 0 ? 'text-yellow-500' : 'text-red-500',
    },
    {
      label: 'Margin Usage',
      value: `${Math.round(metrics.marginUsage)}%`,
      subValue: 'Ratio',
      color: parseFloat(metrics.marginUsage) > 50 ? 'text-red-500' : 'text-green-500',
    },
    {
      label: 'Max Leverage',
      value: `${Math.round(metrics.maxLeverage)}x`,
      subValue: `Avg: ${Math.round(metrics.avgLeverage)}x`,
      color: metrics.maxLeverage >= 20 ? 'text-red-500' : metrics.maxLeverage >= 10 ? 'text-yellow-500' : 'text-green-500',
    },
    {
      label: 'Open Positions',
      value: Math.round(metrics.positionCount),
      subValue: `USDT: ${formatCurrency(Math.round(parseFloat(metrics.totalNotional)), 0)}`,
      color: 'text-purple-500',
    },
    {
      label: 'Long',
      value: formatCurrency(Math.round(parseFloat(metrics.longExposure)), 0),
      subValue: 'USDT Long',
      color: 'text-green-500',
    },
    {
      label: 'Short',
      value: formatCurrency(Math.round(parseFloat(metrics.shortExposure)), 0),
      subValue: 'USDT Short',
      color: 'text-red-500',
    },
    {
      label: 'Risk Level',
      value: metrics.riskLevel,
      subValue: 'X Margin',
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
