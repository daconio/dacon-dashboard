import React, { useMemo } from 'react';
import type { DaySchoolCourse } from '../types';
import type { Theme } from '../types';
import DaySchoolCard from './DaySchoolCard';
import DaySchoolAiCard from './DaySchoolAiCard';

type DifficultyLevel = '초급' | '중급' | '고급';
type DaySchoolSortCriteria = 'status' | 'titleAsc' | 'idDesc' | 'difficulty' | 'duration_in_minutes' | 'participant_count';
type DaySchoolType = 'all' | 'course' | 'hackathon' | 'lecture';

interface DaySchoolViewProps {
    courses: DaySchoolCourse[];
    theme: Theme;
    keywords: string[];
    selectedKeyword: string | null;
    onKeywordClick: (keyword: string | null) => void;
    selectedDifficulty: string | null;
    onDifficultyClick: (difficulty: string) => void;
    currentPage: number;
    sortCriteria: DaySchoolSortCriteria;
    sortDirection: 'asc' | 'desc';
    onSortChange: (criteria: DaySchoolSortCriteria) => void;
    selectedType: DaySchoolType;
    onTypeChange: (type: DaySchoolType) => void;
}

const DaySchoolView: React.FC<DaySchoolViewProps> = ({ 
    courses, 
    theme, 
    keywords, 
    selectedKeyword, 
    onKeywordClick, 
    selectedDifficulty, 
    onDifficultyClick, 
    currentPage,
    sortCriteria,
    sortDirection,
    onSortChange,
    selectedType,
    onTypeChange
}) => {
    const isGlass = theme === 'dark';
    const isNeumorphic = theme === 'light';
    
    const displayedKeywords = useMemo(() => {
        return keywords.slice(0, 8);
    }, [keywords]);
    
    const getKeywordButtonClasses = (isActive: boolean) => {
        if (isGlass) {
            return `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 border no-underline ${isActive ? 'bg-emerald-500/40 text-white border-emerald-400/50' : 'bg-slate-700/30 text-slate-200 border-slate-600/50 hover:bg-slate-600/50'}`;
        }
        if (isNeumorphic) {
            return `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 transform no-underline ${isActive ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-emerald-600' : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-gray-700 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1'}`;
        }
        // Webtoon
        return `px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 border-2 border-black no-underline ${isActive ? 'bg-emerald-500 text-white shadow-[3px_3px_0_#000]' : 'bg-white text-black hover:bg-gray-100'}`;
    };

    const getDifficultyButtonClasses = (isActive: boolean, level: DifficultyLevel) => {
        const levelColors = {
            '초급': { glass: 'bg-teal-500/40 text-white border-teal-400/50', neumorphic: 'text-teal-600', webtoon: 'bg-teal-400 text-black shadow-[3px_3px_0_#000]' },
            '중급': { glass: 'bg-indigo-500/40 text-white border-indigo-400/50', neumorphic: 'text-indigo-600', webtoon: 'bg-indigo-400 text-white shadow-[3px_3px_0_#000]' },
            '고급': { glass: 'bg-violet-500/40 text-white border-violet-400/50', neumorphic: 'text-violet-600', webtoon: 'bg-violet-500 text-white shadow-[3px_3px_0_#000]' },
        };

        if (isActive) {
            if (isGlass) return `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 border ${levelColors[level].glass}`;
            if (isNeumorphic) return `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 transform shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] ${levelColors[level].neumorphic}`;
            return `px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 border-2 border-black ${levelColors[level].webtoon}`;
        } else {
            if (isGlass) return `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 border bg-slate-700/30 text-slate-200 border-slate-600/50 hover:bg-slate-600/50`;
            if (isNeumorphic) return `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 transform shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-gray-700 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1`;
            return `px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 border-2 border-black bg-white text-black hover:bg-gray-100`;
        }
    };
    
    const difficulties: DifficultyLevel[] = ['초급', '중급', '고급'];

    const types: { label: string; value: DaySchoolType }[] = [
        { label: '전체', value: 'all' },
        { label: '강좌', value: 'course' },
        { label: '해커톤', value: 'hackathon' },
        { label: '랭커특강', value: 'lecture' },
    ];
    
    const getTypeButtonClasses = (isActive: boolean) => {
       if (isGlass) {
            return `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 border ${isActive ? 'bg-sky-500/40 text-white border-sky-400/50' : 'bg-slate-700/30 text-slate-200 border-slate-600/50 hover:bg-slate-600/50'}`;
        }
        if (isNeumorphic) {
            return `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 transform ${isActive ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-blue-600' : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-gray-700 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1'}`;
        }
        // Webtoon
        return `px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 border-2 border-black ${isActive ? 'bg-blue-500 text-white shadow-[3px_3px_0_#000]' : 'bg-white text-black hover:bg-gray-100'}`;
    };

    return (
        <div>
            <div className={`mb-6 flex flex-col gap-4 p-3 rounded-xl ${isGlass ? 'bg-slate-800/20' : isNeumorphic ? 'shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff]' : 'bg-gray-100 border-2 border-black'}`}>
                 <div className="flex flex-wrap items-center gap-2">
                     <span className={`text-sm font-semibold mr-2 w-12 shrink-0 ${isGlass ? 'text-slate-300' : isNeumorphic ? 'text-gray-600' : 'text-black'}`}>종류:</span>
                     {types.map(type => (
                        <button
                            key={type.value}
                            onClick={() => onTypeChange(type.value)}
                            className={getTypeButtonClasses(selectedType === type.value)}
                            aria-pressed={selectedType === type.value}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-sm font-semibold mr-2 w-12 shrink-0 ${isGlass ? 'text-slate-300' : isNeumorphic ? 'text-gray-600' : 'text-black'}`}>키워드:</span>
                    <button
                        onClick={() => onKeywordClick(null)}
                        className={getKeywordButtonClasses(selectedKeyword === null)}
                        aria-pressed={selectedKeyword === null}
                        title="키워드 필터 초기화"
                    >
                        전체
                    </button>
                    {displayedKeywords.map(keyword => (
                        <button
                            key={keyword}
                            onClick={() => onKeywordClick(keyword)}
                            className={getKeywordButtonClasses(selectedKeyword === keyword)}
                            aria-pressed={selectedKeyword === keyword}
                            title={`'${keyword}' 키워드로 강좌 필터링`}
                        >
                            #{keyword}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                     <span className={`text-sm font-semibold mr-2 w-12 shrink-0 ${isGlass ? 'text-slate-300' : isNeumorphic ? 'text-gray-600' : 'text-black'}`}>난이도:</span>
                     {difficulties.map(level => (
                        <button
                            key={level}
                            onClick={() => onDifficultyClick(level)}
                            className={getDifficultyButtonClasses(selectedDifficulty === level, level)}
                            aria-pressed={selectedDifficulty === level}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {currentPage === 1 && <DaySchoolAiCard theme={theme} />}

                {courses.map((course, index) => (
                    <DaySchoolCard 
                        key={`${course.project_id}-${index}`} 
                        course={course} 
                        theme={theme} 
                        animationIndex={index} 
                        onSortChange={onSortChange}
                        activeSortCriteria={sortCriteria}
                        sortDirection={sortDirection}
                    />
                ))}
            </div>
        </div>
    );
};

export default DaySchoolView;