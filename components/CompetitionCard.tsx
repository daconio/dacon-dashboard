
import React from 'react';
import type { Competition, Theme } from '../types';

interface CompetitionCardProps {
    competition: Competition;
    theme: Theme;
    onStatusClick: (status: any) => void;
    onKeywordClick: (keyword: string) => void;
    onSortClick: (criteria: any) => void;
    animationIndex: number;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ competition, animationIndex }) => {
    const { name, period_end, user_count, team_count, prize_info, practice, cpt_id, period_start } = competition;
    
    // Calculate D-Day
    const now = new Date();
    const endDate = new Date(period_end);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isOngoing = diffDays >= 0;
    const dDayText = isOngoing ? (diffDays === 0 ? 'D-Day' : `D-${diffDays}`) : '종료';
    
    // Determine card accent color
    const variants = [
        { border: 'border-blue-600', btn: 'bg-blue-600 hover:bg-blue-700', text: 'text-blue-600' },
        { border: 'border-red-500', btn: 'bg-red-500 hover:bg-red-600', text: 'text-red-500' },
        { border: 'border-black', btn: 'bg-black hover:bg-gray-800', text: 'text-black' },
    ];
    const variant = variants[cpt_id % 3];
    const isClosed = !isOngoing && !practice;

    return (
        <div className={`bg-white rounded-xl border-2 ${isClosed ? 'border-gray-300 opacity-80' : 'border-black'} overflow-hidden shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_rgba(0,0,0,1)] transition-all h-full flex flex-col animate-fadeInUp`} style={{ animationDelay: `${animationIndex * 50}ms` }}>
            <div className={`p-5 flex flex-col h-full justify-between ${isClosed ? 'grayscale-[0.5]' : ''}`}>
                <div>
                    {/* Header: Title & D-Day */}
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold leading-tight line-clamp-2 text-black flex-1 pr-2">
                            {name}
                        </h3>
                        {isOngoing && (
                            <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full border ${isClosed ? 'border-gray-400 text-gray-500' : 'border-black text-black'}`}>
                                {dDayText}
                            </span>
                        )}
                    </div>

                    {/* Period */}
                    <p className="text-xs text-gray-500 font-medium mb-3">
                        기간: {period_start.substring(0, 10).replace(/-/g, '. ')} ~ {period_end.substring(0, 10).replace(/-/g, '. ')}
                    </p>

                    {/* Prize */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg font-bold">🏆</span>
                        <span className="text-sm font-bold text-black border-b-2 border-yellow-300">
                            {prize_info || '상금 정보 없음'}
                        </span>
                    </div>
                </div>

                <div>
                    {/* Action Button */}
                    <button className={`w-full py-3 rounded-lg font-bold text-white text-sm shadow-md transition-colors mb-4 ${isClosed ? 'bg-gray-400 cursor-not-allowed' : variant.btn}`}>
                        {isClosed ? '종료됨' : '대회 참가하기'}
                    </button>

                    {/* Footer: Stats & Tags */}
                    <div className="flex items-center justify-between border-t border-dashed border-gray-300 pt-3">
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                                {user_count || team_count || 0}명
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="px-2 py-0.5 rounded-full border border-gray-300 text-[10px] text-gray-500">
                                D-{Math.floor(Math.random() * 30)}
                            </span>
                        </div>
                    </div>
                    
                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1 mt-3">
                        {['#아이디어', '#알고리즘', '...'].slice(0, 2).map((k, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 rounded text-[10px] font-medium text-gray-600">
                                {k}
                            </span>
                        ))}
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">
                            ... +2 더보기
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompetitionCard;
