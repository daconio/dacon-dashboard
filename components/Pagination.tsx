import React from 'react';
import type { Theme } from '../types';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (pageNumber: number) => void;
    theme: Theme;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange, theme }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const maxPageButtons = 5; // Max number of page buttons to show

    if (totalPages <= 1) {
        return null;
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
            window.scrollTo(0, 0); // Scroll to top on page change
        }
    };

    const isGlass = theme === 'dark';
    const isNeumorphic = theme === 'light';

    const getButtonClasses = (isCurrent: boolean) => {
        if (isGlass) {
            return `mx-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${
                isCurrent
                    ? 'bg-sky-500/60 text-white border-sky-400'
                    : 'bg-slate-800/50 text-slate-200 border-slate-700 hover:bg-slate-700/60'
            }`;
        }
        if (isNeumorphic) {
            return `mx-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 transform ${
                isCurrent
                    ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-blue-600'
                    : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-gray-700 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1'
            }`;
        }
        // Webtoon
        return `mx-1 px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 border-2 border-black ${
            isCurrent
                ? 'bg-blue-500 text-white shadow-[3px_3px_0_#000]'
                : 'bg-white text-black hover:bg-gray-100'
        }`;
    };

    const navButtonBaseStyle = isGlass
        ? "mx-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-slate-800/50 text-slate-200 border border-slate-700 hover:bg-slate-700/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        : isNeumorphic
        ? "mx-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 transform shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-gray-700 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        : "mx-1 px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 bg-white text-black border-2 border-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200 flex items-center";

    const renderPageNumbers = () => {
        const pageNumbers: number[] = [];
        let startPage: number, endPage: number;
        
        if (totalPages <= maxPageButtons) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const maxPagesBeforeCurrentPage = Math.floor(maxPageButtons / 2);
            const maxPagesAfterCurrentPage = Math.ceil(maxPageButtons / 2) - 1;
            if (currentPage <= maxPagesBeforeCurrentPage) {
                startPage = 1;
                endPage = maxPageButtons;
            } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
                startPage = totalPages - maxPageButtons + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - maxPagesBeforeCurrentPage;
                endPage = currentPage + maxPagesAfterCurrentPage;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers.map(number => (
            <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={getButtonClasses(currentPage === number)}
                aria-current={currentPage === number ? 'page' : undefined}
            >
                {number}
            </button>
        ));
    };

    return (
        <nav aria-label="Competition list navigation" className="mt-10 flex justify-center items-center">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={navButtonBaseStyle}
                aria-label="Previous page"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                이전
            </button>

            {renderPageNumbers()}

            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={navButtonBaseStyle}
                aria-label="Next page"
            >
                다음
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
            </button>
        </nav>
    );
};

export default Pagination;