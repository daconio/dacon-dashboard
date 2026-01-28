import React from 'react';
import type { BaseCodeItem, BaseCodeCategory } from '../types';
import type { Theme } from '../types';
import BaseCodeCard from './BaseCodeCard';

interface BaseCodeViewProps {
    items: BaseCodeItem[];
    theme: Theme;
    selectedCategory: BaseCodeCategory | 'all';
    onCategoryChange: (category: BaseCodeCategory | 'all') => void;
}

const BaseCodeView: React.FC<BaseCodeViewProps> = ({ items, theme, selectedCategory, onCategoryChange }) => {
    const isGlass = theme === 'dark';
    const isNeumorphic = theme === 'light';
    
    const categories: (BaseCodeCategory | 'all')[] = ['all', '생성AI', 'NLP', '정형', '비전', '데이터분석', '전처리'];

    const getButtonClasses = (isActive: boolean) => {
        if (isGlass) {
            return `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 border ${isActive ? 'bg-emerald-500/40 text-white border-emerald-400/50' : 'bg-slate-700/30 text-slate-200 border-slate-600/50 hover:bg-slate-600/50'}`;
        }
        if (isNeumorphic) {
            return `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 transform ${isActive ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-emerald-600' : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-gray-700 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1'}`;
        }
        // Webtoon
        return `px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 border-2 border-black ${isActive ? 'bg-emerald-500 text-white shadow-[3px_3px_0_#000]' : 'bg-white text-black hover:bg-gray-100'}`;
    };

    return (
        <div>
            <div className={`mb-6 flex flex-wrap items-center gap-2 p-3 rounded-xl ${isGlass ? 'bg-slate-800/20' : isNeumorphic ? 'shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff]' : 'bg-gray-100 border-2 border-black'}`}>
                <span className={`text-sm font-semibold mr-2 ${isGlass ? 'text-slate-300' : isNeumorphic ? 'text-gray-600' : 'text-black'}`}>카테고리:</span>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => onCategoryChange(cat)}
                        className={getButtonClasses(selectedCategory === cat)}
                        aria-pressed={selectedCategory === cat}
                    >
                        {cat === 'all' ? '전체' : cat}
                    </button>
                ))}
            </div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {items.map((item, index) => (
                    <BaseCodeCard 
                        key={item.id} 
                        item={item} 
                        theme={theme} 
                        animationIndex={index} 
                    />
                ))}
            </div>
        </div>
    );
};

export default BaseCodeView;