'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};



export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; 

    if (totalPages <= maxVisible) {
  
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the beginning
        pages.push(2, 3, 4, 5);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('...');
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // In the middle
        pages.push('...');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  // Don't show pagination if only 1 page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200
                   bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700
                   hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 
                   dark:disabled:hover:border-gray-700 disabled:hover:shadow-none
                   text-gray-700 dark:text-gray-300"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {pages.map((page, index) => {
          const key = typeof page === 'number' ? `page-${page}` : `ellipsis-${index}`;

          if (page === '...') {
            return (
              <span
                key={key}
                className="px-3 py-2 text-gray-400 dark:text-gray-500 font-medium select-none"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={key}
              onClick={() => handlePageChange(page as number)}
              disabled={isActive}
              className={`min-w-[44px] h-11 px-3 text-sm font-semibold rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105 cursor-default'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md hover:scale-105'
                }`}
              aria-label={`Go to page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200
                   bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700
                   hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 
                   dark:disabled:hover:border-gray-700 disabled:hover:shadow-none
                   text-gray-700 dark:text-gray-300"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Page Info - Optional */}
      <div className="hidden md:flex items-center ml-4 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Page <span className="text-orange-500 font-bold">{currentPage}</span> of{' '}
          <span className="text-gray-900 dark:text-white font-bold">{totalPages}</span>
        </span>
      </div>
    </nav>
  );
}