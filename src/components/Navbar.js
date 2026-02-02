'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ onRefresh, loading, progressData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Futures' },
    { href: '/spot', label: 'Spot' },
    { href: '/compound', label: '🎯 Goal' },
    { href: '/trades', label: '📊 History' },
  ];

  const isActive = (href) => pathname === href;

  return (
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
            
            {/* Desktop Nav */}
            <div className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => (
                isActive(item.href) ? (
                  <span
                    key={item.href}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-1.5 text-gray-400 hover:text-white text-sm font-medium rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>
          </div>

          {/* Progress Bar - Compact in header */}
          {progressData && (
            <div className="hidden md:flex items-center gap-3 flex-1 max-w-sm mx-6 px-3 py-1.5 bg-gray-900/50 rounded-full border border-gray-700/50">
              <span className="text-[11px] text-white font-bold tabular-nums">{(progressData?.tradesProgress || 0).toFixed(1)}%</span>
              <div className="flex-1 bg-gray-700/80 rounded-full h-2 overflow-hidden shadow-inner relative">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-400 rounded-full transition-all duration-700 shadow-lg shadow-purple-500/20"
                  style={{ width: `${Math.max(progressData?.tradesProgress || 0, 1)}%` }}
                />
                <div 
                  className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-full pointer-events-none"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-gray-300 font-medium">$100K</span>
                <span className="text-[10px] text-green-400 font-semibold">🎯</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 rounded-lg transition-all"
              >
                <svg className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="sm:hidden pb-3 animate-fadeIn">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                isActive(item.href) ? (
                  <span
                    key={item.href}
                    className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2 text-gray-400 hover:text-white text-sm font-medium rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
