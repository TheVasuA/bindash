'use client';

import { useState } from 'react';
import { formatCurrency, formatCurrencyFull, formatPercent, getChangeColor } from '@/lib/utils';

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
    <>
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {positions.map((position, index) => (
          <div 
            key={`mobile-${position.symbol}-${index}`}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${position.side === 'LONG' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium text-white text-lg">{position.symbol}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  position.side === 'LONG' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {position.side}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  position.leverage >= 20 ? 'bg-red-500/20 text-red-400' :
                  position.leverage >= 10 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {position.leverage}x
                </span>
              </div>
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
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Size</span>
                <p className="text-white">{position.positionAmt}</p>
              </div>
              <div>
                <span className="text-gray-400">Entry</span>
                <p className="text-white">
                  {formatCurrencyFull(position.entryPrice)}
                  <span className="text-xs text-blue-400 ml-2">(
                    {formatCurrencyFull(Math.abs(position.positionAmt * position.entryPrice))}
                  )</span>
                </p>
              </div>
              <div>
                <span className="text-gray-400">Mark</span>
                <p className="text-white">{formatCurrencyFull(position.markPrice)}</p>
              </div>
              <div>
                <span className="text-gray-400">PnL</span>
                <p className={`font-medium ${getChangeColor(position.unrealizedProfit)}`}>
                  {formatCurrencyFull(position.unrealizedProfit)} ({formatPercent(position.roe)})
                </p>
              </div>
              <div>
                <span className="text-gray-400">Stop Loss</span>
                {position.stopLossPrice ? (
                  <p className="text-yellow-400">
                    {formatCurrencyFull(position.stopLossPrice)}
                    <span className="text-red-400 text-xs ml-1">({formatCurrencyFull(position.stopLossValue)})</span>
                  </p>
                ) : (
                  <p className="text-gray-500">No SL</p>
                )}
              </div>
              <div>
                <span className="text-gray-400">Liq. Price</span>
                <p className="text-orange-400">{formatCurrencyFull(position.liquidationPrice)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Symbol</th>
              
              <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Total USDT</th>
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
                {/* Side column removed */}
                <td className="py-4 px-4 text-right text-blue-400 font-medium">
                  {formatCurrencyFull(Math.abs(position.positionAmt * position.entryPrice))} 
                </td>
                <td className="py-4 px-4 text-right text-gray-300">
                  {formatCurrencyFull(position.entryPrice)}
                </td>
                <td className="py-4 px-4 text-right text-gray-300">
                  {formatCurrencyFull(position.markPrice)}
                </td>
                <td className={`py-4 px-4 text-right font-medium ${getChangeColor(position.unrealizedProfit)}`}>
                  <div>{formatCurrency(Math.abs(position.unrealizedProfit), 2)}</div>
                  <div className="text-xs opacity-80">
                    {formatPercent(position.roe, 2)}
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  {position.stopLossPrice ? (
                    <div>
                      <div className="text-yellow-400">{formatCurrencyFull(position.stopLossPrice)}</div>
                      <div className="text-xs text-red-400">
                        {formatCurrencyFull(position.stopLossValue)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">No SL</span>
                  )}
                </td>
                <td className="py-4 px-4 text-right text-orange-400">
                  {formatCurrencyFull(position.liquidationPrice)}
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
    </>
  );
}
