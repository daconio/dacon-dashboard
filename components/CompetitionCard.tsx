import React, { useState, useEffect, useMemo } from 'react';
import type { Competition } from '../types';

type Theme = 'glass' | 'neumorphic' | 'webtoon';

interface CompetitionCardProps {
    competition: Competition;
    onStatusClick: (status: 'ongoing' | 'ended' | 'practice') => void;
    onKeywordClick: (keyword: string) => void;
    onSortClick: (criteria: 'prizeDesc' | 'participantsDesc') => void;
    animationIndex: number;
    isDataLinkCard?: boolean;
    theme: Theme;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ competition, onStatusClick, onKeywordClick, onSortClick, animationIndex, isDataLinkCard = false, theme }) => {
    const { cpt_id, name, period_start, period_end, user_count, team_count, prize_info, keyword, practice, url } = competition;
    
    const [isKeywordsExpanded, setIsKeywordsExpanded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, animationIndex * 75); // Stagger delay
        return () => clearTimeout(timer);
    }, [animationIndex]);

    const daconUrl = url || `https://dacon.io/competitions/official/${cpt_id}/overview/description`;

    const now = new Date();
    const endDate = new Date(period_end);
    const isOngoing = now <= endDate;

    const count = user_count > 0 ? user_count : (team_count || 0);
    const formattedCount = count > 0 ? `${count.toLocaleString()}명` : '0명';
    
    const prize = prize_info ? prize_info : '상금 없음';
    
    const { diffDays, ddayText, status } = useMemo(() => {
        if (!isOngoing) {
            const text = practice === 1 ? '연습' : '종료';
            return { diffDays: null, ddayText: text, status: (practice === 1 ? 'practice' : 'ended') as 'practice' | 'ended' };
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDay = new Date(period_end);
        endDay.setHours(0, 0, 0, 0);
        const diffTime = endDay.getTime() - today.getTime();
        const days = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        return { diffDays: days, ddayText: `D-${days}`, status: 'ongoing' as 'ongoing' };
    }, [isOngoing, period_end, practice]);

    const isUrgent = diffDays !== null && diffDays <= 10;
    
    const isGlass = theme === 'glass';
    const isNeumorphic = theme === 'neumorphic';

    const themeClasses = useMemo(() => {
        let styles = '';
        if (isGlass) {
            styles = `bg-slate-800/70 backdrop-blur-xl rounded-2xl border shadow-lg hover:shadow-sky-500/20 hover:-translate-y-1`;
            if (isUrgent) {
                styles += ' border-red-500/80 hover:border-red-400';
            } else if (status === 'ongoing') {
                styles += ' border-sky-500/70 hover:border-sky-400';
            } else { // ended/practice
                styles += ' border-slate-700 hover:border-slate-500';
            }
        } else if (isNeumorphic) {
            styles = `bg-[#e0e5ec] rounded-2xl shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:shadow-[15px_15px_30px_#a3b1c6,-15px_-15px_30px_#ffffff] hover:-translate-y-1 border-2`;
             if (isUrgent) {
                styles += ' border-red-300';
            } else if (status === 'ongoing') {
                styles += ' border-blue-300';
            } else { // ended/practice
                styles += ' border-transparent';
            }
        } else { // webtoon
            styles = `bg-white rounded-lg border-2 hover:-translate-y-0.5 hover:-translate-x-0.5`;
            if (isUrgent) {
                styles += ' border-red-500 shadow-[5px_5px_0_#dc2626] hover:shadow-[7px_7px_0_#dc2626]';
            } else if (status === 'ongoing') {
                styles += ' border-blue-500 shadow-[5px_5px_0_#3b82f6] hover:shadow-[7px_7px_0_#3b82f6]';
            } else { // ended/practice
                styles += ' border-black shadow-[5px_5px_0_#000] hover:shadow-[7px_7px_0_#000]';
            }
        }
        return styles;
    }, [theme, isUrgent, status, isGlass, isNeumorphic]);

    const ddayTextStyle = useMemo(() => {
        if (isGlass) {
            if (isUrgent) return 'text-red-400 font-bold';
            if (status === 'ongoing') return 'text-sky-300';
            if (status === 'practice') return 'text-green-400';
            return 'text-red-400'; // ended
        }
        if (isNeumorphic) {
            if (isUrgent) return 'text-red-500 font-bold';
            if (status === 'ongoing') return 'text-blue-500';
            if (status === 'practice') return 'text-green-600';
            return 'text-red-500'; // ended
        }
        // Webtoon
        if (isUrgent) return 'text-red-600 font-bold';
        if (status === 'ongoing') return 'text-blue-600';
        if (status === 'practice') return 'text-green-600';
        return 'text-red-600'; // ended
    }, [isUrgent, status, theme]);


    const keywords = (keyword || '').split('|').map(k => k.trim()).filter(k => k);
    
    const MAX_KEYWORDS_COLLAPSED = 2;
    const isExpandable = keywords.length > MAX_KEYWORDS_COLLAPSED;
    const displayedKeywords = isExpandable && !isKeywordsExpanded ? keywords.slice(0, MAX_KEYWORDS_COLLAPSED) : keywords;

    const MAX_KEYWORDS_INLINE = 3;
    const displayedInlineKeywords = keywords.slice(0, MAX_KEYWORDS_INLINE);
    const remainingKeywordsCount = keywords.length - MAX_KEYWORDS_INLINE;

    const handleCardClick = () => {
        window.open(daconUrl, '_blank', 'noopener,noreferrer');
    };

    const handleJoinClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(daconUrl, '_blank', 'noopener,noreferrer');
    };

    const handleCardKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (e.target instanceof HTMLElement && e.target.tagName.toLowerCase() !== 'button') {
                e.preventDefault();
                handleCardClick();
            }
        }
    };
    
    const handleStatusBadgeClick = (e: React.MouseEvent, status: 'ongoing' | 'ended' | 'practice') => {
        e.stopPropagation();
        onStatusClick(status);
    };

    const handleKeywordClick = (e: React.MouseEvent, kw: string) => {
        e.stopPropagation();
        onKeywordClick(kw);
    };

    const handleSortBadgeClick = (e: React.MouseEvent, criteria: 'prizeDesc' | 'participantsDesc') => {
        e.stopPropagation();
        onSortClick(criteria);
    };
    
    const handleToggleKeywords = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsKeywordsExpanded(prev => !prev);
    };

    const joinButtonClasses = `w-full text-center py-2 mt-4 rounded-lg font-bold transition-all duration-200 text-sm ${
        isGlass ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg animate-join-glow' :
        isNeumorphic ? 'text-blue-600 shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:shadow-[10px_10px_20px_#a3b1c6,-10px_-10px_20px_#ffffff] active:shadow-[inset_8px_8px_16px_#a3b1c6,inset_-8px_-8px_16px_#ffffff]' :
        'bg-blue-500 text-white border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[0] active:translate-y-[0] active:shadow-[4px_4px_0px_#000]'
    }`;

    const StyledBadge: React.FC<{onClick: (e: React.MouseEvent) => void, children: React.ReactNode, title?: string, className?: string}> = ({ onClick, children, title, className = '' }) => {
        const badgeClasses = isGlass
            ? `px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-all duration-200 backdrop-blur-sm bg-slate-700/50 border border-slate-600 hover:bg-sky-500/20 hover:border-sky-500/70`
            : isNeumorphic
            ? `px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-all duration-300 transform shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1 active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff]`
            : 'px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-md transition-all duration-200 border-2 border-black bg-white hover:bg-gray-100 active:bg-gray-200';
        return (
            <button
                onClick={onClick}
                title={title}
                className={`${badgeClasses} ${className}`}
            >
                {children}
            </button>
        );
    };
    
    const cardBaseClasses = 'transition-all duration-300 flex flex-col h-full cursor-pointer';
    const titleColor = isGlass ? 'text-slate-50' : isNeumorphic ? 'text-slate-800 text-shadow-soft' : 'text-black';
    const textColor = isGlass ? 'text-slate-300' : isNeumorphic ? 'text-gray-600' : 'text-gray-800';

    return (
        <div
            className={`${cardBaseClasses} ${themeClasses} ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
            onClick={handleCardClick}
            onKeyDown={handleCardKeyPress}
            role="link"
            tabIndex={0}
            aria-label={`View details for ${name}`}
        >
            <div className="p-4 sm:p-6 flex flex-col flex-grow">
                <div className="mb-4">
                    <h2 className={`text-lg md:text-xl font-bold leading-tight truncate ${titleColor}`}>{name}</h2>
                </div>

                <div className={`space-y-3 text-sm mb-4 flex-grow flex flex-col ${textColor}`}>
                    <div>
                        <p>
                            <span className="font-semibold">기간:</span> {new Date(period_start).toLocaleDateString()} ~ {new Date(period_end).toLocaleDateString()}
                        </p>
                        {!isDataLinkCard && (
                            <StyledBadge
                                onClick={(e) => handleSortBadgeClick(e, 'prizeDesc')}
                                title="상금순으로 정렬"
                                className={isGlass ? "text-amber-300" : isNeumorphic ? "text-amber-600" : "text-amber-700 border-amber-500"}
                            >
                                <span role="img" aria-label="prize" className="mr-1.5">🏆</span>
                                {prize}
                            </StyledBadge>
                        )}
                    </div>
                     {isOngoing && !isDataLinkCard && (
                        <div className="mt-auto pt-2">
                            <button onClick={handleJoinClick} className={joinButtonClasses}>
                                대회 참가하기
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center justify-between min-h-[30px]">
                     {isDataLinkCard ? (
                        <>
                           <div className="flex flex-wrap items-center gap-1.5 flex-1 pr-2 overflow-hidden">
                                {keywords.length > 0 ? (
                                    <>
                                        {displayedInlineKeywords.map((k, index) => (
                                            <span key={index} className={`inline-block rounded-full px-2 py-1 text-[10px] sm:text-xs font-semibold ${isGlass ? 'text-slate-200 bg-slate-700/50 border border-slate-600/50' : isNeumorphic ? 'text-gray-700 bg-white/70 shadow-[inset_1px_1px_2px_#a3b1c6,inset_-1px_-1px_2px_#ffffff]' : 'text-black bg-gray-200'}`}>
                                                #{k}
                                            </span>
                                        ))}
                                        {remainingKeywordsCount > 0 && (
                                            <span className={`text-xs font-semibold ${isGlass ? 'text-slate-400' : 'text-gray-500'}`}>
                                                +{remainingKeywordsCount}
                                            </span>
                                        )}
                                    </>
                                ) : (
                                     <span className={`text-xs ${isGlass ? 'text-slate-500' : 'text-gray-400'}`}>키워드 없음</span>
                                )}
                            </div>
                            <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold text-white flex-shrink-0 ${isNeumorphic || isGlass ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg' : 'bg-green-600 border-2 border-black shadow-[2px_2px_0_#000]'}`}>
                                데이터
                            </span>
                        </>
                    ) : (
                        <>
                            <StyledBadge
                                onClick={(e) => handleSortBadgeClick(e, 'participantsDesc')}
                                title="참가자순으로 정렬"
                                className={isGlass ? 'text-indigo-300' : isNeumorphic ? 'text-indigo-600' : 'text-indigo-700 border-indigo-500'}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 inline" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                {formattedCount}
                            </StyledBadge>
                            
                            <div className="flex items-center gap-2">
                                {status === 'ongoing' ? (
                                     <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${ddayTextStyle} ${isGlass ? 'bg-slate-800/50 border border-slate-600/50' : isNeumorphic ? 'bg-white/70 shadow-[inset_1px_1px_2px_#a3b1c6,inset_-1px_-1px_2px_#ffffff]' : 'bg-gray-100 border border-gray-400'}`}>
                                        {ddayText}
                                    </span>
                                ) : (
                                    <button
                                        onClick={(e) => handleStatusBadgeClick(e, status)}
                                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-200 ${ddayTextStyle} ${isGlass ? 'bg-slate-700/30 border border-slate-500/30 hover:bg-slate-600/50' : isNeumorphic ? 'bg-white/70 shadow-[inset_1px_1px_2px_#a3b1c6,inset_-1px_-1px_2px_#ffffff] hover:bg-white' : 'bg-gray-100 border border-gray-400 hover:bg-gray-200'}`}
                                    >
                                        {ddayText}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            {!isDataLinkCard && keywords.length > 0 && (
                <div className={`px-4 sm:px-6 pt-4 pb-4 border-t ${isGlass ? 'border-slate-500/30' : isNeumorphic ? 'border-gray-300/50' : 'border-black border-dashed'} mt-auto`}>
                    <div className={`flex flex-wrap items-center gap-2`}>
                        {displayedKeywords.map((k, index) => (
                            <button
                                key={index}
                                onClick={(e) => handleKeywordClick(e, k)}
                                className={`inline-block rounded-full px-2 py-1 text-xs font-semibold transition-all duration-200 ${isGlass ? 'text-slate-300 bg-slate-700/60 hover:bg-sky-500/20 border border-slate-600 hover:border-sky-500/70' : isNeumorphic ? 'text-gray-600 bg-white/70 shadow-[inset_1px_1px_2px_#a3b1c6,inset_-1px_-1px_2px_#ffffff] hover:bg-white' : 'text-black bg-gray-200 hover:bg-gray-300'}`}
                            >
                                #{k}
                            </button>
                        ))}
                        {isExpandable && (
                            <button
                                onClick={handleToggleKeywords}
                                className={`inline-block rounded-full px-2 py-1 text-xs font-semibold transition-all duration-200 ${isGlass ? 'text-sky-400 bg-slate-700/50 hover:bg-slate-600/70 border border-slate-600/50' : isNeumorphic ? 'text-blue-500 bg-white/70 shadow-[inset_1px_1px_2px_#a3b1c6,inset_-1px_-1px_2px_#ffffff] hover:bg-white' : 'text-blue-600 bg-blue-100 hover:bg-blue-200'}`}
                                aria-expanded={isKeywordsExpanded}
                            >
                                {isKeywordsExpanded ? '접기' : `... +${keywords.length - MAX_KEYWORDS_COLLAPSED} 더보기`}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(CompetitionCard);