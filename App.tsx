
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Competition, Theme } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import CompetitionCard from './components/CompetitionCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Pagination from './components/Pagination';
import Ticker from './components/Ticker';
import TopBanner from './components/TopBanner';
import UpcomingCompetitionCard from './components/UpcomingCompetitionCard';
import WittyQuoteCard from './components/WittyQuoteCard';
import ManualModal from './components/ManualModal';

// Content Views
import DaySchoolView from './components/DaySchoolView';
import BaseCodeView from './components/BaseCodeView';
import RoadmapView from './components/RoadmapView';

// Data
import { daySchoolCourses } from './data/daySchoolCourses';
import { baseCodeData } from './data/baseCodeData';
import { rankerLectures } from './data/rankerLectures';

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ITEMS_PER_PAGE = 27;
const MAX_RECENT_SEARCHES = 5;

type Category = '대회' | '데이터' | '코드' | '참가 방법' | '학습' | '강좌' | '해커톤' | '랭커특강' | '로드맵';
type SortCriteria = 'startDateDesc' | 'endDateAsc' | 'participantsDesc' | 'prizeDesc';
type StatusFilter = 'all' | 'ongoing' | 'ended' | 'practice';
type CompetitionTypeFilter = 'all' | 'algorithm' | 'prompt' | 'service' | 'idea';

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parsePrizeMoney = (prizeInfo: string | null): number => {
    if (!prizeInfo || prizeInfo.includes('없음')) return 0;
    const sanitized = prizeInfo.replace(/[,원총상금\s]/g, '');
    let value = 0;
    if (sanitized.includes('억')) {
        value = parseFloat(sanitized.replace('억', '')) * 100000000;
    } else if (sanitized.includes('만')) {
        value = parseFloat(sanitized.replace('만', '')) * 10000;
    } else {
        value = parseFloat(sanitized);
    }
    return isNaN(value) ? 0 : value;
};

const isStringArray = (value: any): value is string[] =>
    Array.isArray(value) && value.every(item => typeof item === 'string');

const App: React.FC = () => {
    const [theme, setTheme] = useState<Theme>('brutal'); // Default to brutal/high-contrast as per screenshot
    const [allCompetitions, setAllCompetitions] = useState<Competition[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Filter States
    const [activeCategory, setActiveCategory] = useState<Category>('대회');
    const [inputValue, setInputValue] = useState<string>('');
    const [keywordFilter, setKeywordFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [typeFilter, setTypeFilter] = useState<CompetitionTypeFilter>('all');
    const [sortCriteria, setSortCriteria] = useState<SortCriteria>('startDateDesc');
    const [currentPage, setCurrentPage] = useState<number>(1);
    
    // UI States
    const [isDetailFilterOpen, setIsDetailFilterOpen] = useState(true);
    const [isManualVisible, setIsManualVisible] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [popularKeywords, setPopularKeywords] = useState<string[]>([]);
    const [tickerStats, setTickerStats] = useState<any>(null);

    // DaySchool States
    const [dsDifficulty, setDsDifficulty] = useState<string | null>(null);
    const [dsKeyword, setDsKeyword] = useState<string | null>(null);
    const [dsType, setDsType] = useState<any>('all');

    // BaseCode States
    const [bcCategory, setBcCategory] = useState<any>('all');

    // Derived Data for Sub-views
    const allCourses = useMemo(() => [...daySchoolCourses, ...rankerLectures], []);
    const dsKeywords = useMemo(() => Array.from(new Set(allCourses.flatMap(c => c.tags.map(t => t.tag_title)))), [allCourses]);

    useEffect(() => {
        document.body.className = `theme-${theme}`;
    }, [theme]);

    const fetchAllCompetitions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const apiUrl = 'https://app.dacon.io/api/v1/competition/list?offset=0&range=10000';
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`API call failed: ${response.status}`);
            const result = await response.json();
            if (result.status === 1 && Array.isArray(result.data)) {
                setAllCompetitions(result.data);
            } else {
                throw new Error('No valid data received.');
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchTickerStats = useCallback(async () => {
        try {
            const response = await fetch('https://app.dacon.io/api/v1/main/cpt-stats');
            if (response.ok) {
                const result = await response.json();
                if (result && result.length > 0) {
                    const stats = result[0];
                    setTickerStats({
                        totalCount: stats.cnt_of_competition,
                        ongoingCount: stats.on_going,
                        totalPrize: `${Math.round(stats.prize / 10000)}억원`,
                        totalParticipants: stats.participants.toLocaleString(),
                    });
                }
            }
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        fetchAllCompetitions();
        fetchTickerStats();
    }, [fetchAllCompetitions, fetchTickerStats]);

    useEffect(() => {
        const handler = setTimeout(() => setKeywordFilter(inputValue), 300);
        return () => clearTimeout(handler);
    }, [inputValue]);

    // Filtering Logic for Competitions
    const filteredCompetitions = useMemo(() => {
        return allCompetitions
            .filter(comp => {
                const now = new Date();
                const endDate = new Date(comp.period_end);
                const isActuallyOngoing = now <= endDate;

                if (statusFilter === 'ongoing') return isActuallyOngoing;
                if (statusFilter === 'ended') return !isActuallyOngoing && comp.practice !== 1;
                if (statusFilter === 'practice') return comp.practice === 1;
                return true;
            })
            .filter(comp => {
                if (typeFilter === 'all') return true;
                const typeKeywords = { algorithm: '알고리즘', prompt: '프롬프트', service: '개발', idea: '아이디어' };
                return comp.name.includes(typeKeywords[typeFilter]);
            })
            .filter(comp => comp.name.toLowerCase().includes(keywordFilter.toLowerCase()))
            .sort((a, b) => {
                if (sortCriteria === 'endDateAsc') return new Date(a.period_end).getTime() - new Date(b.period_end).getTime();
                if (sortCriteria === 'participantsDesc') return b.user_count - a.user_count;
                if (sortCriteria === 'prizeDesc') return parsePrizeMoney(b.prize_info) - parsePrizeMoney(a.prize_info);
                return new Date(b.period_start).getTime() - new Date(a.period_start).getTime(); // Default: startDateDesc
            });
    }, [allCompetitions, statusFilter, typeFilter, keywordFilter, sortCriteria]);

    // Pagination for Competitions
    const paginatedCompetitions = useMemo(() => {
        const itemsOnFirstPage = ITEMS_PER_PAGE - 2; // Subtract space for special cards
        if (currentPage === 1) return filteredCompetitions.slice(0, itemsOnFirstPage);
        const offset = itemsOnFirstPage + (currentPage - 2) * ITEMS_PER_PAGE;
        return filteredCompetitions.slice(offset, offset + ITEMS_PER_PAGE);
    }, [filteredCompetitions, currentPage]);

    const paginationTotalItems = filteredCompetitions.length > 0 ? filteredCompetitions.length + 2 : 0;

    // Filter Logic for DaySchool
    const filteredCourses = useMemo(() => {
        let result = allCourses;
        if (activeCategory === '강좌') result = result.filter(c => c.type === 'course');
        if (activeCategory === '해커톤') result = result.filter(c => c.type === 'hackathon');
        if (activeCategory === '랭커특강') result = result.filter(c => c.type === 'lecture');
        
        if (dsType !== 'all') result = result.filter(c => c.type === dsType);
        if (dsKeyword) result = result.filter(c => c.tags.some(t => t.tag_title === dsKeyword));
        if (dsDifficulty) result = result.filter(c => c.difficulty === dsDifficulty);
        return result;
    }, [allCourses, activeCategory, dsType, dsKeyword, dsDifficulty]);

    // Filter Logic for BaseCode
    const filteredBaseCodes = useMemo(() => {
        if (bcCategory === 'all') return baseCodeData;
        return baseCodeData.filter(item => item.category === bcCategory);
    }, [bcCategory]);

    const categories: Category[] = ['대회', '데이터', '코드', '참가 방법', '학습', '강좌', '해커톤', '랭커특강', '로드맵'];

    const renderFilterControls = () => (
        <div className="mb-8 border-2 border-black rounded-xl p-6 bg-white shadow-[4px_4px_0_#000]">
            {/* Search & Sort Row */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <input 
                        type="text" 
                        placeholder="키워드로 전체 콘텐츠 검색 (대회, 강좌, 코드)"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full h-12 px-4 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                </div>
                <div className="w-full md:w-48">
                    <select 
                        value={sortCriteria} 
                        onChange={(e) => setSortCriteria(e.target.value as SortCriteria)}
                        className="w-full h-12 px-4 border-2 border-black rounded-lg focus:outline-none font-bold appearance-none bg-white"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '0.65em auto' }}
                    >
                        <option value="startDateDesc">최신순</option>
                        <option value="endDateAsc">마감 임박순</option>
                        <option value="participantsDesc">참가자순</option>
                        <option value="prizeDesc">상금순</option>
                    </select>
                </div>
            </div>

            {/* Category Buttons Row */}
            <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b-2 border-dashed border-gray-300">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setIsDetailFilterOpen(true); }}
                        className={`px-4 py-2 rounded-lg font-bold text-sm border-2 border-black transition-all ${
                            activeCategory === cat 
                            ? 'bg-blue-600 text-white shadow-[2px_2px_0_#000]' 
                            : 'bg-white text-black hover:bg-gray-100'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
                <button 
                    onClick={() => setIsDetailFilterOpen(!isDetailFilterOpen)}
                    className="ml-auto px-4 py-2 bg-blue-600 text-white font-bold rounded-lg border-2 border-black shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2"
                >
                    상세필터
                    <svg className={`w-4 h-4 transition-transform ${isDetailFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>

            {/* Detail Filters (Only for Competitions primarily) */}
            {isDetailFilterOpen && (activeCategory === '대회' || activeCategory === '데이터') && (
                <div className="space-y-4 animate-fadeInUp">
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="font-bold text-gray-700 w-12">상태:</span>
                        {['all', 'ongoing', 'ended', 'practice'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status as StatusFilter)}
                                className={`px-3 py-1.5 text-sm font-bold border-2 border-black rounded ${statusFilter === status ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                {status === 'all' ? '전체' : status === 'ongoing' ? '진행중' : status === 'ended' ? '종료' : '연습'}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="font-bold text-gray-700 w-12">유형:</span>
                        {['all', 'algorithm', 'prompt', 'service', 'idea'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type as CompetitionTypeFilter)}
                                className={`px-3 py-1.5 text-sm font-bold border-2 border-black rounded ${typeFilter === type ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                {type === 'all' ? '전체' : type === 'algorithm' ? '알고리즘' : type === 'prompt' ? '프롬프트' : type === 'service' ? '개발' : '아이디어'}
                            </button>
                        ))}
                        
                        <div className="ml-auto flex gap-2">
                            <button onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setInputValue(''); }} className="px-3 py-1.5 text-xs font-bold border-2 border-black bg-white rounded hover:bg-gray-100">초기화</button>
                            <button onClick={() => setIsManualVisible(true)} className="px-3 py-1.5 text-xs font-bold border-2 border-black bg-white rounded hover:bg-gray-100">매뉴얼</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8f9fa] text-[#212529]">
            <TopBanner />
            <Header theme={theme} setTheme={setTheme} tickerStats={tickerStats} />
            <div className="w-full border-b border-gray-200 bg-white py-2">
                <div className="max-w-7xl mx-auto px-4">
                    {tickerStats && (
                        <Ticker items={[
                            `진행중 ${tickerStats.ongoingCount}개`,
                            `총 상금 약 ${tickerStats.totalPrize}`,
                            `총 참가자 ${tickerStats.totalParticipants}명`,
                            `총 307개 대회`,
                            `진행중 ${tickerStats.ongoingCount}개`,
                            `총 상금 약 ${tickerStats.totalPrize}`
                        ]} theme={theme} />
                    )}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {renderFilterControls()}

                {isManualVisible && <ManualModal isOpen={isManualVisible} onClose={() => setIsManualVisible(false)} theme={theme} />}

                {/* Content Switching Logic */}
                {(activeCategory === '대회' || activeCategory === '데이터') && (
                    <>
                        <div className="mb-4 text-sm text-gray-500 font-medium">
                            총 {filteredCompetitions.length}개의 경진대회를 찾았습니다.
                        </div>
                        {isLoading ? <LoadingSpinner theme={theme} /> : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {currentPage === 1 && (
                                        <>
                                            <UpcomingCompetitionCard animationIndex={0} theme={theme} />
                                            <WittyQuoteCard animationIndex={1} theme={theme} />
                                        </>
                                    )}
                                    {paginatedCompetitions.map((comp, idx) => (
                                        <CompetitionCard 
                                            key={comp.cpt_id} 
                                            competition={comp} 
                                            theme={theme}
                                            animationIndex={idx + 2}
                                            onStatusClick={() => {}} onKeywordClick={() => {}} onSortClick={() => {}}
                                        />
                                    ))}
                                </div>
                                <Pagination 
                                    currentPage={currentPage} 
                                    totalItems={paginationTotalItems} 
                                    itemsPerPage={ITEMS_PER_PAGE} 
                                    onPageChange={setCurrentPage} 
                                    theme={theme} 
                                />
                            </>
                        )}
                    </>
                )}

                {(activeCategory === '학습' || activeCategory === '강좌' || activeCategory === '해커톤' || activeCategory === '랭커특강') && (
                    <DaySchoolView 
                        courses={filteredCourses}
                        theme={theme}
                        keywords={dsKeywords}
                        selectedKeyword={dsKeyword}
                        onKeywordClick={setDsKeyword}
                        selectedDifficulty={dsDifficulty}
                        onDifficultyClick={(d) => setDsDifficulty(d === dsDifficulty ? null : d)}
                        currentPage={1}
                        sortCriteria="status"
                        sortDirection="desc"
                        onSortChange={() => {}}
                        selectedType={dsType}
                        onTypeChange={setDsType}
                    />
                )}

                {activeCategory === '코드' && (
                    <BaseCodeView 
                        items={filteredBaseCodes}
                        theme={theme}
                        selectedCategory={bcCategory}
                        onCategoryChange={setBcCategory}
                    />
                )}

                {activeCategory === '로드맵' && (
                    <RoadmapView theme={theme} />
                )}
                
                {/* Fallback for other categories not fully implemented */}
                {['참가 방법'].includes(activeCategory) && (
                    <div className="py-20 text-center text-gray-500 font-bold text-xl bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_#000]">
                        준비 중인 페이지입니다. 🚧
                    </div>
                )}

            </main>
            <Footer theme={theme} />
        </div>
    );
};

export default App;
