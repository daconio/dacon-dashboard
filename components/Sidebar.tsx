
import React from 'react';
import type { ViewMode } from '../types';

type Theme = 'glass' | 'neumorphic' | 'webtoon';
type DaySchoolTypeFilter = 'all' | 'course' | 'hackathon' | 'lecture';

interface SidebarProps {
    theme: Theme;
    viewMode: ViewMode;
    showDataLinksOnly: boolean;
    daySchoolTypeFilter: DaySchoolTypeFilter;
    onCompetitionClick: () => void;
    onDataLinksToggle: () => void;
    onViewChange: (view: ViewMode, type?: DaySchoolTypeFilter) => void;
    isHeaderVisible: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
    theme,
    viewMode,
    showDataLinksOnly,
    daySchoolTypeFilter,
    onCompetitionClick,
    onDataLinksToggle,
    onViewChange,
    isHeaderVisible
}) => {
    const isGlass = theme === 'glass';
    const isNeumorphic = theme === 'neumorphic';

    const getButtonClasses = (active: boolean, type: 'comp' | 'edu' = 'comp') => {
        const base = `w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 mb-2 text-left`;
        const webtoonBase = `w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-200 border-2 border-black mb-2 text-left`;
        
        if (isGlass) {
            const activeColor = type === 'comp' ? 'bg-sky-500/40 border-sky-400' : 'bg-amber-500/40 border-amber-400';
            return `${base} border ${active ? `${activeColor} text-white shadow-lg shadow-sky-500/20` : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200'}`;
        }
        if (isNeumorphic) {
            const activeShadow = 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff]';
            const idleShadow = 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff]';
            return `${base} ${active ? `${activeShadow} ${type === 'comp' ? 'text-blue-600' : 'text-amber-600'}` : `${idleShadow} text-gray-600 hover:text-gray-900`}`;
        }
        // Webtoon
        const activeColor = type === 'comp' ? 'bg-blue-500 text-white' : 'bg-yellow-400 text-black';
        return `${webtoonBase} ${active ? `${activeColor} shadow-[4px_4px_0_#000]` : 'bg-white text-black hover:bg-gray-100'}`;
    };

    const sidebarClasses = isGlass
        ? `w-64 fixed left-0 h-full z-40 pt-[180px] pb-8 px-4 bg-slate-900/60 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300`
        : isNeumorphic
        ? `w-64 fixed left-0 h-full z-40 pt-[180px] pb-8 px-4 bg-[#e0e5ec] border-r border-gray-300/50 transition-all duration-300`
        : `w-64 fixed left-0 h-full z-40 pt-[180px] pb-8 px-4 bg-white border-r-2 border-black transition-all duration-300`;

    const sectionTitleClasses = isGlass
        ? "text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2"
        : isNeumorphic
        ? "text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2"
        : "text-[11px] font-black text-black uppercase tracking-widest mb-4 px-2";

    return (
        <aside className={`${sidebarClasses} ${!isHeaderVisible ? 'translate-y-[-80px]' : ''} hidden lg:block`}>
            <div className="h-full overflow-y-auto custom-scrollbar pr-1">
                {/* 대회 그룹 */}
                <section className="mb-10">
                    <h3 className={sectionTitleClasses}>Competitions</h3>
                    <button 
                        onClick={onCompetitionClick} 
                        className={getButtonClasses(viewMode === 'list' && !showDataLinksOnly)}
                    >
                        <span className="text-lg">🏆</span> 대회
                    </button>
                    <button 
                        onClick={onDataLinksToggle} 
                        className={getButtonClasses(viewMode === 'list' && showDataLinksOnly)}
                    >
                        <span className="text-lg">💾</span> 데이터
                    </button>
                    <button 
                        onClick={() => onViewChange('basecode')} 
                        className={getButtonClasses(viewMode === 'basecode')}
                    >
                        <span className="text-lg">💻</span> 코드
                    </button>
                    <button 
                        onClick={() => onViewChange('competition_roadmap')} 
                        className={getButtonClasses(viewMode === 'competition_roadmap')}
                    >
                        <span className="text-lg">🗺️</span> 참가 방법
                    </button>
                </section>

                {/* 학습 그룹 */}
                <section>
                    <h3 className={sectionTitleClasses}>Learning</h3>
                    <button 
                        onClick={() => onViewChange('dayschool', 'all')} 
                        className={getButtonClasses(viewMode === 'dayschool' && daySchoolTypeFilter === 'all', 'edu')}
                    >
                        <span className="text-lg">📚</span> 학습
                    </button>
                    <button 
                        onClick={() => onViewChange('dayschool', 'course')} 
                        className={getButtonClasses(viewMode === 'dayschool' && daySchoolTypeFilter === 'course', 'edu')}
                    >
                        <span className="text-lg">📖</span> 강좌
                    </button>
                    <button 
                        onClick={() => onViewChange('dayschool', 'hackathon')} 
                        className={getButtonClasses(viewMode === 'dayschool' && daySchoolTypeFilter === 'hackathon', 'edu')}
                    >
                        <span className="text-lg">🚩</span> 해커톤
                    </button>
                    <button 
                        onClick={() => onViewChange('dayschool', 'lecture')} 
                        className={getButtonClasses(viewMode === 'dayschool' && daySchoolTypeFilter === 'lecture', 'edu')}
                    >
                        <span className="text-lg">🎙️</span> 랭커특강
                    </button>
                    <button 
                        onClick={() => onViewChange('roadmap')} 
                        className={getButtonClasses(viewMode === 'roadmap', 'edu')}
                    >
                        <span className="text-lg">🎯</span> 로드맵
                    </button>
                </section>
            </div>
        </aside>
    );
};

export default Sidebar;
