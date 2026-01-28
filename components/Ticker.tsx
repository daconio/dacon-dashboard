import React from 'react';
import type { Theme } from '../types';

interface TickerProps {
    items: string[];
    theme: Theme;
}

const Ticker: React.FC<TickerProps> = ({ items, theme }) => {
    const isGlass = theme === 'dark';
    const isNeumorphic = theme === 'light';

    const containerClasses = isGlass
        ? "overflow-hidden p-3 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 shadow-lg"
        : isNeumorphic
        ? "overflow-hidden p-3 bg-[#e0e5ec] rounded-2xl shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff]"
        : "overflow-hidden p-3 bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_#000]";
    
    const textColor = isGlass ? 'text-white/95' : isNeumorphic ? 'text-gray-700' : 'text-black';

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className={containerClasses}>
            <div className="flex animate-ticker whitespace-nowrap">
                {[...items, ...items].map((item, index) => (
                    <React.Fragment key={index}>
                        <span className={`text-md font-semibold ${textColor}`}>
                            {item}
                        </span>
                        {index < (items.length * 2) - 1 && (
                             <span className={`${isGlass ? 'text-white/50' : 'text-gray-400'} mx-4`} aria-hidden="true">•</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default Ticker;