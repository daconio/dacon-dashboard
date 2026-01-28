import React from 'react';
import type { Theme } from '../types';

interface EmptyStateProps {
    aiTip: { title: string; content: string } | null;
    isFetchingAiTip: boolean;
    aiTipError: string | null;
    theme: Theme;
    onResetFilters: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ aiTip, isFetchingAiTip, aiTipError, theme, onResetFilters }) => {
    const isGlass = theme === 'dark';
    const isNeumorphic = theme === 'light';

    const containerClasses = isGlass
        ? "text-center py-12 px-6 bg-slate-800/40 backdrop-blur-lg rounded-2xl border border-slate-500/20 shadow-2xl flex flex-col items-center justify-center"
        : isNeumorphic
        ? "text-center py-12 px-6 rounded-2xl shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] flex flex-col items-center justify-center"
        : "text-center py-12 px-6 bg-white rounded-lg border-2 border-black shadow-[6px_6px_0_#000] flex flex-col items-center justify-center";
    const titleClasses = isGlass ? "text-xl font-semibold text-slate-100" : isNeumorphic ? "text-xl font-semibold text-shadow-soft text-slate-700" : "text-xl font-bold text-black";
    const textClasses = isGlass ? "text-slate-400" : isNeumorphic ? "text-gray-500" : "text-gray-700";
    const tipContainerClasses = isGlass
        ? "mt-8 pt-6 border-t border-slate-700/50 w-full max-w-lg mx-auto"
        : isNeumorphic
        ? "mt-8 pt-6 border-t border-gray-300/50 w-full max-w-lg mx-auto"
        : "mt-8 pt-6 border-t-2 border-dashed border-black w-full max-w-lg mx-auto";
    const tipBoxClasses = isGlass
        ? "p-4 rounded-2xl bg-slate-900/30 border border-slate-600/50 min-h-[120px] flex flex-col justify-center"
        : isNeumorphic
        ? "p-4 rounded-2xl shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] min-h-[120px] flex flex-col justify-center"
        : "p-4 rounded-lg bg-blue-100 border-2 border-black min-h-[120px] flex flex-col justify-center";

    const resetButtonClasses = isGlass
        ? "mt-6 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border bg-sky-500/20 text-sky-300 border-sky-400/50 hover:bg-sky-500/40"
        : isNeumorphic
        ? "mt-6 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 transform shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-blue-600 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1"
        : "mt-6 px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 border-2 border-black bg-blue-500 text-white shadow-[3px_3px_0_#000] hover:bg-blue-600";
        
    return (
        <div className={containerClasses}>
            {!isGlass && (
                 <div className="w-40 h-40 mb-6">
                    <svg viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <circle cx="50" cy="50" r="2" fill={isNeumorphic ? "#d1d9e6" : "#adb5bd"}/>
                        <circle cx="100" cy="90" r="1.5" fill={isNeumorphic ? "#d1d9e6" : "#adb5bd"}/>
                        <circle cx="80" cy="30" r="1" fill={isNeumorphic ? "#d1d9e6" : "#adb5bd"}/>
                        <rect x="25" y="100" width="15" height="2" rx="1" fill={isNeumorphic ? "#d1d9e6" : "#adb5bd"}/>
                        <rect x="110" y="60" width="10" height="2" rx="1" fill={isNeumorphic ? "#d1d9e6" : "#adb5bd"}/>
                        <g className="animate-search" style={{ transformOrigin: '75px 75px' }}>
                            <circle cx="75" cy="75" r="30" fill={isNeumorphic ? "rgba(224, 229, 236, 0.5)" : "rgba(255, 255, 255, 0.5)"} stroke={isNeumorphic ? "#b8c1d1" : "#000"} strokeWidth={isNeumorphic ? 5 : 4}/>
                            <line x1="98" y1="98" x2="120" y2="120" stroke={isNeumorphic ? "#b8c1d1" : "#000"} strokeWidth={isNeumorphic ? 8 : 6} strokeLinecap="round" />
                        </g>
                    </svg>
                </div>
            )}
            <h3 className={titleClasses}>검색 결과 없음</h3>
            <p className={`mt-2 ${textClasses}`}>입력하신 필터와 일치하는 콘텐츠가 없습니다.</p>
            <button onClick={onResetFilters} className={resetButtonClasses}>
                모든 필터 초기화
            </button>
            <p className={`mt-4 text-sm ${textClasses}`}>다른 키워드나 필터를 시도해보세요.</p>

            {/* AI Tip Section */}
            <div className={tipContainerClasses}>
                <div className={tipBoxClasses}>
                    {isFetchingAiTip && (
                         <div className="animate-pulse w-full">
                            <div className={`h-5 w-1/3 mx-auto rounded-md ${isGlass ? 'bg-slate-700' : 'bg-slate-400/50'}`}></div>
                            <div className="mt-4 space-y-2">
                                <div className={`h-3 rounded-md ${isGlass ? 'bg-slate-700' : 'bg-slate-400/50'}`}></div>
                                <div className={`h-3 w-5/6 mx-auto rounded-md ${isGlass ? 'bg-slate-700' : 'bg-slate-400/50'}`}></div>
                            </div>
                        </div>
                    )}
                    {aiTipError && (
                        <div className="text-red-500 text-sm">
                            <p>😥 {aiTipError}</p>
                        </div>
                    )}
                    {aiTip && !isFetchingAiTip && (
                        <div>
                            <h4 className={`font-bold text-md mb-2 flex items-center justify-center gap-2 ${isGlass ? 'text-sky-300' : isNeumorphic ? 'text-blue-600 text-shadow-soft' : 'text-black'}`}>
                                <span role="img" aria-label="lightbulb">💡</span>
                                {aiTip.title}
                            </h4>
                            <p className={`text-sm leading-relaxed ${isGlass ? 'text-slate-300' : isNeumorphic ? 'text-gray-600' : 'text-gray-800'}`}>{aiTip.content}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmptyState;