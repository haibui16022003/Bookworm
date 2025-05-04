import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  // Function to create visible page numbers with ellipsis for large page counts
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const pages = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis1');
    }
    
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('ellipsis2');
    }
    

    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 py-4" role="navigation" aria-label="Pagination">
      {/* First page button */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-2 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 transition-colors duration-200"
        aria-label="First page"
      >
        &laquo;
      </button>

      {/* Previous page button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 transition-colors duration-200"
        aria-label="Previous page"
      >
        &lt;
      </button>

      {/* Page numbers */}
      <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
        {visiblePages.map((page, index) => 
          page === 'ellipsis1' || page === 'ellipsis2' ? (
            <span key={page} className="px-2 py-1">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 border rounded transition-colors duration-200 ${
                currentPage === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next page button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 transition-colors duration-200"
        aria-label="Next page"
      >
        &gt;
      </button>

      {/* Last page button */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 transition-colors duration-200"
        aria-label="Last page"
      >
        &raquo;
      </button>
    </div>
  );
};

export default Pagination;
