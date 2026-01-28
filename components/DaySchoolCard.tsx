import React, { useState, useEffect } from 'react';
import type { DaySchoolCourse } from '../types';

type Theme = 'glass' | 'neumorphic' | 'webtoon';
type DaySchoolSortCriteria = 'status' | 'titleAsc' | 'idDesc' | 'difficulty' | 'duration_in_minutes' | 'participant_count';

interface DaySchoolCardProps {
    course: DaySchoolCourse;
    theme: Theme;
    animationIndex: number;
    onSortChange?: (criteria: DaySchoolSortCriteria) => void;
    activeSortCriteria?: DaySchoolSortCriteria;
    sortDirection?: 'asc' | 'desc';
}

const DaySchoolCard: React.FC<DaySchoolCardProps> = ({ course, theme, animationIndex, onSortChange, activeSortCriteria, sortDirection }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), animationIndex * 50);
        return () => clearTimeout(timer);
    }, [animationIndex]);

    const { 
        title, 
        link, 
        status, 
        difficulty,
        duration_in_minutes,
        tags,
        participant_count
    } = course;

    const isInteractive = !!onSortChange;

    const cardClasses = theme === 'glass'
      ? `bg-slate-800/40 backdrop-blur-lg rounded-2xl border border-slate-500/20 shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer hover:border-slate-400/50 hover:-translate-y-1`
      : theme === 'neumorphic'
      ? `bg-[#e0e5ec] rounded-2xl shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] transition-all duration-300 flex flex-col h-full cursor-pointer hover:shadow-[15px_15px_30px_#a3b1c6,-15px_-15px_30px_#ffffff] hover:-translate-y-1`
      : 'bg-white rounded-lg border-2 border-black transition-all duration-200 flex flex-col h-full cursor-pointer';
    
    const titleColor = theme === 'glass' ? 'text-slate-100' : theme === 'neumorphic' ? 'text-slate-800' : 'text-black';

    const handleCardClick = () => {
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const target = e.target as HTMLElement;
            if (target.tagName.toLowerCase() !== 'button' && target.getAttribute('role') !== 'button') {
                e.preventDefault();
                handleCardClick();
            }
        }
    };
    
    const handleSortClick = (e: React.MouseEvent, criteria: DaySchoolSortCriteria) => {
        e.stopPropagation();
        onSortChange?.(criteria);
    };

    const getBadgeClasses = (criteria: DaySchoolSortCriteria) => {
        const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold';
        const isActive = activeSortCriteria === criteria;

        if (isInteractive) {
            return `${base} dayschool-badge-sortable ${isActive ? 'sort-active' : ''}`;
        }

        if (theme === 'glass') {
            return `${base} bg-slate-700/50 text-slate-300 border border-slate-600/50`;
        }
        if (theme === 'neumorphic') {
            return `${base} bg-[#e0e5ec] text-gray-700 shadow-[3px_3px_6px_#a3b1c6,-3px_-3px_6px_#ffffff]`;
        }
        // Webtoon
        return `${base} bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000]`;
    };

    const SortableBadge: React.FC<{ criteria: DaySchoolSortCriteria; title: string; children: React.ReactNode }> = ({ criteria, title, children }) => {
        const isActive = activeSortCriteria === criteria;
        return (
            <button
                onClick={(e) => handleSortClick(e, criteria)}
                title={title}
                className={getBadgeClasses(criteria)}
                aria-pressed={isActive}
            >
                {children}
                <span className="sort-indicator">
                    {isActive ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </span>
            </button>
        );
    };
    
    const StaticBadge: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <span className={getBadgeClasses('status')} title={title}>{children}</span>
    );

    return (
        <div 
            onClick={handleCardClick}
            onKeyDown={handleKeyPress}
            role="link"
            tabIndex={0}
            aria-label={`Learn more about ${title}`}
            className="h-full block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-2xl"
        >
            <div className={`${cardClasses} dayschool-card ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
                <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                        {tags && tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {tags.slice(0, 2).map(tag => (
                                     <span key={tag.tag_title} className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                                        theme === 'glass' ? 'bg-slate-700/50 text-slate-300' 
                                        : theme === 'neumorphic' ? 'bg-gray-200 text-gray-700' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        #{tag.tag_title}
                                    </span>
                                ))}
                            </div>
                        )}
                         <div className="flex justify-between items-start gap-2 mb-3">
                            <h3 className={`text-base font-bold leading-snug ${titleColor} flex-grow line-clamp-2`}>{title}</h3>
                            {status === 'NEW' && (
                                <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${theme === 'glass' ? 'bg-yellow-400/20 text-yellow-300 backdrop-blur-sm border border-yellow-300/30' : theme === 'neumorphic' ? 'bg-yellow-200 text-yellow-800' : 'bg-yellow-300 text-black border border-black'}`}>
                                    NEW
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-auto pt-3">
                        {isInteractive ? (
                            <>
                                <SortableBadge criteria="difficulty" title="난이도순으로 정렬">
                                    <span role="img" aria-label="난이도">🧠</span> {difficulty}
                                </SortableBadge>
                                <SortableBadge criteria="duration_in_minutes" title="학습 시간순으로 정렬">
                                    <span role="img" aria-label="학습 시간">⏰</span> {duration_in_minutes}분
                                </SortableBadge>
                                <SortableBadge criteria="participant_count" title="참여 인원순으로 정렬">
                                    <span role="img" aria-label="참여 인원">👥</span> {participant_count?.toLocaleString()}명
                                </SortableBadge>
                            </>
                        ) : (
                            <>
                                <StaticBadge title="난이도">
                                    <span role="img" aria-label="난이도">🧠</span> {difficulty}
                                </StaticBadge>
                                <StaticBadge title="학습 시간">
                                    <span role="img" aria-label="학습 시간">⏰</span> {duration_in_minutes}분
                                </StaticBadge>
                                <StaticBadge title="참여 인원">
                                    <span role="img" aria-label="참여 인원">👥</span> {participant_count?.toLocaleString()}명
                                </StaticBadge>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(DaySchoolCard);