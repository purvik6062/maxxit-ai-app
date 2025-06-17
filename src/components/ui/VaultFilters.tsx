"use client";

import React from 'react';
import { VaultFilters as VaultFiltersType } from '@/hooks/usePublicVaults';

interface VaultFiltersProps {
  filters: VaultFiltersType;
  onFiltersChange: (filters: VaultFiltersType) => void;
  totalCount: number;
  isLoading: boolean;
}

export function VaultFilters({ filters, onFiltersChange, totalCount, isLoading }: VaultFiltersProps) {
  const handleSortChange = (sortBy: 'createdAt' | 'monthlyReturn' | 'totalValueLocked') => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleOrderChange = (order: 'asc' | 'desc') => {
    onFiltersChange({ ...filters, order });
  };

  const handleRiskLevelChange = (riskLevel: 'Low' | 'Medium' | 'High' | undefined) => {
    onFiltersChange({ ...filters, riskLevel });
  };

  const clearFilters = () => {
    onFiltersChange({
      sortBy: 'createdAt',
      order: 'desc',
      riskLevel: undefined
    });
  };

  const hasActiveFilters = filters.riskLevel || 
                          filters.sortBy !== 'createdAt' || 
                          filters.order !== 'desc';

  return (
    <div className="bg-[#0D1321] border border-[rgba(206,212,218,0.15)] rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Results Count */}
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-[#AAC9FA]">Public Vaults</h3>
          {!isLoading && (
            <span className="text-sm text-[#8ba1bc] bg-[#1a2234] px-2 py-1 rounded">
              {totalCount} vault{totalCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-[#8ba1bc] font-medium">Sort by:</label>
            <select
              value={filters.sortBy || 'createdAt'}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="bg-[#1a2234] border border-[rgba(206,212,218,0.15)] rounded px-3 py-1.5 text-sm text-[#AAC9FA] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            >
              <option value="createdAt">Date Created</option>
              <option value="monthlyReturn">Monthly Return</option>
              <option value="totalValueLocked">Total Value Locked</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-[#8ba1bc] font-medium">Order:</label>
            <select
              value={filters.order || 'desc'}
              onChange={(e) => handleOrderChange(e.target.value as any)}
              className="bg-[#1a2234] border border-[rgba(206,212,218,0.15)] rounded px-3 py-1.5 text-sm text-[#AAC9FA] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-[#8ba1bc] hover:text-cyan-400 border border-[rgba(206,212,218,0.15)] hover:border-cyan-500/50 rounded transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-[rgba(206,212,218,0.1)]">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-[#6b7280]">Active filters:</span>
            
            {filters.riskLevel && (
              <span className="inline-flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs px-2 py-1 rounded">
                Risk: {filters.riskLevel}
                <button
                  onClick={() => handleRiskLevelChange(undefined)}
                  className="hover:text-cyan-300"
                >
                  ×
                </button>
              </span>
            )}

            {filters.sortBy !== 'createdAt' && (
              <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">
                Sort: {filters.sortBy === 'monthlyReturn' ? 'Monthly Return' : 'Total Value Locked'}
                <button
                  onClick={() => handleSortChange('createdAt')}
                  className="hover:text-blue-300"
                >
                  ×
                </button>
              </span>
            )}

            {filters.order === 'asc' && (
              <span className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                Order: Ascending
                <button
                  onClick={() => handleOrderChange('desc')}
                  className="hover:text-green-300"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 