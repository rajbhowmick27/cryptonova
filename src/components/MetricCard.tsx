import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { MetricCard as MetricCardType } from '../types';

export const MetricCard: React.FC<MetricCardType> = ({ title, value, change, icon: Icon }) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-500">{title}</span>
        </div>
        {isPositive ? (
          <ArrowUpRight className="w-4 h-4 text-green-500" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-red-500" />
        )}
      </div>
      <div className="mt-4">
        <span className="text-2xl font-bold">{value}</span>
        <span className={`ml-2 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{change}%
        </span>
      </div>
    </div>
  );
}