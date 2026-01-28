
import React from 'react';
import type { ViewMode, Theme } from '../types';

interface SidebarProps {
    theme: Theme;
    viewMode: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ theme, viewMode, onViewChange }) => {
    
    const menuItemClasses = `flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl transition-all mb-1 
        ${theme === 'brutal' ? 'hover:bg-gray-200 border-2 border-transparent hover:border-black text-black' : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200'}`;
    
    const activeItemClasses = theme === 'brutal'
        ? 'bg-blue-600 text-white border-2 border-black shadow-[4px_4px_0_#000]'
        : 'bg-blue-600 text-white shadow-md';

    const countBadgeClasses = (isActive: boolean) => `px-2 py-0.5 text-xs rounded-md font-bold ${
        isActive 
        ? 'bg-white/20 text-white' 
        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 theme-brutal:bg-gray-300 theme-brutal:text-black theme-brutal:border theme-brutal:border-black'
    }`;

    return (
        <aside className="w-64 fixed left-0 top-16 h-[calc(100vh-64px)] z-40 p-4 overflow-y-auto hidden lg:flex flex-col gap-6 border-r"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRightWidth: theme === 'brutal' ? '2px' : '1px' }}
        >
            {/* Hackathon Menu */}
            <section>
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 px-2 theme-brutal:text-black">해커톤 메뉴</h3>
                <nav className="space-y-1">
                    <button className={menuItemClasses}>
                        <span>내가 참가한 해커톤</span>
                        <span className={countBadgeClasses(false)}>1</span>
                    </button>
                    <button className={`${menuItemClasses} ${viewMode === 'list' ? activeItemClasses : ''}`} onClick={() => onViewChange('list')}>
                        <span>전체</span>
                        <span className={countBadgeClasses(viewMode === 'list')}>3</span>
                    </button>
                    <button className={menuItemClasses}>
                        <span>모집중</span>
                        <span className={countBadgeClasses(false)}>2</span>
                    </button>
                    <button className={menuItemClasses}>
                        <span>접수대기</span>
                        <span className={countBadgeClasses(false)}>0</span>
                    </button>
                    <button className={menuItemClasses}>
                        <span>종료</span>
                        <span className={countBadgeClasses(false)}>1</span>
                    </button>
                </nav>
            </section>

            {/* Guide Box */}
            <div className={`p-4 rounded-xl border ${theme === 'brutal' ? 'bg-yellow-100 border-2 border-black shadow-[4px_4px_0_#000]' : 'bg-orange-50 border-orange-100 dark:bg-gray-800 dark:border-gray-700'}`}>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-orange-500">❓</span>
                    <h4 className="font-bold text-sm dark:text-gray-200 theme-brutal:text-black">해커톤 가이드</h4>
                </div>
                <button className={`w-full py-2 text-xs font-bold rounded-lg mt-2 transition-transform active:scale-95 ${
                    theme === 'brutal' ? 'bg-yellow-300 border-2 border-black text-black hover:bg-yellow-400' : 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300'
                }`}>
                    자세히 알아보기 →
                </button>
            </div>

            {/* My Hosted Hackathons */}
            <button className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-left border transition-all ${
                theme === 'brutal' ? 'bg-white border-2 border-black shadow-[4px_4px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
            }`}>
                내가 주최한 해커톤
            </button>

            {/* Profile Card (Bottom) */}
            <div className="mt-auto">
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                    theme === 'brutal' ? 'bg-white border-2 border-black shadow-[4px_4px_0_#000]' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                }`}>
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shrink-0 theme-brutal:border-2 theme-brutal:border-black">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm truncate dark:text-white theme-brutal:text-black">도비콘</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 theme-brutal:text-black">
                            <span className="font-mono">👁 90</span>
                            <span>|</span>
                            <span>신뢰 <span className="text-blue-500 font-bold">0.71</span></span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden dark:bg-gray-700 theme-brutal:border theme-brutal:border-black theme-brutal:h-2.5">
                            <div className="bg-green-500 h-full w-[70%]"></div>
                        </div>
                        <div className="text-[10px] text-right text-gray-400 mt-1 dark:text-gray-500 theme-brutal:text-black">10,383 XP → Gold</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
