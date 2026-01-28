import React, { useEffect, useState } from 'react';

type Theme = 'glass' | 'neumorphic' | 'webtoon';

interface ToastProps {
    id: number;
    message: string;
    onClose: (id: number) => void;
    theme: Theme;
}

const Toast: React.FC<ToastProps> = ({ id, message, onClose, theme }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            // Wait for the exit animation to complete before removing from DOM
            setTimeout(() => onClose(id), 500); 
        }, 3000); // Toast visible for 3 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [id, onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 500);
    };

    const isGlass = theme === 'glass';
    const isNeumorphic = theme === 'neumorphic';

    const containerClasses = isGlass
        ? "flex items-center justify-between w-full max-w-xs p-4 text-slate-200 bg-slate-800/80 backdrop-blur-lg rounded-2xl border border-slate-600 shadow-2xl"
        : isNeumorphic
        ? "flex items-center justify-between w-full max-w-xs p-4 text-gray-600 bg-[#e0e5ec] rounded-2xl shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff]"
        : "flex items-center justify-between w-full max-w-xs p-4 text-black bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_#000]";
    const iconContainerClasses = isGlass
        ? "inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-400 bg-green-500/20 rounded-lg"
        : isNeumorphic
        ? "inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg shadow-[inset_2px_2px_4px_#c1c9d2,inset_-2px_-2px_4px_#ffffff]"
        : "inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-800 bg-green-200 rounded-md border border-black";
    const closeButtonClasses = isGlass
        ? "ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex h-8 w-8 rounded-lg text-slate-400 hover:text-white focus:ring-2 focus:ring-slate-500"
        : isNeumorphic
        ? "ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex h-8 w-8 rounded-lg text-gray-400 hover:text-gray-900 focus:ring-2 focus:ring-gray-300"
        : "ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex h-8 w-8 rounded-md text-gray-500 hover:text-black hover:bg-gray-100 focus:ring-2 focus:ring-gray-300";

    return (
        <div 
            className={`${containerClasses} ${isExiting ? 'animate-fade-out-toast' : 'animate-slide-in-toast'}`} 
            role="alert"
        >
            <div className="flex items-center">
                 <div className={iconContainerClasses}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    <span className="sr-only">Check icon</span>
                </div>
                <div className="ml-3 text-sm font-semibold">{message}</div>
            </div>
            <button 
                type="button" 
                className={closeButtonClasses} 
                onClick={handleClose} 
                aria-label="Close"
            >
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
        </div>
    );
};

export default Toast;