'use client';

import { useState } from 'react';
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils';

export default function FuturesPositions({ positions, onRefresh }) {
  const [closing, setClosing] = useState(null);

  const handleForceClose = async (position) => {
    if (!confirm(`Are you sure you want to force close ${position.symbol} ${position.side} position?`)) {
      return;
    }

    setClosing(position.symbol);
    try {
      const response = await fetch('/api/futures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'closePosition',
          symbol: position.symbol,
          side: position.side,
          quantity: Math.abs(parseFloat(position.positionAmt)),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to close position');
      }

      alert(`Position closed successfully!`);
      if (onRefresh) onRefresh();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setClosing(null);
    }
  };

  if (!positions || positions.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No open futures positions
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Symbol</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Side</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Size</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Entry Price</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Mark Price</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">PnL (ROE%)</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Stop Loss</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Liq. Price</th>
            <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Leverage</th>
            <th className="text-center py-3 px-2 text-gray-400 font-medium text-sm"></th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position, index) => (
            <tr 
              key={`${position.symbol}-${index}`}
              className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${position.side === 'LONG' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-medium text-white">{position.symbol}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  position.side === 'LONG' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {position.side}
                </span>
              </td>
              <td className="py-4 px-4 text-right text-gray-300">
                {position.positionAmt}
              </td>
              <td className="py-4 px-4 text-right text-gray-300">
                {formatCurrency(position.entryPrice)}
              </td>
              <td className="py-4 px-4 text-right text-gray-300">
                {formatCurrency(position.markPrice)}
              </td>
              <td className={`py-4 px-4 text-right font-medium ${getChangeColor(position.unrealizedProfit)}`}>
                <div>{formatCurrency(position.unrealizedProfit)}</div>
                <div className="text-xs opacity-80">
                  {formatPercent(position.roe)}
                </div>
              </td>
              <td className="py-4 px-4 text-right">
                {position.stopLossPrice ? (
                  <div>
                    <div className="text-yellow-400">{formatCurrency(position.stopLossPrice)}</div>
                    <div className="text-xs text-red-400">
                      {formatCurrency(position.stopLossValue)}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">No SL</span>
                )}
              </td>
              <td className="py-4 px-4 text-right text-orange-400">
                {formatCurrency(position.liquidationPrice)}
              </td>
              <td className="py-4 px-4 text-center">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  position.leverage >= 20 ? 'bg-red-500/20 text-red-400' :
                  position.leverage >= 10 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {position.leverage}x
                </span>
              </td>
              <td className="py-4 px-2 text-center">
                <button
                  onClick={() => handleForceClose(position)}
                  disabled={closing === position.symbol}
                  className="p-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors"
                  title="Force Close"
                >
                  {closing === position.symbol ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
