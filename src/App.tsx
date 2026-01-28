import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Competition, Theme } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import CompetitionCard from './components/CompetitionCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Pagination from './components/Pagination';
import RealTimeClock from './components/RealTimeClock';
import DateRangePicker from './components/DateRangePicker';
import ViewSwitcher from './components/ViewSwitcher';
import CalendarView from './components/CalendarView';
import ManualModal from './components/ManualModal';
import WittyQuoteCard from './components/WittyQuoteCard';
import UpcomingCompetitionCard from './components/UpcomingCompetitionCard';
import DaySchoolView from './components/DaySchoolView';
import BaseCodeView from './components/BaseCodeView';
import RoadmapView from './components/RoadmapView';
// FIX: Import GenerateContentResponse to explicitly type the API response.
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ITEMS_PER_PAGE = 27;
const MAX_RECENT_SEARCHES = 5;

type SortCriteria = 'startDateDesc' | 'endDateAsc' | 'participantsDesc' | 'prizeDesc';
type StatusFilter = 'all' | 'ongoing' | 'ended' | 'practice';
type ViewMode = 'list' | 'calendar';
type CompetitionTypeFilter = 'all' | 'algorithm' | 'prompt' | 'service' | 'idea';

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to parse prize money string into a number
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

// FIX: Changed the 'value' parameter from 'unknown' to 'any' to help TypeScript's type inference with the result of JSON.parse, resolving the assignment error.
const isStringArray = (value: any): value is string[] =>
    Array.isArray(value) && value.every(item => typeof item === 'string');

const App: React.FC = () => {
    const [theme, setTheme] = useState<Theme>('brutal');
    const [allCompetitions, setAllCompetitions] = useState<Competition[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State for ticker
    const [tickerStats, setTickerStats] = useState<{
        totalCount: number;
        ongoingCount: number;
        totalPrize: string;
        totalParticipants: string;
    } | null>(null);

    // State for filters
    const [inputValue, setInputValue] = useState<string>(''); // For immediate input
    const [keywordFilter, setKeywordFilter] = useState<string>(''); // Debounced value
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [typeFilter, setTypeFilter] = useState<CompetitionTypeFilter>('all');
    const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
    
    // State for sorting
    const [sortCriteria, setSortCriteria] = useState<SortCriteria>('startDateDesc');

    // State for pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    
    // State for view mode
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    
    // State for search suggestions
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [popularKeywords, setPopularKeywords] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    
    // State for Manual Modal
    const [isManualVisible, setIsManualVisible] = useState<boolean>(false);

    // State for Semantic Search
    const [isSemanticSearching, setIsSemanticSearching] = useState<boolean>(false);
    const [semanticKeywords, setSemanticKeywords] = useState<string[]>([]);

    const isInitialMount = useRef(true);

    useEffect(() => {
        document.body.className = `theme-${theme}`;
    }, [theme]);

    const fetchAllCompetitions = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const apiUrl = 'https://app.dacon.io/api/v1/competition/list?offset=0&range=10000';
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 1 && Array.isArray(result.data) && result.data.length > 0) {
                setAllCompetitions(result.data);
            } else {
                throw new Error('No valid data received from the API. The response might be empty or malformed.');
            }
        } catch (err) {
            console.error('Fetching all competitions failed:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred while fetching data.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchTickerStats = useCallback(async () => {
        try {
            const response = await fetch('https://app.dacon.io/api/v1/main/cpt-stats');
            if (!response.ok) {
                throw new Error('Ticker API call failed');
            }
            const result = await response.json();
            if (result && result.length > 0) {
                const stats = result[0];
                
                const formatPrize = (amountInManWon: number): string => {
                    const amount = amountInManWon * 10000;
                    if (amount >= 100000000) {
                        const billions = Math.round((amount / 100000000) * 10) / 10;
                        return `${billions}억원`;
                    }
                    if (amount >= 10000) {
                        return `${Math.round(amount / 10000).toLocaleString()}만원`;
                    }
                    return `${amount.toLocaleString()}원`;
                };

                setTickerStats({
                    totalCount: stats.cnt_of_competition,
                    ongoingCount: stats.on_going,
                    totalPrize: formatPrize(stats.prize),
                    totalParticipants: stats.participants.toLocaleString(),
                });
            }
        } catch (err) {
            console.error('Fetching ticker stats failed:', err);
            setTickerStats(null);
        }
    }, []);

    // Effect for initial data load and periodic hourly refresh
    useEffect(() => {
        fetchAllCompetitions(); // Fetch on initial load
        fetchTickerStats();
        
        const intervalId = setInterval(() => {
            fetchAllCompetitions();
            fetchTickerStats();
        }, 60 * 60 * 1000); // 1 hour

        return () => {
            clearInterval(intervalId); // Cleanup interval on component unmount
        };
    }, [fetchAllCompetitions, fetchTickerStats]);
    
    // Load recent searches from local storage on initial mount
    useEffect(() => {
        try {
            const storedSearches = localStorage.getItem('daconRecentSearches');
            if (storedSearches) {
                const parsedData = JSON.parse(storedSearches);
                // FIX: Explicitly cast parsedData to string[] to satisfy the compiler.
                if (isStringArray(parsedData)) {
                    setRecentSearches(parsedData as string[]);
                } else {
                    localStorage.removeItem('daconRecentSearches');
                }
            }
        } catch (error) {
            console.error("Failed to parse recent searches from localStorage", error);
            localStorage.removeItem('daconRecentSearches');
        }
    }, []);
    
    // Debounce the keyword filter input
    useEffect(() => {
        const handler = setTimeout(() => {
            setKeywordFilter(inputValue);
        }, 300); // Wait 300ms after the user stops typing

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue]);
    
     // Effect for Semantic Search
    useEffect(() => {
        const fetchSemanticKeywords = async () => {
            if (!keywordFilter || keywordFilter.trim().length < 2) {
                setSemanticKeywords([]);
                setIsSemanticSearching(false);
                return;
            }
            
            setIsSemanticSearching(true);
            try {
                const prompt = `You are a search enhancement AI for 'Dacon', a Korean platform for AI and data science competitions. A user has entered a search query. Your task is to expand this query with relevant Korean and English keywords, synonyms, and related concepts to improve search results. Consider the context of AI competitions. Output ONLY a comma-separated list of these keywords, without any introductory text or newlines. User Query: '${keywordFilter}'`;

                // FIX: Explicitly type the response to ensure correct type inference downstream.
                const response: GenerateContentResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                
                const keywordsText = response.text.trim();
                const keywords = keywordsText ? keywordsText.split(',').map(k => k.trim()).filter(k => k) : [];
                setSemanticKeywords([...new Set(keywords)]);
            } catch (error) {
                console.error("Semantic keyword generation failed:", error);
                setSemanticKeywords([]);
            } finally {
                setIsSemanticSearching(false);
            }
        };

        fetchSemanticKeywords();
    }, [keywordFilter]);

    // Save new searches to recent searches list and local storage
    useEffect(() => {
        if (isInitialMount.current || !keywordFilter.trim()) {
            return;
        }

        const newSearches = [
            keywordFilter.trim(),
            ...recentSearches.filter(s => s.toLowerCase() !== keywordFilter.trim().toLowerCase())
        ];
        const limitedSearches = newSearches.slice(0, MAX_RECENT_SEARCHES);
        
        setRecentSearches(limitedSearches);
        localStorage.setItem('daconRecentSearches', JSON.stringify(limitedSearches));
    }, [keywordFilter, recentSearches]);
    
    // Handle clicks outside of search to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Calculate popular keywords from all competitions
    useEffect(() => {
        if (allCompetitions.length > 0) {
            const keywordCounts: { [key: string]: number } = {};
            allCompetitions.forEach(c => {
                if (c.keyword) {
                    c.keyword.split('|').forEach(k => {
                        const trimmed = k.trim();
                        if (trimmed) {
                            keywordCounts[trimmed] = (keywordCounts[trimmed] || 0) + 1;
                        }
                    });
                }
            });
            const sortedKeywords = Object.entries(keywordCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([keyword]) => keyword)
                .slice(0, 10); // Get top 10 popular keywords
            setPopularKeywords(sortedKeywords);
        }
    }, [allCompetitions]);


    const filteredCompetitions = useMemo(() => {
        const typeFilterKeywords: Record<Exclude<CompetitionTypeFilter, 'all'>, string[]> = {
            algorithm: ['알고리즘'],
            prompt: ['프롬프트'],
            service: ['서비스개발', '서비스 개발', '앱개발', '앱 개발', '개발'],
            idea: ['아이디어']
        };

        const filtered = allCompetitions
            .filter(comp => {
                const now = new Date();
                const endDate = new Date(comp.period_end);
                const isActuallyOngoing = now <= endDate;

                switch (statusFilter) {
                    case 'all':
                        return true;
                    case 'ongoing':
                        return isActuallyOngoing;
                    case 'ended':
                        // Only competitions that are ended AND NOT practice
                        return !isActuallyOngoing && comp.practice !== 1;
                    case 'practice':
                        // Only competitions that are practice (and thus ended)
                        return !isActuallyOngoing && comp.practice === 1;
                    default:
                        return true;
                }
            })
            .filter(comp => {
                if (typeFilter === 'all') return true;
                const lowercasedName = comp.name.toLowerCase();
                return typeFilterKeywords[typeFilter as Exclude<CompetitionTypeFilter, 'all'>].some(keyword => lowercasedName.includes(keyword));
            })
            .filter(comp => {
                const { start, end } = dateRange;
                if (!start && !end) return true;

                const compStartDateStr = comp.period_start.substring(0, 10);
                const compEndDateStr = comp.period_end.substring(0, 10);
                
                if (end && compStartDateStr > end) {
                    return false;
                }
                if (start && compEndDateStr < start) {
                    return false;
                }

                return true;
            })
            .filter(comp => {
                const trimmedKeyword = keywordFilter.trim();
                if (trimmedKeyword === '') return true;
                
                const lowercasedFilter = trimmedKeyword.toLowerCase();
                const allSearchTerms = [...new Set([lowercasedFilter, ...semanticKeywords.map(k => k.toLowerCase())])];

                const compNameLower = (comp.name || '').toLowerCase();
                const compKeywordLower = (comp.keyword || '').toLowerCase();

                return allSearchTerms.some(term => 
                    compNameLower.includes(term) || compKeywordLower.includes(term)
                );
            });
        
        return filtered.sort((a, b) => {
            // Hybrid Search Ranking: Prioritize results that match the original query
            const trimmedKeyword = keywordFilter.trim();
            if (trimmedKeyword) {
                const lowercasedFilter = trimmedKeyword.toLowerCase();
                const aNameLower = (a.name || '').toLowerCase();
                const aKeywordLower = (a.keyword || '').toLowerCase();
                const bNameLower = (b.name || '').toLowerCase();
                const bKeywordLower = (b.keyword || '').toLowerCase();

                const aMatchesOriginal = aNameLower.includes(lowercasedFilter) || aKeywordLower.includes(lowercasedFilter);
                const bMatchesOriginal = bNameLower.includes(lowercasedFilter) || bKeywordLower.includes(lowercasedFilter);

                if (aMatchesOriginal && !bMatchesOriginal) return -1; // a comes first
                if (!aMatchesOriginal && bMatchesOriginal) return 1;  // b comes first
            }
            
            // Fallback to user-selected sort criteria
            switch (sortCriteria) {
                case 'endDateAsc':
                    const now = new Date();
                    const aIsOngoing = new Date(a.period_end) >= now;
                    const bIsOngoing = new Date(b.period_end) >= now;

                    if (aIsOngoing && !bIsOngoing) return -1;
                    if (!aIsOngoing && bIsOngoing) return 1;
                    return new Date(a.period_end).getTime() - new Date(b.period_end).getTime();
                case 'participantsDesc':
                    return b.user_count - a.user_count;
                case 'prizeDesc':
                    return parsePrizeMoney(b.prize_info) - parsePrizeMoney(a.prize_info);
                case 'startDateDesc':
                default:
                    return new Date(b.period_start).getTime() - new Date(b.period_start).getTime();
            }
        });

    }, [allCompetitions, statusFilter, typeFilter, keywordFilter, semanticKeywords, sortCriteria, dateRange]);

    useEffect(() => {
        if (!isInitialMount.current) {
            setCurrentPage(1);
        }
    }, [keywordFilter, statusFilter, typeFilter, sortCriteria, dateRange, viewMode]);
    
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        }
    }, []);

    const handleStatusClick = useCallback((status: StatusFilter) => {
        setStatusFilter(status);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleKeywordClick = useCallback((keyword: string) => {
        setInputValue(keyword);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleSortClick = useCallback((criteria: SortCriteria) => {
        setSortCriteria(criteria);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const paginatedCompetitions = useMemo(() => {
        // Standard pagination for calendar view
        if (viewMode !== 'list') {
            const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
            const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
            return filteredCompetitions.slice(indexOfFirstItem, indexOfLastItem);
        }
    
        // Custom pagination for list view to accommodate the witty quote card on page 1
        const itemsOnFirstPage = ITEMS_PER_PAGE - 1;
    
        if (currentPage === 1) {
            return filteredCompetitions.slice(0, itemsOnFirstPage);
        } else {
            // Calculate the starting index for subsequent pages
            const offset = itemsOnFirstPage + (currentPage - 2) * ITEMS_PER_PAGE;
            return filteredCompetitions.slice(offset, offset + ITEMS_PER_PAGE);
        }
    }, [filteredCompetitions, currentPage, viewMode]);

    const paginationTotalItems = useMemo(() => {
        if (viewMode !== 'list') {
            return filteredCompetitions.length;
        }
        // For list view, add 1 to total items to account for the witty quote card slot,
        // which effectively shifts pagination. If there are no items, no adjustment is needed.
        return filteredCompetitions.length > 0 ? filteredCompetitions.length + 1 : filteredCompetitions.length;
    }, [filteredCompetitions.length, viewMode]);
    
    const handleToggleManual = useCallback(() => {
        setIsManualVisible(prev => !prev);
    }, []);

    const suggestions = useMemo(() => {
        if (!inputValue) {
            // When input is empty, separate recent and popular
            const popularToShow = popularKeywords.filter(
                pk => !recentSearches.some(rs => rs.toLowerCase() === pk.toLowerCase())
            );
            return {
                recent: recentSearches,
                popular: popularToShow,
            };
        }
        
        // When typing, provide a single filtered list
        const combined = [...new Set([...recentSearches, ...popularKeywords])];
        const filtered = combined.filter(
            search =>
                search.toLowerCase().includes(inputValue.toLowerCase()) &&
                search.toLowerCase() !== inputValue.toLowerCase()
        );
        return { filtered };
    }, [inputValue, recentSearches, popularKeywords]);
    
    const renderFilterControls = () => (
        <div className="sticky top-52 z-40 mb-8 p-4 bg-[#e0e5ec] rounded-2xl shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div ref={searchContainerRef} className="relative w-full md:flex-1">
                     <input
                        type="text"
                        placeholder="키워드로 검색 (대회명, 키워드 등)"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full pl-4 pr-[360px] py-3 bg-[#e0e5ec] rounded-lg shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] focus:outline-none text-sm sm:text-base"
                        aria-label="Filter competitions by keyword"
                        autoComplete="off"
                    />
                    {isSemanticSearching && (
                        <div className="absolute top-1/2 right-[330px] -translate-y-1/2" role="status" aria-label="AI expanding search">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        </div>
                    )}
                    <RealTimeClock theme={theme} />
                    {showSuggestions && (
                        (suggestions.recent && suggestions.recent.length > 0) ||
                        (suggestions.popular && suggestions.popular.length > 0) ||
                        (suggestions.filtered && suggestions.filtered.length > 0)
                    ) && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-[#e0e5ec] rounded-2xl shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] z-50 p-2 max-h-60 overflow-y-auto">
                            {!inputValue ? (
                                <>
                                    {suggestions.recent && suggestions.recent.length > 0 && (
                                        <div>
                                            <h4 className="px-2 pt-1 pb-2 text-xs font-bold text-gray-400">최근 검색어</h4>
                                            <ul role="listbox">
                                                {suggestions.recent.map((search, index) => (
                                                    <li key={`recent-${index}`}
                                                        onClick={() => { setInputValue(search); setShowSuggestions(false); }}
                                                        className="p-2 text-sm text-gray-600 rounded-lg cursor-pointer hover:bg-white/50 hover:shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff]"
                                                        role="option" aria-selected="false">
                                                        {search}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {suggestions.popular && suggestions.popular.length > 0 && (
                                        <div className={suggestions.recent && suggestions.recent.length > 0 ? 'mt-2' : ''}>
                                            <h4 className="px-2 pt-1 pb-2 text-xs font-bold text-gray-400">인기 키워드</h4>
                                            <ul role="listbox">
                                                {suggestions.popular.map((search, index) => (
                                                    <li key={`popular-${index}`}
                                                        onClick={() => { setInputValue(search); setShowSuggestions(false); }}
                                                        className="p-2 text-sm text-gray-600 rounded-lg cursor-pointer hover:bg-white/50 hover:shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff]"
                                                        role="option" aria-selected="false">
                                                        {search}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            ) : (
                                suggestions.filtered && suggestions.filtered.length > 0 && (
                                    <ul role="listbox">
                                        {suggestions.filtered.map((search, index) => (
                                            <li key={`filtered-${index}`}
                                                onClick={() => { setInputValue(search); setShowSuggestions(false); }}
                                                className="p-2 text-sm text-gray-600 rounded-lg cursor-pointer hover:bg-white/50 hover:shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff]"
                                                role="option" aria-selected="false">
                                                {search}
                                            </li>
                                        ))}
                                    </ul>
                                )
                            )}
                        </div>
                    )}
                </div>
                 <div className="relative w-full md:w-auto">
                    <select
                        id="sort-select"
                        value={sortCriteria}
                        onChange={(e) => setSortCriteria(e.target.value as SortCriteria)}
                        className="w-full appearance-none pl-4 pr-10 py-3 bg-[#e0e5ec] rounded-lg shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] focus:outline-none text-sm sm:text-base cursor-pointer"
                        aria-label="Sort competitions"
                    >
                        <option value="startDateDesc">최신순</option>
                        <option value="endDateAsc">마감 임박순</option>
                        <option value="participantsDesc">참가자 많은 순</option>
                        <option value="prizeDesc">상금순</option>
                    </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>
             
            {semanticKeywords.length > 0 && !isSemanticSearching && (
                <div className="pt-2 text-xs">
                    <span className="font-semibold text-gray-500 mr-2">✨ AI 확장 검색어:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {semanticKeywords.map(keyword => (
                            <span key={keyword} className="bg-white/70 text-blue-700 px-2 py-1 rounded-full shadow-[inset_1px_1px_2px_#a3b1c6,inset_-1px_-1px_2px_#ffffff]">
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-300/50 pt-4">
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                         <span className="text-sm font-medium text-gray-500 mr-2 hidden sm:inline">상태:</span>
                         <button onClick={() => setStatusFilter('all')} className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all duration-300 transform ${statusFilter === 'all' ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-blue-600' : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[15px_15px_30px_#a3b1c6,-15px_-15px_30px_#ffffff] hover:-translate-y-2'}`} aria-pressed={statusFilter === 'all'}>전체</button>
                        <button onClick={() => setStatusFilter('ongoing')} className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all duration-300 transform ${statusFilter === 'ongoing' ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-blue-600' : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[15px_15px_30px_#a3b1c6,-15px_-15px_30px_#ffffff] hover:-translate-y-2'}`} aria-pressed={statusFilter === 'ongoing'}>진행중</button>
                        <button onClick={() => setStatusFilter('ended')} className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all duration-300 transform ${statusFilter === 'ended' ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-blue-600' : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[15px_15px_30px_#a3b1c6,-15px_-15px_30px_#ffffff] hover:-translate-y-2'}`} aria-pressed={statusFilter === 'ended'}>종료</button>
                        <button onClick={() => setStatusFilter('practice')} className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all duration-300 transform ${statusFilter === 'practice' ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-blue-600' : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[15px_15px_30px_#a3b1c6,-15px_-15px_30px_#ffffff] hover:-translate-y-2'}`} aria-pressed={statusFilter === 'practice'}>연습</button>
                    </div>
                     <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-500 mr-2 hidden sm:inline">유형:</span>
                        <button onClick={() => setTypeFilter('all')} className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all duration-300 transform ${typeFilter === 'all' ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-blue-600' : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[15px_15px_30px_#a3b1c6,-15px_-15px_30px_#ffffff] hover:-translate-y-2'}`} aria-pressed={typeFilter === 'all'}>전체</button>
                        <button onClick={() => setTypeFilter('algorithm')} className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all duration-300 transform ${typeFilter === 'algorithm' ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-blue-600' : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[15px_15px_30px_#a3b1c6,-15px_-15px_30px_#ffffff] hover:-translate-y-2'}`} aria-pressed={typeFilter === 'algorithm'}>알고리즘</button>
                        <button onClick={() => setTypeFilter('prompt')} className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all duration-300 transform ${typeFilter === 'prompt' ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-blue-600' : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[15px_15px_30px_#a3b1c6,-15px_-15px_30px_#ffffff] hover:-translate-y-2'}`} aria-pressed={typeFilter === 'prompt'}>프롬프트</button>
                        <button onClick={() => setTypeFilter('service')} className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all duration-300 transform ${typeFilter === 'service' ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-blue-600' : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[15px_15px_30px_#a3b1c6,-15px_-15px_30px_#ffffff] hover:-translate-y-2'}`} aria-pressed={typeFilter === 'service'}>개발</button>
                        <button onClick={() => setTypeFilter('idea')} className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all duration-300 transform ${typeFilter === 'idea' ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-blue-600' : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[15px_15px_30px_#a3b1c6,-15px_-15px_30px_#ffffff] hover:-translate-y-2'}`} aria-pressed={typeFilter === 'idea'}>아이디어</button>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                    <DateRangePicker value={dateRange} onChange={setDateRange} theme={theme} />
                    <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} theme={theme} />
                     <button 
                        onClick={handleToggleManual}
                        className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold transition-all duration-300 transform shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[15px_15px_30px_#a3b1c6,-15px_-15px_30px_#ffffff] hover:-translate-y-2 active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff]"
                        aria-pressed={isManualVisible}
                        aria-controls="manual-modal"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        매뉴얼
                    </button>
                    <button onClick={() => { setInputValue(''); setStatusFilter('all'); setTypeFilter('all'); setSortCriteria('startDateDesc'); setDateRange({ start: null, end: null }); setViewMode('list'); }} className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all duration-300 transform shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[15px_15px_30px_#a3b1c6,-15px_-15px_30px_#ffffff] hover:-translate-y-2 active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff]" aria-label="Clear all filters">초기화</button>
                </div>
            </div>
        </div>
    );


    return (
        <>
            <Header tickerStats={tickerStats} theme={theme} setTheme={setTheme} />
            <main className="p-4 sm:p-6 md:p-8 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    {renderFilterControls()}
                    
                    {isManualVisible && <ManualModal isOpen={isManualVisible} onClose={handleToggleManual} theme={theme} />}

                    {isLoading && !allCompetitions.length && <LoadingSpinner theme={theme} />}
                    {error && <ErrorMessage message={error} theme={theme} />}
                    {!error && (
                         <>
                            {filteredCompetitions.length > 0 ? (
                                <>
                                    <div className="mb-4 text-sm text-gray-500 text-shadow-soft">
                                        총 <span className="font-bold text-gray-600">{filteredCompetitions.length}</span>개의 경진대회를 찾았습니다.
                                    </div>
                                    
                                    {viewMode === 'list' ? (
                                        <>
                                            <div id="competitions-container" className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                                {currentPage === 1 && filteredCompetitions.length > 0 ? (
                                                    <>
                                                        <UpcomingCompetitionCard animationIndex={0} theme={theme} />
                                                        <WittyQuoteCard key="witty-quote" animationIndex={0} theme={theme} />
                                                        {paginatedCompetitions.map((comp, index) => (
                                                            <CompetitionCard 
                                                                key={comp.cpt_id} 
                                                                competition={comp} 
                                                                onStatusClick={handleStatusClick}
                                                                onKeywordClick={handleKeywordClick}
                                                                onSortClick={handleSortClick}
                                                                animationIndex={index + 1}
                                                                theme={theme}
                                                            />
                                                        ))}
                                                    </>
                                                ) : (
                                                    paginatedCompetitions.map((comp, index) => (
                                                        <CompetitionCard 
                                                            key={comp.cpt_id} 
                                                            competition={comp} 
                                                            onStatusClick={handleStatusClick}
                                                            onKeywordClick={handleKeywordClick}
                                                            onSortClick={handleSortClick}
                                                            animationIndex={index}
                                                            theme={theme}
                                                        />
                                                    ))
                                                )}
                                            </div>
                                            <Pagination
                                                currentPage={currentPage}
                                                totalItems={paginationTotalItems}
                                                itemsPerPage={ITEMS_PER_PAGE}
                                                onPageChange={setCurrentPage}
                                                theme={theme}
                                            />
                                        </>
                                    ) : (
                                        <CalendarView competitions={filteredCompetitions} />
                                    )}
                                </>
                            ) : (
                                !isLoading && (
                                    <div className="text-center py-12 rounded-2xl shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff]">
                                        <h3 className="text-xl font-semibold text-shadow-soft">검색 결과 없음</h3>
                                        <p className="mt-2 text-gray-500">입력하신 필터와 일치하는 경진대회가 없습니다.</p>
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>
            </main>
            <DaySchoolView 
                courses={[]} // Placeholder
                theme={theme}
                keywords={[]}
                selectedKeyword={null}
                onKeywordClick={()=>{}}
                selectedDifficulty={null}
                onDifficultyClick={()=>{}}
                currentPage={1}
                sortCriteria={'status'}
                sortDirection={'desc'}
                onSortChange={()=>{}}
                selectedType={'all'}
                onTypeChange={()=>{}}
            />
            <BaseCodeView 
                items={[]} // Placeholder
                theme={theme}
                selectedCategory={'all'}
                onCategoryChange={()=>{}}
            />
            <RoadmapView theme={theme} />
            <Footer theme={theme} />
        </>
    );
};

export default App;