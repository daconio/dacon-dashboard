import React from 'react';
import type { ViewMode } from '../types';

type Theme = 'glass' | 'neumorphic' | 'webtoon';

interface ViewSwitcherProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
    theme: Theme;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange, theme }) => {

    const getButtonClasses = (view: ViewMode) => {
        const isActive = currentView === view;
        const base = "px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all duration-300 transform flex items-center gap-2";

        if (theme === 'glass') {
            return `${base} border ${isActive ? 'bg-sky-500/40 text-white border-sky-400/50' : 'bg-slate-700/30 text-slate-200 border-slate-600/50 hover:bg-slate-600/50'}`;
        }
        if (theme === 'neumorphic') {
            return `${base} ${isActive ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-blue-600' : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1'}`;
        }
        // Webtoon
        return `px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-bold rounded-md transition-all duration-200 border-2 border-black ${isActive ? 'bg-blue-500 text-white shadow-[3px_3px_0_#000]' : 'bg-white text-black hover:bg-gray-100'}`;
    };

    return (
        <div className="flex items-center gap-2">
            <button onClick={() => onViewChange('list')} className={getButtonClasses('list')}>
                목록
            </button>
            <button onClick={() => onViewChange('dayschool')} className={getButtonClasses('dayschool')}>
                학습
            </button>
             <button onClick={() => onViewChange('roadmap')} className={getButtonClasses('roadmap')}>
                로드맵
            </button>
        </div>
    );
};

export default ViewSwitcher;
