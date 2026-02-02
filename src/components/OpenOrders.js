'use client';

import { formatCurrency } from '@/lib/utils';

export default function OpenOrders({ orders }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No open orders
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Pair</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Type</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Side</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Price</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Amount</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr 
              key={order.id} 
              className="border-b border-gray-800 hover:bg-gray-800/50"
            >
              <td className="py-3 px-4 text-white font-medium">{order.symbol}</td>
              <td className="py-3 px-4 text-gray-300 capitalize">{order.type}</td>
              <td className={`py-3 px-4 font-medium capitalize ${
                order.side === 'buy' ? 'text-green-500' : 'text-red-500'
              }`}>
                {order.side}
              </td>
              <td className="py-3 px-4 text-right text-gray-300">
                {formatCurrency(order.price)}
              </td>
              <td className="py-3 px-4 text-right text-gray-300">{order.amount}</td>
              <td className="py-3 px-4 text-right text-white font-medium">
                {formatCurrency(order.price * order.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
