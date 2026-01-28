import React from 'react';
import type { Theme } from '../types';

interface LoadingSpinnerProps {
    theme: Theme;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ theme }) => {
    const isGlass = theme === 'dark';
    const spinnerColor = isGlass ? 'border-sky-400' : 'border-blue-500';
    const textColor = isGlass ? 'text-slate-400' : theme === 'light' ? 'text-gray-500' : 'text-black';

    return (
        <div className="flex flex-col items-center justify-center py-10">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${spinnerColor}`}></div>
            <p className={`mt-4 text-center text-lg font-semibold ${textColor}`}>데이터를 불러오는 중...</p>
        </div>
    );
};

export default LoadingSpinner;