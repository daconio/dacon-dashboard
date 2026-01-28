
import React from 'react';

type Theme = 'glass' | 'neumorphic' | 'webtoon';

interface ErrorMessageProps {
    message: string;
    theme: Theme;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, theme }) => {
    const isGlass = theme === 'glass';
    const isNeumorphic = theme === 'neumorphic';

    const containerClasses = isGlass 
        ? "text-center bg-red-900/40 backdrop-blur-md text-red-200 p-4 rounded-2xl relative mt-8 border border-red-500/30 shadow-2xl"
        : isNeumorphic
        ? "text-center bg-red-100 text-red-700 p-4 rounded-2xl relative mt-8 border border-red-300 shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff]"
        : "text-center bg-red-100 text-red-800 p-4 rounded-lg relative mt-8 border-2 border-black shadow-[4px_4px_0_#000]";
    const messageColor = isGlass ? 'text-red-300' : isNeumorphic ? 'text-red-600' : 'text-red-700';
    
    return (
        <div className={containerClasses} role="alert">
            <strong className="font-bold">오류 발생!</strong>
            <span className="block sm:inline ml-2">데이터를 불러오는 데 실패했습니다. 다시 시도해 주세요.</span>
            <p className={`text-sm ${messageColor} mt-2`}>{message}</p>
        </div>
    );
};

export default ErrorMessage;