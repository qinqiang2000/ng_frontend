'use client';

import React from 'react';
import { useComponentsTranslation } from '@/client/hooks/useTranslation';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
  pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false,
  pageSizeOptions = [10, 20, 50, 100, 200, 500]
}) => {
  const { t } = useComponentsTranslation();
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const startRecord = ((currentPage - 1) * pageSize) + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="p-6 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {loading ? t('pagination.loading') : t('pagination.showingRecords', { start: startRecord, end: endRecord, total: totalRecords.toLocaleString() })}
        </p>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">{t('pagination.pageSize')}</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={loading}
              className="border-[1px] border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handlePreviousPage}
            disabled={currentPage <= 1 || loading}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            {t('pagination.previous')}
          </button>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
            const startPage = Math.max(1, currentPage - 2);
            const pageNumber = startPage + index;
            if (pageNumber > totalPages) return null;
            
            return (
              <button 
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                disabled={loading}
                className={`px-3 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentPage === pageNumber 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
          
          <button 
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || loading}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            {t('pagination.next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;