'use client';

import { useState, useEffect, useCallback } from 'react';

export function useFetch(url, options = {}) {
  const { refreshInterval = 0 } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setError(null);
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh if interval is specified
    if (refreshInterval > 0) {
      const interval = setInterval(() => fetchData(true), refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  const refetch = () => fetchData();

  return { data, loading, error, refetch };
}

export function formatCurrency(value, decimals = 2) {
  if (value === undefined || value === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatNumber(value, decimals = 2) {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value, decimals = 2) {
  if (value === undefined || value === null) return '0%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function getChangeColor(value) {
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-red-500';
  return 'text-gray-500';
}

export function getRiskColor(riskLevel) {
  switch (riskLevel) {
    case 'Conservative': return 'text-green-500 bg-green-500/10';
    case 'Moderate': return 'text-yellow-500 bg-yellow-500/10';
    case 'Aggressive': return 'text-red-500 bg-red-500/10';
    default: return 'text-gray-500 bg-gray-500/10';
  }
}
