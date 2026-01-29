
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Competition, DaySchoolCourse, BaseCodeItem, BaseCodeCategory, ViewMode } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import CompetitionCard from './components/CompetitionCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Pagination from './components/Pagination';
import ManualModal from './components/ManualModal';
import WittyQuoteCard from './components/WittyQuoteCard';
import Toast from './components/Toast';
import EmptyState from './components/EmptyState';
import DaySchoolView from './components/DaySchoolView';
import RoadmapView from './components/RoadmapView';
import BaseCodeView from './components/BaseCodeView';
import { staticCompetitions } from './data/staticCompetitions';
import { baseCodeData } from './data/baseCodeData';
import { daySchoolCourses } from './data/daySchoolCourses';
import { rankerLectures } from './data/rankerLectures';
import { GoogleGenAI, Type } from "@google/genai";
import { staticBannerTexts, type BannerText } from './data/bannerTexts';
import UpcomingCompetitionCard from './components/UpcomingCompetitionCard';

const ITEMS_PER_PAGE = 27;
const ITEMS_PER_PAGE_DAYSCHOOL = 24;
const ITEMS_PER_PAGE_BASECODE = 24;
const MAX_RECENT_SEARCHES = 5;

type SortCriteria = 'startDateDesc' | 'endDateAsc' | 'participantsDesc' | 'prizeDesc';
type DaySchoolSortCriteria = 'status' | 'titleAsc' | 'idDesc' | 'difficulty' | 'duration_in_minutes' | 'participant_count';
type StatusFilter = 'all' | 'ongoing' | 'ended' | 'practice';
type Theme = 'glass' | 'neumorphic' | 'webtoon';
type CompetitionTypeFilter = 'all' | 'algorithm' | 'prompt' | 'service' | 'idea';
type DaySchoolTypeFilter = 'all' | 'course' | 'hackathon' | 'lecture';

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

const staticAiTips = [
    { title: "검색 팁: 키워드 조합", content: "더 정확한 결과를 위해 '시계열 예측'처럼 두 단어 이상의 구체적인 키워드를 사용해보세요." },
    { title: "새로운 분야 탐색", content: "결과가 없나요? 'NLP'나 '비전' 같은 인기 키워드로 검색하여 새로운 분야의 대회를 탐색해보는 건 어떠세요?" },
    { title: "필터 활용하기", content: "'진행중' 상태 필터를 사용해 지금 바로 참여할 수 있는 대회를 찾아보세요! 좋은 기회가 기다리고 있을지 모릅니다." }
];

const CompetitionRoadmapView: React.FC<{ theme: Theme }> = ({ theme }) => {
    const isGlass = theme === 'glass';
    const isNeumorphic = theme === 'neumorphic';

    const containerClasses = isGlass
        ? "bg-slate-800/40 backdrop-blur-lg rounded-2xl border border-slate-500/20 shadow-2xl p-4 sm:p-6 md:p-8"
        : isNeumorphic
        ? "bg-[#e0e5ec] rounded-2xl shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] p-4 sm:p-6 md:p-8"
        : "bg-white rounded-lg border-2 border-black shadow-[6px_6px_0_#000] p-4 sm:p-6 md:p-8";

    const titleClasses = isGlass
        ? "text-2xl sm:text-3xl font-bold mb-4 text-slate-100 text-shadow-elegant"
        : isNeumorphic
        ? "text-2xl sm:text-3xl font-bold mb-4 text-slate-700 text-shadow-soft"
        : "text-2xl sm:text-3xl font-bold mb-4 text-black";

    const textClasses = isGlass
        ? "mb-6 text-slate-300"
        : isNeumorphic
        ? "mb-6 text-gray-600"
        : "mb-6 text-gray-800";
    
    const imageWrapperClasses = isGlass
        ? "rounded-xl overflow-hidden border border-slate-700"
        : isNeumorphic
        ? "rounded-xl overflow-hidden shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff]"
        : "rounded-lg overflow-hidden border-2 border-black";


    return (
        <div className={`animate-fadeInUp ${containerClasses}`}>
            <header className="text-center">
                <h2 className={titleClasses}>대회 참가 방법 로드맵</h2>
                <p className={textClasses}>
                    AI 경진대회에 참가하는 전체 과정을 한눈에 살펴보세요. 데이터 분석부터 모델 제출까지의 여정을 안내합니다.
                </p>
            </header>
            <div className={imageWrapperClasses}>
                <img
                    src="https://dacon.s3.ap-northeast-2.amazonaws.com/etc/how-to-participate-KR.webp"
                    alt="대회 참가 방법 로드맵"
                    className="w-full h-auto"
                />
            </div>
        </div>
    );
};

interface CompetitionListViewProps {
  filteredCompetitions: Competition[];
  paginatedCompetitions: Competition[];
  currentPage: number;
  paginationTotalItems: number;
  hasActiveFilters: boolean;
  theme: Theme;
  showDataLinksOnly: boolean;
  isLoading: boolean;
  aiTip: { title: string; content: string } | null;
  isFetchingAiTip: boolean;
  aiTipError: string | null;
  onStatusClick: (status: StatusFilter) => void;
  onKeywordClick: (keyword: string) => void;
  onSortClick: (criteria: SortCriteria) => void;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
}

const CompetitionListView: React.FC<CompetitionListViewProps> = ({
  filteredCompetitions,
  paginatedCompetitions,
  currentPage,
  paginationTotalItems,
  hasActiveFilters,
  theme,
  showDataLinksOnly,
  isLoading,
  aiTip,
  isFetchingAiTip,
  aiTipError,
  onStatusClick,
  onKeywordClick,
  onSortClick,
  onPageChange,
  onResetFilters
}) => {
  const isFirstPageDefault = currentPage === 1 && !hasActiveFilters;

  const { ongoingOnFirstPage, othersOnFirstPage } = useMemo(() => {
    if (!isFirstPageDefault) {
      return { ongoingOnFirstPage: [], othersOnFirstPage: [] };
    }
    const ongoing: Competition[] = [];
    const others: Competition[] = [];
    for (const comp of paginatedCompetitions) {
      const isOngoing = new Date() <= new Date(comp.period_end);
      if (isOngoing) {
        ongoing.push(comp);
      } else {
        others.push(comp);
      }
    }
    return { ongoingOnFirstPage: ongoing, othersOnFirstPage: others };
  }, [isFirstPageDefault, paginatedCompetitions]);

  return filteredCompetitions.length > 0 ? (
    <>
      <div className={`mb-4 text-sm ${theme === 'glass' ? 'text-slate-400' : 'text-gray-500'}`} role="status">
        총 {filteredCompetitions.length}개의 경진대회를 찾았습니다.
      </div>
      <div id="competitions-container" className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isFirstPageDefault ? (
          <>
            {ongoingOnFirstPage.map((comp, index) => (
              <CompetitionCard 
                key={comp.cpt_id} 
                competition={comp} 
                onStatusClick={onStatusClick} 
                onKeywordClick={onKeywordClick} 
                onSortClick={onSortClick} 
                animationIndex={index} 
                isDataLinkCard={showDataLinksOnly} 
                theme={theme}
              />
            ))}
            
            <UpcomingCompetitionCard key="upcoming-comp" animationIndex={ongoingOnFirstPage.length} theme={theme} />
            <WittyQuoteCard key="witty-quote" animationIndex={ongoingOnFirstPage.length + 1} theme={theme} />

            {othersOnFirstPage.map((comp, index) => (
              <CompetitionCard 
                key={comp.cpt_id} 
                competition={comp} 
                onStatusClick={onStatusClick} 
                onKeywordClick={onKeywordClick} 
                onSortClick={onSortClick} 
                animationIndex={ongoingOnFirstPage.length + 2 + index} 
                isDataLinkCard={showDataLinksOnly} 
                theme={theme}
              />
            ))}
          </>
        ) : (
          paginatedCompetitions.map((comp, index) => (
            <CompetitionCard 
              key={comp.cpt_id} 
              competition={comp} 
              onStatusClick={onStatusClick} 
              onKeywordClick={onKeywordClick} 
              onSortClick={onSortClick} 
              animationIndex={index} 
              isDataLinkCard={showDataLinksOnly} 
              theme={theme}
            />
          ))
        )}
      </div>
      <Pagination currentPage={currentPage} totalItems={paginationTotalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={onPageChange} theme={theme} />
    </>
  ) : !isLoading ? <EmptyState onResetFilters={onResetFilters} aiTip={aiTip} isFetchingAiTip={isFetchingAiTip} aiTipError={aiTipError} theme={theme} /> : null;
};

interface DaySchoolContentViewProps {
    filteredDaySchoolCourses: DaySchoolCourse[];
    paginatedDaySchoolCourses: DaySchoolCourse[];
    theme: Theme;
    popularDaySchoolKeywords: string[];
    daySchoolKeywordFilter: string | null;
    handleDaySchoolKeywordClick: (keyword: string | null) => void;
    daySchoolDifficultyFilter: string | null;
    handleDaySchoolDifficultyClick: (difficulty: string) => void;
    currentPage: number;
    daySchoolSortCriteria: DaySchoolSortCriteria;
    daySchoolSortDirection: 'asc' | 'desc';
    handleDaySchoolSortChange: (criteria: DaySchoolSortCriteria) => void;
    daySchoolTypeFilter: DaySchoolTypeFilter;
    handleDaySchoolTypeChange: (type: DaySchoolTypeFilter) => void;
    paginationTotalItems: number;
    onPageChange: (page: number) => void;
    isLoading: boolean;
    onResetFilters: () => void;
    aiTip: { title: string; content: string } | null;
    isFetchingAiTip: boolean;
    aiTipError: string | null;
}

const DaySchoolContentView: React.FC<DaySchoolContentViewProps> = ({
    filteredDaySchoolCourses,
    paginatedDaySchoolCourses,
    theme,
    popularDaySchoolKeywords,
    daySchoolKeywordFilter,
    handleDaySchoolKeywordClick,
    daySchoolDifficultyFilter,
    handleDaySchoolDifficultyClick,
    currentPage,
    daySchoolSortCriteria,
    daySchoolSortDirection,
    handleDaySchoolSortChange,
    daySchoolTypeFilter,
    handleDaySchoolTypeChange,
    paginationTotalItems,
    onPageChange,
    isLoading,
    onResetFilters,
    aiTip,
    isFetchingAiTip,
    aiTipError,
}) => {
    return filteredDaySchoolCourses.length > 0 ? (
        <>
            <div className={`mb-4 text-sm ${theme === 'glass' ? 'text-slate-400' : 'text-gray-500'}`} role="status">
                총 {filteredDaySchoolCourses.length}개의 강좌를 찾았습니다.
            </div>
            <DaySchoolView 
                courses={paginatedDaySchoolCourses} 
                theme={theme} 
                keywords={popularDaySchoolKeywords} 
                selectedKeyword={daySchoolKeywordFilter} 
                onKeywordClick={handleDaySchoolKeywordClick} 
                selectedDifficulty={daySchoolDifficultyFilter} 
                onDifficultyClick={handleDaySchoolDifficultyClick} 
                currentPage={currentPage} 
                sortCriteria={daySchoolSortCriteria}
                sortDirection={daySchoolSortDirection}
                onSortChange={handleDaySchoolSortChange}
                selectedType={daySchoolTypeFilter} 
                onTypeChange={handleDaySchoolTypeChange} 
            />
            <Pagination currentPage={currentPage} totalItems={paginationTotalItems} itemsPerPage={ITEMS_PER_PAGE_DAYSCHOOL} onPageChange={onPageChange} theme={theme} />
        </>
    ) : !isLoading ? <EmptyState onResetFilters={onResetFilters} aiTip={aiTip} isFetchingAiTip={isFetchingAiTip} aiTipError={aiTipError} theme={theme} /> : null;
};

interface BaseCodeContentViewProps {
    filteredBaseCode: BaseCodeItem[];
    paginatedBaseCode: BaseCodeItem[];
    theme: Theme;
    baseCodeCategoryFilter: BaseCodeCategory | 'all';
    handleBaseCodeCategoryChange: (category: BaseCodeCategory | 'all') => void;
    currentPage: number;
    paginationTotalItems: number;
    onPageChange: (page: number) => void;
    isLoading: boolean;
    onResetFilters: () => void;
    aiTip: { title: string; content: string } | null;
    isFetchingAiTip: boolean;
    aiTipError: string | null;
}

const BaseCodeContentView: React.FC<BaseCodeContentViewProps> = ({
    filteredBaseCode,
    paginatedBaseCode,
    theme,
    baseCodeCategoryFilter,
    handleBaseCodeCategoryChange,
    currentPage,
    paginationTotalItems,
    onPageChange,
    isLoading,
    onResetFilters,
    aiTip,
    isFetchingAiTip,
    aiTipError,
}) => {
    return filteredBaseCode.length > 0 ? (
         <>
            <div className={`mb-4 text-sm ${theme === 'glass' ? 'text-slate-400' : 'text-gray-500'}`} role="status">
                총 {filteredBaseCode.length}개의 코드를 찾았습니다.
            </div>
            <BaseCodeView items={paginatedBaseCode} theme={theme} selectedCategory={baseCodeCategoryFilter} onCategoryChange={handleBaseCodeCategoryChange} />
            <Pagination currentPage={currentPage} totalItems={paginationTotalItems} itemsPerPage={ITEMS_PER_PAGE_BASECODE} onPageChange={onPageChange} theme={theme} />
        </>
    ) : !isLoading ? <EmptyState onResetFilters={onResetFilters} aiTip={aiTip} isFetchingAiTip={isFetchingAiTip} aiTipError={aiTipError} theme={theme} /> : null;
};

const App: React.FC = () => {
    const [allCompetitions, setAllCompetitions] = useState<Competition[]>([]);
    const [allDaySchoolContent, setAllDaySchoolContent] = useState<DaySchoolCourse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('daconTheme') as Theme) || 'webtoon');
    const [tickerStats, setTickerStats] = useState<any>(null);
    const [daySchoolTickerStats, setDaySchoolTickerStats] = useState<any>(null);
    const [inputValue, setInputValue] = useState<string>('');
    const [keywordFilter, setKeywordFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [typeFilter, setTypeFilter] = useState<CompetitionTypeFilter>('all');
    const [sortCriteria, setSortCriteria] = useState<SortCriteria>('startDateDesc');
    const [daySchoolSortCriteria, setDaySchoolSortCriteria] = useState<DaySchoolSortCriteria>('status');
    const [daySchoolSortDirection, setDaySchoolSortDirection] = useState<'asc' | 'desc'>('desc');
    const [daySchoolKeywordFilter, setDaySchoolKeywordFilter] = useState<string | null>(null);
    const [daySchoolDifficultyFilter, setDaySchoolDifficultyFilter] = useState<string | null>(null);
    const [daySchoolTypeFilter, setDaySchoolTypeFilter] = useState<DaySchoolTypeFilter>('all');
    const [baseCodeCategoryFilter, setBaseCodeCategoryFilter] = useState<BaseCodeCategory | 'all'>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [popularKeywords, setPopularKeywords] = useState<string[]>([]);
    const [popularDaySchoolKeywords, setPopularDaySchoolKeywords] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const [isManualVisible, setIsManualVisible] = useState<boolean>(false);
    const [showDataLinksOnly, setShowDataLinksOnly] = useState<boolean>(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const moreMenuRef = useRef<HTMLDivElement>(null);
    const [semanticKeywords, setSemanticKeywords] = useState<string[]>([]);
    const [isFetchingSemanticKeywords, setIsFetchingSemanticKeywords] = useState<boolean>(false);
    const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
    const [aiTip, setAiTip] = useState<{title: string; content: string} | null>(null);
    const [isFetchingAiTip, setIsFetchingAiTip] = useState<boolean>(false);
    const [aiTipError, setAiTipError] = useState<string | null>(null);
    const [bannerText, setBannerText] = useState<BannerText | null>(null);
    const [isBannerVisible, setIsBannerVisible] = useState(true);
    const [isHeaderAndFilterVisible, setIsHeaderAndFilterVisible] = useState(true);
    const lastScrollY = useRef(0);
    const isInitialMount = useRef(true);
    const [isDetailFilterVisible, setIsDetailFilterVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Handle banner visibility (only shows at the very top)
            setIsBannerVisible(currentScrollY < 10);
            
            // Auto-hide header/filter logic
            if (currentScrollY < 10) {
                // Always show at the top
                setIsHeaderAndFilterVisible(true);
            } else if (currentScrollY > lastScrollY.current) {
                // Scrolling Down: Hide header
                setIsHeaderAndFilterVisible(false);
            } else {
                // Scrolling Up: Show header
                setIsHeaderAndFilterVisible(true);
            }
            
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.body.className = `theme-${theme}`;
        if (viewMode === 'dayschool' || viewMode === 'roadmap' || viewMode === 'basecode' || viewMode === 'competition_roadmap') {
            document.body.classList.add('dayschool-active');
        } else {
            document.body.classList.remove('dayschool-active');
        }
        localStorage.setItem('daconTheme', theme);
    }, [theme, viewMode]);

    useEffect(() => {
        const fetchBannerText = async () => {
            try {
                const prompt = `You are a creative marketing copywriter for 'Dacon', a Korean AI and data science education platform. Generate a compelling banner text to attract users to our learning content. The banner has two parts: a main headline ('tagLine1') and a supporting slogan ('slogan'). The tagline should be short, catchy, and inspiring (around 2-5 Korean words). The slogan should be a bit more descriptive, highlighting the value of learning (around 5-10 Korean words). The response must be in Korean.`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                tagLine1: {
                                    type: Type.STRING,
                                    description: '메인 헤드라인 문구'
                                },
                                slogan: {
                                    type: Type.STRING,
                                    description: '부가적인 슬로건 문구'
                                },
                            },
                            required: ["tagLine1", "slogan"],
                        },
                    },
                });

                const jsonString = response.text.trim();
                const generatedText = JSON.parse(jsonString);

                if (generatedText.tagLine1 && generatedText.slogan) {
                    setBannerText({
                        tagLine1: generatedText.tagLine1,
                        tagLine2: "58% 특별할인", // Keep this as requested
                        slogan: generatedText.slogan,
                    });
                } else {
                    throw new Error("Invalid response format from Gemini");
                }

            } catch (error) {
                console.error("Failed to fetch banner text from Gemini:", error);
                // Fallback to the first static banner text if API fails
                setBannerText(staticBannerTexts[0]);
            }
        };

        fetchBannerText();
    }, []);

    const addToast = useCallback((message: string) => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [compResponse, dsResponse] = await Promise.all([
                fetch('https://app.dacon.io/api/v1/competition/list?offset=0&range=10000'),
                fetch('https://dev-app.dacon.io/api/v2/edu/getAllMainList')
            ]);

            // Competitions
            let combinedCompetitions: Competition[] = [];
            if (compResponse.ok) {
                const result = await compResponse.json();
                const apiCompetitions: Competition[] = (result.status === 1 && Array.isArray(result.data)) ? result.data : [];
                combinedCompetitions = [...apiCompetitions];
                const existingIds = new Set(apiCompetitions.map(c => c.cpt_id));
                staticCompetitions.forEach(staticComp => {
                    if (!existingIds.has(staticComp.cpt_id)) {
                        combinedCompetitions.push(staticComp);
                    }
                });
            } else {
                console.warn(`Competition API call failed with status: ${compResponse.status}, using fallback data.`);
                combinedCompetitions = staticCompetitions;
            }

            const keywordCounts: { [key: string]: number } = {};
            combinedCompetitions.forEach(c => c.keyword?.split('|').forEach(k => {
                const trimmed = k.trim();
                if (trimmed) keywordCounts[trimmed] = (keywordCounts[trimmed] || 0) + 1;
            }));
            const sortedKeywords = Object.entries(keywordCounts).sort(([, a], [, b]) => b - a).map(([k]) => k).slice(0, 10);
            
            setAllCompetitions(combinedCompetitions);
            setPopularKeywords(sortedKeywords);


            // DaySchool, Hackathons, and Ranker Lectures
            let allLearningContent: DaySchoolCourse[] = [];
            let dsSuccess = false;
            if (dsResponse.ok) {
                const dsResult = await dsResponse.json();
                dsSuccess = true;
                
                // 1. Process 'projects' (Courses)
                if (dsResult.projects && Array.isArray(dsResult.projects.list)) {
                    allLearningContent = allLearningContent.concat(dsResult.projects.list.map((item: any): DaySchoolCourse => ({
                        project_id: parseInt(item.project_id, 10),
                        title: item.title.replace(/🎪$/, '').trim(),
                        summary_img_object_key: item.summary_img_object_key,
                        difficulty: item.difficulty,
                        status: item.status,
                        stage_count: item.stage_count,
                        updated_at: item.updated_at,
                        created_at: item.created_at,
                        duration_in_minutes: item.duration_in_minutes,
                        tags: item.tags || [],
                        participant_count: item.participant_count,
                        link: `https://dacon.io/edu/${item.project_id}`,
                        type: 'course',
                    })));
                }

                // 2. Process 'hackathons'
                if (dsResult.hackathons && Array.isArray(dsResult.hackathons.list)) {
                    allLearningContent = allLearningContent.concat(dsResult.hackathons.list.map((item: any): DaySchoolCourse => {
                        const isOngoing = new Date() <= new Date(item.period_end);
                        return {
                            project_id: parseInt(item.cpt_id, 10),
                            title: item.title,
                            summary_img_object_key: '',
                            difficulty: '중급', status: isOngoing ? 'OPEN' : 'ENDED', stage_count: '1',
                            updated_at: item.period_end, created_at: item.period_start, duration_in_minutes: '120',
                            tags: item.keyword ? item.keyword.split('|').map((k: string) => ({ tag_title: k.trim() })).filter(Boolean) : [],
                            participant_count: item.participant_count || 0,
                            link: `https://dacon.io/competitions/official/${item.cpt_id}/overview/description`,
                            type: 'hackathon',
                        };
                    }));
                }

                // 3. Process 'rankerVideos' (Lectures)
                if (dsResult.rankerVideos && Array.isArray(dsResult.rankerVideos.list)) {
                    allLearningContent = allLearningContent.concat(dsResult.rankerVideos.list.map((item: any): DaySchoolCourse => ({
                        project_id: parseInt(item.tb_id, 10),
                        title: item.title,
                        summary_img_object_key: item.thumbnail_url || '',
                        difficulty: '고급', status: 'OPEN', stage_count: '1',
                        updated_at: item.created_at, created_at: item.created_at, duration_in_minutes: '60',
                        tags: [{ tag_title: '랭커특강' }], participant_count: 0,
                        link: `https://dacon.io/forum/${item.tb_id}`,
                        type: 'lecture',
                    })));
                }
            }

            if (!dsSuccess || allLearningContent.length === 0) {
                 if (!dsSuccess) console.warn('DaySchool content API call failed, using fallback data.');
                 const fallbackData = [...daySchoolCourses, ...rankerLectures];
                 allLearningContent = fallbackData.map(course => {
                    const hasTags = course.tags && course.tags.length > 0;
                    if (hasTags) return course;

                    const titleLower = course.title.toLowerCase();
                    const keywordsInTitle = ['python', 'llm', 'langchain', 'rag', 'cnn', 'lstm', '파이썬', '딥러닝', '머신러닝'];
                    const newTags = keywordsInTitle
                        .filter(kw => titleLower.includes(kw))
                        .map(kw => ({ tag_title: kw }));

                    return { ...course, tags: newTags.length > 0 ? newTags : course.tags };
                });
            }
            
            // Calculate popular keywords right after fetching data
            const predefinedKeywords = ['파이썬', '딥러닝', '머신러닝', 'AI', '데이터', 'LangChain', 'RAG', 'LLM', 'CNN', 'LSTM', '회귀', '분류', '시각화', '챗봇', '프로젝트'];
            const dsKeywordCounts: { [key: string]: number } = {};
            allLearningContent.forEach(course => {
                const contentText = (course.title + ' ' + course.tags.map(t => t.tag_title).join(' ')).toLowerCase();
                predefinedKeywords.forEach(k => {
                    if (contentText.includes(k.toLowerCase())) {
                        dsKeywordCounts[k] = (dsKeywordCounts[k] || 0) + 1;
                    }
                });
            });
            const sortedDsKeywords = Object.entries(dsKeywordCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 15)
                .map(([k]) => k);
            
            // Set both states together for a single render
            setAllDaySchoolContent(allLearningContent);
            setPopularDaySchoolKeywords(sortedDsKeywords);

        } catch (err: any) {
            console.error('Fetching data failed:', err);
            setAllCompetitions(staticCompetitions);
            const fallbackData = [...daySchoolCourses, ...rankerLectures];
            setAllDaySchoolContent(fallbackData);
            setError(err.message + ' (API 호출에 실패하여 일부 데이터만 표시될 수 있습니다.)');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchTickerStats = useCallback(async () => {
        try {
            const response = await fetch('https://app.dacon.io/api/v1/main/cpt-stats');
            if (!response.ok) throw new Error('Ticker API call failed');
            const result = await response.json();
            if (result && result.length > 0) {
                const stats = result[0];
                const formatPrize = (amountInManWon: number): string => {
                    const amount = amountInManWon * 10000;
                    if (amount >= 100000000) return `${Math.round((amount / 100000000) * 10) / 10}억원`;
                    return `${Math.round(amount / 10000).toLocaleString()}만원`;
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
    
    const fetchDaySchoolTickerStats = useCallback(async () => {
        try {
            const response = await fetch('https://app.dacon.io/api/v2/edu/main');
            if (!response.ok) throw new Error('DaySchool Ticker API call failed');
            setDaySchoolTickerStats(await response.json());
        } catch (err) {
            console.error('Fetching DaySchool ticker stats failed:', err);
            setDaySchoolTickerStats(null);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
        fetchTickerStats();
        fetchDaySchoolTickerStats();
        const intervalId = setInterval(() => {
            fetchAllData();
            fetchTickerStats();
            fetchDaySchoolTickerStats();
        }, 3600000); // 1 hour
        return () => clearInterval(intervalId);
    }, [fetchAllData, fetchTickerStats, fetchDaySchoolTickerStats]);

    useEffect(() => {
        try {
            const storedSearches = localStorage.getItem('daconRecentSearches');
            if (storedSearches) {
                const parsedData = JSON.parse(storedSearches);
                // FIX: Explicitly cast parsedData to string[] to satisfy TypeScript compiler.
                if (isStringArray(parsedData)) setRecentSearches(parsedData as string[]);
            }
        } catch (error) { console.error("Failed to parse recent searches", error); }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => setKeywordFilter(inputValue), 300);
        return () => clearTimeout(handler);
    }, [inputValue]);

    useEffect(() => {
        const fetchSemanticKeywords = async () => {
            if (!keywordFilter || keywordFilter.trim().length < 2) {
                setSemanticKeywords([]);
                return;
            }
            setIsFetchingSemanticKeywords(true);
            try {
                const prompt = `You are a search enhancement AI for 'Dacon', a Korean data science competition platform. A user is searching for '${keywordFilter}'. Provide a comma-separated list of 5-7 highly relevant Korean and English keywords, synonyms, and related technical terms to broaden the search. Focus on terms common in AI/data science. Output ONLY the comma-separated list. For example, for '의료', return 'medical, health, 헬스케어, 진단, 병원, medical imaging'.`;

                const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: prompt,
                });

                const keywordsText = response.text.trim();
                if (keywordsText) {
                    const keywords = keywordsText.split(',').map(k => k.trim()).filter(Boolean);
                    setSemanticKeywords([...new Set(keywords)]);
                } else {
                    setSemanticKeywords([]);
                }
            } catch (error) {
                console.error("Semantic keyword generation failed:", error);
                setSemanticKeywords([]);
                addToast('AI 확장 검색에 실패했습니다.');
            } finally {
                setIsFetchingSemanticKeywords(false);
            }
        };

        fetchSemanticKeywords();
    }, [keywordFilter, addToast]);

    useEffect(() => {
        if (isInitialMount.current || !keywordFilter.trim()) return;
        const newSearches = [keywordFilter.trim(), ...recentSearches.filter(s => s.toLowerCase() !== keywordFilter.trim().toLowerCase())];
        const limitedSearches = newSearches.slice(0, MAX_RECENT_SEARCHES);
        setRecentSearches(limitedSearches);
        localStorage.setItem('daconRecentSearches', JSON.stringify(limitedSearches));
        addToast(`'${keywordFilter.trim()}'(으)로 검색합니다.`);
    }, [keywordFilter, addToast]); // remove recentSearches to avoid loop

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) setShowSuggestions(false);
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) setIsMoreMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const filteredCompetitions = useMemo(() => {
        const typeFilterKeywords: Record<Exclude<CompetitionTypeFilter, 'all'>, string[]> = {
            algorithm: ['알고리즘'], prompt: ['프롬프트'], service: ['서비스개발', '앱개발', '개발'], idea: ['아이디어']
        };
        let competitions = showDataLinksOnly ? staticCompetitions : allCompetitions;

        if (statusFilter !== 'all') {
            competitions = competitions.filter(comp => {
                const isActuallyOngoing = new Date() <= new Date(comp.period_end);
                if (statusFilter === 'ongoing') return isActuallyOngoing;
                if (statusFilter === 'ended') return !isActuallyOngoing && comp.practice !== 1;
                if (statusFilter === 'practice') return !isActuallyOngoing && comp.practice === 1;
                return true;
            });
        }
        
        if (typeFilter !== 'all') {
            competitions = competitions.filter(comp => 
                typeFilterKeywords[typeFilter].some(k => comp.name.toLowerCase().includes(k))
            );
        }

        const trimmedKeyword = keywordFilter.trim().toLowerCase();
        if (trimmedKeyword) {
            const allSearchTerms = [...new Set([trimmedKeyword, ...semanticKeywords.map(k => k.toLowerCase())])];
            competitions = competitions.filter(comp => {
                const compKeyword = comp.keyword || '';
                const compText = (comp.name + ' ' + compKeyword).toLowerCase();
                return allSearchTerms.some(term => compText.includes(term));
            });
        }

        return [...competitions].sort((a, b) => {
            // Primary sort: Ongoing competitions first
            const aIsOngoing = new Date() <= new Date(a.period_end);
            const bIsOngoing = new Date() <= new Date(b.period_end);
            if (aIsOngoing && !bIsOngoing) return -1;
            if (!aIsOngoing && bIsOngoing) return 1;

            // Secondary sort: Relevance to keyword if searching
            if (trimmedKeyword) {
                const aKeyword = a.keyword || '';
                const bKeyword = b.keyword || '';
                const aMatch = (a.name.toLowerCase() + aKeyword.toLowerCase()).includes(trimmedKeyword);
                const bMatch = (b.name.toLowerCase() + bKeyword.toLowerCase()).includes(trimmedKeyword);
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
            }
            
            // Tertiary sort: User-selected criteria
            switch (sortCriteria) {
                case 'endDateAsc':
                    return new Date(a.period_end).getTime() - new Date(b.period_end).getTime();
                case 'participantsDesc': return b.user_count - a.user_count;
                case 'prizeDesc': return parsePrizeMoney(b.prize_info) - parsePrizeMoney(a.prize_info);
                case 'startDateDesc': default: return new Date(b.period_start).getTime() - new Date(b.period_start).getTime();
            }
        });
    }, [allCompetitions, showDataLinksOnly, statusFilter, typeFilter, keywordFilter, semanticKeywords, sortCriteria]);

    const filteredDaySchoolCourses = useMemo(() => {
        let filtered = allDaySchoolContent;

        if (daySchoolTypeFilter !== 'all') {
            filtered = filtered.filter(c => c.type === daySchoolTypeFilter);
        }

        const mainKeyword = keywordFilter.trim().toLowerCase();
        const categoryKeyword = daySchoolKeywordFilter?.toLowerCase();

        if (mainKeyword || categoryKeyword) {
            const allSearchTerms = new Set<string>();
            if (mainKeyword) {
                allSearchTerms.add(mainKeyword);
                semanticKeywords.forEach(k => allSearchTerms.add(k.toLowerCase()));
            }
            if (categoryKeyword) {
                allSearchTerms.add(categoryKeyword);
            }

            filtered = filtered.filter(c => {
                const contentText = (c.title + ' ' + c.tags.map(t => t.tag_title).join(' ')).toLowerCase();
                return Array.from(allSearchTerms).some(term => contentText.includes(term));
            });
        }
        
        if (daySchoolDifficultyFilter) {
            filtered = filtered.filter(c => c.difficulty === daySchoolDifficultyFilter);
        }
        
        return [...filtered].sort((a, b) => {
            let comparison = 0;
            const direction = (daySchoolSortCriteria === 'titleAsc' || daySchoolSortCriteria === 'difficulty') ? 'asc' : daySchoolSortDirection;
            const multiplier = direction === 'asc' ? 1 : -1;

            switch (daySchoolSortCriteria) {
                 case 'difficulty': {
                    const difficultyOrder: { [key: string]: number } = { '초급': 1, '중급': 2, '고급': 3 };
                    comparison = (difficultyOrder[a.difficulty] || 99) - (difficultyOrder[b.difficulty] || 99);
                    break;
                }
                case 'duration_in_minutes':
                    comparison = Number(a.duration_in_minutes) - Number(b.duration_in_minutes);
                    break;
                case 'participant_count':
                    comparison = a.participant_count - b.participant_count;
                    break;
                case 'status':
                    if (a.status === 'NEW' && b.status !== 'NEW') return -1;
                    if (a.status !== 'NEW' && b.status === 'NEW') return 1;
                    return b.project_id - a.project_id;
                case 'titleAsc':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'idDesc': default:
                    comparison = b.project_id - a.project_id;
                    break;
            }
            return comparison * multiplier;
        });
    }, [allDaySchoolContent, keywordFilter, semanticKeywords, daySchoolKeywordFilter, daySchoolSortCriteria, daySchoolSortDirection, daySchoolDifficultyFilter, daySchoolTypeFilter]);
    
    const filteredBaseCode = useMemo(() => {
        let filtered = baseCodeData;
        if (baseCodeCategoryFilter !== 'all') {
            filtered = filtered.filter(item => item.category === baseCodeCategoryFilter);
        }

        const trimmedKeyword = keywordFilter.trim().toLowerCase();
        if (trimmedKeyword) {
            const allSearchTerms = [...new Set([trimmedKeyword, ...semanticKeywords.map(k => k.toLowerCase())])];
            filtered = filtered.filter(item => {
                const itemText = (item.title + ' ' + item.keywords.join(' ')).toLowerCase();
                return allSearchTerms.some(term => itemText.includes(term));
            });
        }
        return filtered;
    }, [keywordFilter, semanticKeywords, baseCodeCategoryFilter]);
    
    const fetchAiTip = useCallback(() => {
        setIsFetchingAiTip(true); setAiTipError(null); setAiTip(null);
        setTimeout(() => {
            setAiTip(staticAiTips[Math.floor(Math.random() * staticAiTips.length)]);
            setIsFetchingAiTip(false);
        }, 300);
    }, []);

    useEffect(() => {
        if (!isInitialMount.current) setCurrentPage(1);
    }, [keywordFilter, statusFilter, sortCriteria, viewMode, showDataLinksOnly, typeFilter, daySchoolSortCriteria, daySchoolKeywordFilter, daySchoolDifficultyFilter, daySchoolTypeFilter, baseCodeCategoryFilter, daySchoolSortDirection]);

    useEffect(() => {
        let title = '데이콘 AI 경진대회 대시보드';
        if (viewMode === 'dayschool') title = '학습 강좌 목록 | 데이콘';
        else if (viewMode === 'roadmap') title = 'AI 탐험가 로드맵 | 데이콘';
        else if (viewMode === 'basecode') title = '기초 코드 목록 | 데이콘';
        else if (viewMode === 'competition_roadmap') title = '대회 참가 방법 | 데이콘';
        else if (keywordFilter) title = `'${keywordFilter}' 검색 결과 | 데이콘`;
        document.title = title;
    }, [keywordFilter, statusFilter, viewMode]);
    
    useEffect(() => { isInitialMount.current = false; }, []);

    useEffect(() => {
        const noResults = (viewMode === 'list' && filteredCompetitions.length === 0) || (viewMode === 'dayschool' && filteredDaySchoolCourses.length === 0) || (viewMode === 'basecode' && filteredBaseCode.length === 0);
        // FIX: The `viewMode !== 'roadmap'` check was redundant because `noResults` is only true for 'list', 'dayschool', or 'basecode' views, which are never 'roadmap'. The compiler correctly identified this as an unintentional comparison.
        if (!isLoading && noResults) fetchAiTip();
    }, [isLoading, filteredCompetitions.length, filteredDaySchoolCourses.length, filteredBaseCode.length, viewMode, fetchAiTip]);

    const handleViewChange = useCallback((view: ViewMode, type: DaySchoolTypeFilter = 'all') => {
        if (view !== viewMode || (view === 'dayschool' && type !== daySchoolTypeFilter)) {
            setViewMode(view); setCurrentPage(1);
            if (view !== 'list') { setStatusFilter('all'); setTypeFilter('all'); setSortCriteria('startDateDesc'); }
            if (view !== 'dayschool') { setDaySchoolKeywordFilter(null); setDaySchoolDifficultyFilter(null); }
            if (view !== 'basecode') { setBaseCodeCategoryFilter('all'); }
            setDaySchoolTypeFilter(type);
            addToast(`${{list: '대회 목록', basecode: '기초 코드', dayschool: '학습 강좌', roadmap: '로드맵', competition_roadmap: '대회 참가 방법'}[view]} 보기로 전환합니다.`);
        }
    }, [viewMode, addToast, daySchoolTypeFilter]);

    const handleCompetitionNavClick = useCallback(() => {
        const wasChanged = viewMode !== 'list' || showDataLinksOnly;
        setViewMode('list');
        setShowDataLinksOnly(false);
        if (wasChanged) {
             addToast('전체 대회 목록 보기로 전환합니다.');
        }
        setCurrentPage(1);
    }, [viewMode, showDataLinksOnly, addToast]);

    const handleDataLinksToggle = useCallback(() => {
        if (viewMode !== 'list') {
            setViewMode('list');
            setShowDataLinksOnly(true);
            addToast('데이터 다운로드 가능 대회만 표시합니다.');
        } else {
            setShowDataLinksOnly(prev => {
                const newValue = !prev;
                addToast(newValue ? '데이터 다운로드 가능 대회만 표시합니다.' : '전체 대회 목록을 표시합니다.');
                return newValue;
            });
        }
        setCurrentPage(1);
    }, [viewMode, addToast]);

    const handleStatusClick = useCallback((status: StatusFilter) => {
        setStatusFilter(status); window.scrollTo({ top: 0, behavior: 'smooth' });
        addToast(`상태 필터: ${{all: '전체', ongoing: '진행중', ended: '종료', practice: '연습'}[status]}`);
    }, [addToast]);
    
    const handleTypeClick = useCallback((type: CompetitionTypeFilter) => {
        setTypeFilter(type); window.scrollTo({ top: 0, behavior: 'smooth' });
        addToast(`유형 필터: ${{all: '전체', algorithm: '알고리즘', prompt: '프롬프트', service: '개발', idea: '아이디어'}[type]}`);
    }, [addToast]);

    const handleSortChange = useCallback((criteria: SortCriteria) => {
        setSortCriteria(criteria);
        addToast(`정렬 기준: ${{startDateDesc: '최신순', endDateAsc: '마감 임박순', participantsDesc: '참가자 많은 순', prizeDesc: '상금순'}[criteria]}`);
    }, [addToast]);

    const handleDaySchoolSortChange = useCallback((criteria: DaySchoolSortCriteria) => {
        setDaySchoolSortCriteria(currentCrit => {
            if (currentCrit === criteria) {
                setDaySchoolSortDirection(currentDir => currentDir === 'desc' ? 'asc' : 'desc');
            } else {
                setDaySchoolSortDirection(criteria === 'titleAsc' || criteria === 'difficulty' ? 'asc' : 'desc');
            }
            return criteria;
        });
        const criteriaMap: Record<DaySchoolSortCriteria, string> = {
            status: '신규순', idDesc: '최신순', titleAsc: '제목순',
            difficulty: '난이도순', duration_in_minutes: '학습 시간순', participant_count: '참여 인원순'
        };
        addToast(`정렬 기준: ${criteriaMap[criteria]}`);
    }, [addToast]);

    const handleDaySchoolKeywordClick = useCallback((keyword: string | null) => {
        setDaySchoolKeywordFilter(keyword); window.scrollTo({ top: 0, behavior: 'smooth' });
        addToast(keyword ? `키워드 필터: #${keyword}` : '키워드 필터를 초기화했습니다.');
    }, [addToast]);
    
    const handleDaySchoolDifficultyClick = useCallback((difficulty: string) => {
        const newDifficulty = daySchoolDifficultyFilter === difficulty ? null : difficulty;
        setDaySchoolDifficultyFilter(newDifficulty); window.scrollTo({ top: 0, behavior: 'smooth' });
        addToast(newDifficulty ? `난이도 필터: ${newDifficulty}` : '난이도 필터를 초기화했습니다.');
    }, [addToast, daySchoolDifficultyFilter]);

     const handleDaySchoolTypeChange = useCallback((type: DaySchoolTypeFilter) => {
        setDaySchoolTypeFilter(type); window.scrollTo({ top: 0, behavior: 'smooth' });
        addToast(`종류 필터: ${{all: '전체', course: '강좌', hackathon: '해커톤', lecture: '랭커특강'}[type]}`);
    }, [addToast]);

    const handleBaseCodeCategoryChange = useCallback((category: BaseCodeCategory | 'all') => {
        setBaseCodeCategoryFilter(category); window.scrollTo({ top: 0, behavior: 'smooth' });
        addToast(category === 'all' ? '모든 코드 카테고리 표시' : `${category} 카테고리 필터 적용`);
    }, [addToast]);

    const handleKeywordClick = useCallback((keyword: string) => { setInputValue(keyword); window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
    const handleSortClick = useCallback((criteria: SortCriteria) => { setSortCriteria(criteria); window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

    const handleReset = useCallback(() => {
        setInputValue(''); setKeywordFilter(''); setStatusFilter('all'); setTypeFilter('all'); setSortCriteria('startDateDesc');
        setShowDataLinksOnly(false); setCurrentPage(1); setDaySchoolSortCriteria('status'); setDaySchoolKeywordFilter(null); setDaySchoolDifficultyFilter(null);
        setDaySchoolTypeFilter('all'); setBaseCodeCategoryFilter('all'); setDaySchoolSortDirection('desc');
        if (viewMode !== 'list') setViewMode('list');
        addToast('모든 필터를 초기화했습니다.');
    }, [viewMode, addToast]);
    
    const hasActiveFilters = useMemo(() => {
        return !!keywordFilter.trim() || statusFilter !== 'all' || typeFilter !== 'all' || showDataLinksOnly;
    }, [keywordFilter, statusFilter, typeFilter, showDataLinksOnly]);

    const paginatedCompetitions = useMemo(() => {
        if (hasActiveFilters) {
            // Standard pagination when any filter is active
            const offset = (currentPage - 1) * ITEMS_PER_PAGE;
            return filteredCompetitions.slice(offset, offset + ITEMS_PER_PAGE);
        }
        
        // Special pagination for default view with special cards
        const itemsOnFirstPage = ITEMS_PER_PAGE - 2; // Two special cards
        if (currentPage === 1) {
            return filteredCompetitions.slice(0, itemsOnFirstPage);
        }
        const offset = itemsOnFirstPage + (currentPage - 2) * ITEMS_PER_PAGE;
        return filteredCompetitions.slice(offset, offset + ITEMS_PER_PAGE);
    }, [filteredCompetitions, currentPage, hasActiveFilters]);

     const paginatedDaySchoolCourses = useMemo(() => {
        const itemsOnFirstPage = ITEMS_PER_PAGE_DAYSCHOOL - 2;
        if (currentPage === 1) return filteredDaySchoolCourses.slice(0, itemsOnFirstPage);
        const offset = itemsOnFirstPage + (currentPage - 2) * ITEMS_PER_PAGE_DAYSCHOOL;
        return filteredDaySchoolCourses.slice(offset, offset + ITEMS_PER_PAGE_DAYSCHOOL);
    }, [filteredDaySchoolCourses, currentPage]);

    const paginatedBaseCode = useMemo(() => {
        const offset = (currentPage - 1) * ITEMS_PER_PAGE_BASECODE;
        return filteredBaseCode.slice(offset, offset + ITEMS_PER_PAGE_BASECODE);
    }, [filteredBaseCode, currentPage]);

    const paginationTotalItems = useMemo(() => {
        if (viewMode === 'dayschool') {
            return filteredDaySchoolCourses.length > 0 ? filteredDaySchoolCourses.length + 2 : 0;
        }
        if (viewMode === 'basecode') {
            return filteredBaseCode.length;
        }
        // This is for viewMode === 'list'
        if (hasActiveFilters) {
            return filteredCompetitions.length;
        }
        // Two special cards on the first page
        return filteredCompetitions.length > 0 ? filteredCompetitions.length + 2 : 0;
    }, [filteredCompetitions.length, filteredDaySchoolCourses.length, filteredBaseCode.length, viewMode, hasActiveFilters]);
    
    const handleToggleManual = useCallback(() => setIsManualVisible(p => !p), []);

    const suggestions = useMemo(() => {
        if (!inputValue) {
            const popularToShow = popularKeywords.filter(pk => !recentSearches.some(rs => rs.toLowerCase() === pk.toLowerCase()));
            return { recent: recentSearches, popular: popularToShow };
        }
        const combined = [...new Set([...recentSearches, ...popularKeywords])];
        return { filtered: combined.filter(s => s.toLowerCase().includes(inputValue.toLowerCase()) && s.toLowerCase() !== inputValue.toLowerCase()) };
    }, [inputValue, recentSearches, popularKeywords]);

    const tickerItems = useMemo(() => {
        if (viewMode === 'dayschool' || viewMode === 'roadmap' || viewMode === 'basecode' || viewMode === 'competition_roadmap') {
            if (!daySchoolTickerStats) return null;
            return [`총 ${daySchoolTickerStats.participants.toLocaleString()}명 참여`, `${daySchoolTickerStats.lesson_count}개 레슨`, `${daySchoolTickerStats.contents_count}개 콘텐츠`, '데이터로 꿈을 현실로!'];
        }
        if (!tickerStats) return null;
        return [`총 ${tickerStats.totalCount}개 대회`, `진행중 ${tickerStats.ongoingCount}개`, `총 상금 약 ${tickerStats.totalPrize}`, `총 참가자 ${tickerStats.totalParticipants}명`];
    }, [viewMode, tickerStats, daySchoolTickerStats]);

    const isGlass = theme === 'glass';
    const isNeumorphic = theme === 'neumorphic';

    const getNavButtonClasses = (buttonView: '대회' | '데이터' | '코드' | '학습' | '강좌' | '해커톤' | '랭커특강' | '로드맵' | '참가 방법') => {
        let isSpecificallyActive = false;
        
        switch (buttonView) {
            case '대회':
                isSpecificallyActive = (viewMode === 'list' && !showDataLinksOnly) || viewMode === 'competition_roadmap' || viewMode === 'basecode';
                break;
            case '데이터':
                isSpecificallyActive = viewMode === 'list' && showDataLinksOnly;
                break;
            case '코드':
                isSpecificallyActive = viewMode === 'basecode';
                break;
            case '참가 방법':
                isSpecificallyActive = viewMode === 'competition_roadmap';
                break;
            case '학습':
                isSpecificallyActive = viewMode === 'dayschool' || viewMode === 'roadmap';
                break;
            case '강좌':
                isSpecificallyActive = viewMode === 'dayschool' && daySchoolTypeFilter === 'course';
                break;
            case '해커톤':
                isSpecificallyActive = viewMode === 'dayschool' && daySchoolTypeFilter === 'hackathon';
                break;
            case '랭커특강':
                 isSpecificallyActive = viewMode === 'dayschool' && daySchoolTypeFilter === 'lecture';
                break;
            case '로드맵':
                isSpecificallyActive = viewMode === 'roadmap';
                break;
        }

        const base = `px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all duration-300 transform flex items-center gap-2`;
        const webtoonBase = `px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-bold rounded-md transition-all duration-200 border-2 border-black`;

        const isLearningButton = ['학습', '강좌', '해커톤', '랭커특강', '로드맵'].includes(buttonView);
        const activeLearningColor = 'bg-[rgb(253,224,72,0.73)]';

        if (isLearningButton) {
            if (isGlass) {
                return `${base} border ${isSpecificallyActive ? `${activeLearningColor} text-black font-bold border-yellow-400 shadow-[0_0_8px_rgba(253,224,72,0.6)]` : 'bg-slate-800/40 text-slate-200 border-slate-700 hover:bg-slate-700/50 hover:border-yellow-500/50'}`;
            }
            if (isNeumorphic) {
                return `${base} ${isSpecificallyActive ? `shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-black ${activeLearningColor}` : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-gray-700 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1'}`;
            }
            return `${webtoonBase} ${isSpecificallyActive ? `${activeLearningColor} text-black shadow-[3px_3px_0_#000]` : 'bg-white text-black hover:bg-gray-100'}`;
        }
        
        if (isGlass) {
            return `${base} border ${isSpecificallyActive ? 'bg-sky-500/60 text-white border-sky-400' : 'bg-slate-800/40 text-slate-200 border-slate-700 hover:bg-slate-700/50 hover:border-sky-500/50'}`;
        }
        if (isNeumorphic) {
            return `${base} ${isSpecificallyActive ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-blue-600' : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-gray-700 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1'}`;
        }
        return `${webtoonBase} ${isSpecificallyActive ? 'bg-blue-500 text-white shadow-[3px_3px_0_#000]' : 'bg-white text-black hover:bg-gray-100'}`;
    };

    const getFilterButtonClasses = (isActive: boolean, disabled = false) => {
        const base = `px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all duration-300 transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`;

        if (isGlass) {
            return `${base} border ${isActive ? 'bg-sky-500/60 text-white border-sky-400/80 shadow-[0_0_8px_rgba(14,165,233,0.6)]' : 'bg-slate-800/50 text-slate-200 border-slate-700 hover:bg-slate-700/60 hover:border-sky-500/50'} disabled:bg-slate-800/20 disabled:border-slate-700/30 disabled:hover:bg-slate-800/20`;
        }
        if (isNeumorphic) {
            return `${base} ${isActive ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-blue-600' : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-gray-700 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1'} disabled:shadow-none disabled:hover:shadow-none disabled:hover:-translate-y-0 disabled:text-gray-400`;
        }
        return `px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-bold rounded-md transition-all duration-200 border-2 border-black flex items-center gap-2 ${isActive ? 'bg-blue-500 text-white shadow-[3px_3px_0_#000]' : 'bg-white text-black hover:bg-gray-100'} disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:hover:bg-gray-200`;
    };
    
    const isSearchInputVisible = true;
    const isCompetitionSortVisible = viewMode === 'list';

    const mainPaddingClass = useMemo(() => {
        if (isBannerVisible) return 'pt-[218px]'; // Banner + Nav + Ticker
        if (isHeaderAndFilterVisible) return 'pt-[144px]'; // Nav + Ticker
        return 'pt-[64px]'; // Nav only
    }, [isBannerVisible, isHeaderAndFilterVisible]);

    const filterSectionTopClass = useMemo(() => {
        if (isBannerVisible) return 'top-[218px]'; // Match full header height at top
        if (isHeaderAndFilterVisible) return 'top-[144px]'; // Stick below Nav + Ticker
        return 'top-[64px]'; // Stick below Nav only
    }, [isBannerVisible, isHeaderAndFilterVisible]);

    return (
        <>
            <div aria-live="polite" aria-atomic="true" className="fixed top-20 right-4 z-[100] space-y-2">
                {toasts.map(t => <Toast key={t.id} {...t} onClose={removeToast} theme={theme} />)}
            </div>
            <Header 
                bannerText={bannerText}
                tickerItems={tickerItems} 
                theme={theme} 
                setTheme={setTheme} 
                onCompetitionClick={handleCompetitionNavClick}
                onLearningClick={() => handleViewChange('dayschool')}
                isBannerVisible={isBannerVisible}
                isHeaderContentVisible={isHeaderAndFilterVisible}
            />
            <main className={`transition-all duration-300 ${mainPaddingClass}`}>
                <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12">
                     <section aria-labelledby="filter-heading" className={`sticky ${filterSectionTopClass} z-30 mb-8 p-4 rounded-2xl flex flex-col gap-4 transition-transform duration-300 ${isHeaderAndFilterVisible ? 'translate-y-0' : '-translate-y-full'} ${
                        isGlass ? 'bg-slate-900/75 backdrop-blur-md border border-slate-700' :
                        isNeumorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff]' :
                        'bg-white border-2 border-black'
                    }`}>
                        <h1 id="filter-heading" className="sr-only">데이콘 콘텐츠 검색 및 필터</h1>
                        
                        {isSearchInputVisible && (
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div ref={searchContainerRef} className="relative w-full md:flex-1">
                                    <input
                                        type="text"
                                        placeholder="키워드로 전체 콘텐츠 검색 (대회, 강좌, 코드)"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onFocus={() => setShowSuggestions(true)}
                                        className={`w-full pl-4 pr-24 py-3 rounded-lg focus:outline-none text-sm sm:text-base ${
                                            isGlass ? 'bg-slate-900/70 border border-slate-600/50 focus:ring-2 focus:ring-sky-400 text-slate-100' :
                                            isNeumorphic ? 'bg-[#e0e5ec] shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff]' :
                                            'bg-white border-2 border-black focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                        }`}
                                        aria-label="Filter content by keyword"
                                        autoComplete="off"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                                        {isFetchingSemanticKeywords && (
                                            <div role="status">
                                                <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${isGlass ? 'border-sky-300' : 'border-blue-500'}`}></div>
                                                <span className="sr-only">AI가 연관 검색어 찾는 중...</span>
                                            </div>
                                        )}
                                        {inputValue && !isFetchingSemanticKeywords && (
                                            <button
                                                onClick={() => setInputValue('')}
                                                className={`p-1 rounded-full transition-colors duration-200 ${isGlass ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                                                aria-label="검색어 지우기"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    {showSuggestions && (
                                        (suggestions.recent && suggestions.recent.length > 0) ||
                                        (suggestions.popular && suggestions.popular.length > 0) ||
                                        (suggestions.filtered && suggestions.filtered.length > 0)
                                    ) && (
                                        <div className={`absolute top-full left-0 w-full mt-2 rounded-2xl z-50 p-2 max-h-60 overflow-y-auto ${
                                            isGlass ? 'bg-slate-800/95 backdrop-blur-lg border border-slate-600' :
                                            isNeumorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff]' :
                                            'bg-white border-2 border-black shadow-[4px_4px_0_#000]'
                                        }`}>
                                            {!inputValue ? (
                                                <>
                                                    {suggestions.recent && suggestions.recent.length > 0 && (
                                                        <div>
                                                            <h4 className={`px-2 pt-1 pb-2 text-xs font-bold ${isGlass ? 'text-slate-400' : 'text-gray-500'}`}>최근 검색어</h4>
                                                            <ul role="listbox">
                                                                {suggestions.recent.map((search, index) => (
                                                                    <li key={`recent-${index}`} onClick={() => { setInputValue(search); setShowSuggestions(false); }} className={`p-2 text-sm rounded-lg cursor-pointer ${isGlass ? 'text-slate-300 hover:bg-sky-500/20' : 'text-gray-600 hover:bg-white/50'}`} role="option" aria-selected="false">{search}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {suggestions.popular && suggestions.popular.length > 0 && (
                                                        <div className={suggestions.recent && suggestions.recent.length > 0 ? 'mt-2' : ''}>
                                                            <h4 className={`px-2 pt-1 pb-2 text-xs font-bold ${isGlass ? 'text-slate-400' : 'text-gray-500'}`}>인기 키워드</h4>
                                                            <ul role="listbox">
                                                                {suggestions.popular.map((search, index) => (
                                                                    <li key={`popular-${index}`} onClick={() => { setInputValue(search); setShowSuggestions(false); }} className={`p-2 text-sm rounded-lg cursor-pointer ${isGlass ? 'text-slate-300 hover:bg-sky-500/20' : 'text-gray-600 hover:bg-white/50'}`} role="option" aria-selected="false">{search}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                suggestions.filtered && suggestions.filtered.length > 0 && (
                                                    <ul role="listbox">
                                                        {suggestions.filtered.map((search, index) => (
                                                            <li key={`filtered-${index}`} onClick={() => { setInputValue(search); setShowSuggestions(false); }} className={`p-2 text-sm rounded-lg cursor-pointer ${isGlass ? 'text-slate-300 hover:bg-sky-500/20' : 'text-gray-600 hover:bg-white/50'}`} role="option" aria-selected="false">{search}</li>
                                                        ))}
                                                    </ul>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                                {isCompetitionSortVisible && (
                                    <div className="relative w-full md:w-auto hidden md:block">
                                        <select
                                            id="sort-select"
                                            value={sortCriteria}
                                            onChange={(e) => handleSortChange(e.target.value as SortCriteria)}
                                            className={`w-full appearance-none pl-4 pr-10 py-3 rounded-lg focus:outline-none text-sm sm:text-base cursor-pointer ${
                                                isGlass ? 'bg-slate-900/70 border border-slate-600/50 focus:ring-2 focus:ring-sky-400 text-slate-100' :
                                                isNeumorphic ? 'bg-[#e0e5ec] shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff]' :
                                                'bg-white border-2 border-black focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                            }`}
                                            aria-label="Sort competitions"
                                        >
                                            <option value="startDateDesc">최신순</option>
                                            <option value="endDateAsc">마감 임박순</option>
                                            <option value="participantsDesc">참가자 많은 순</option>
                                            <option value="prizeDesc">상금순</option>
                                        </select>
                                        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ${isGlass ? 'text-slate-400' : 'text-gray-500'}`}>
                                            <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={`relative ${isSearchInputVisible ? `pt-4 border-t ${isGlass ? 'border-slate-700/50' : isNeumorphic ? 'border-gray-300/50' : 'border-black'}` : ''}`}>
                             <div className="flex items-center justify-between gap-x-4">
                                <div className="flex-1 overflow-x-auto custom-scrollbar">
                                    <div className="inline-flex items-center gap-x-4 md:gap-x-6 gap-y-2 whitespace-nowrap md:flex-wrap md:whitespace-normal pb-2">
                                        {/* Competition Group */}
                                        <div className="inline-flex items-center gap-2">
                                            <button onClick={handleCompetitionNavClick} className={getNavButtonClasses('대회')}>대회</button>
                                            <button onClick={handleDataLinksToggle} className={`${getNavButtonClasses('데이터')} hidden md:flex`}>데이터</button>
                                            <button onClick={() => handleViewChange('basecode')} className={`${getNavButtonClasses('코드')} hidden md:flex`}>코드</button>
                                            <button onClick={() => handleViewChange('competition_roadmap')} className={getNavButtonClasses('참가 방법')}>참가 방법</button>
                                        </div>
                                        
                                        <div className={`h-5 w-px ${isGlass ? 'bg-slate-700' : 'bg-gray-300'} md:hidden`}></div>

                                        {/* Learning Group */}
                                        <div className="inline-flex items-center gap-2">
                                            <button onClick={() => handleViewChange('dayschool', 'all')} className={getNavButtonClasses('학습')}>학습</button>
                                            <button onClick={() => handleViewChange('dayschool', 'course')} className={`${getNavButtonClasses('강좌')} hidden md:flex`}>강좌</button>
                                            <button onClick={() => handleViewChange('dayschool', 'hackathon')} className={`${getNavButtonClasses('해커톤')} hidden md:flex`}>해커톤</button>
                                            <button onClick={() => handleViewChange('dayschool', 'lecture')} className={`${getNavButtonClasses('랭커특강')} hidden md:flex`}>랭커특강</button>
                                            <button onClick={() => handleViewChange('roadmap')} className={getNavButtonClasses('로드맵')}>로드맵</button>
                                        </div>
                                    </div>
                                </div>
                                {viewMode === 'list' && (
                                    <div className="ml-2 flex-shrink-0 hidden md:block">
                                        <button 
                                            onClick={() => setIsDetailFilterVisible(prev => !prev)}
                                            className={`${getFilterButtonClasses(isDetailFilterVisible)} w-[133px] h-[35.5px] justify-center`}
                                            aria-expanded={isDetailFilterVisible}
                                            aria-controls="detail-filters"
                                            title={isDetailFilterVisible ? '상세 필터 숨기기' : '상세 필터 보기'}
                                        >
                                            <span>상세필터</span>
                                            {isDetailFilterVisible ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {viewMode === 'list' && isDetailFilterVisible && (
                            <div id="detail-filters" className={`hidden md:block pt-4 border-t ${isGlass ? 'border-slate-700/50' : isNeumorphic ? 'border-gray-300/50' : 'border-black'}`}>
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-sm font-semibold mr-2 ${isGlass ? 'text-slate-300' : isNeumorphic ? 'text-gray-600' : 'text-black'}`}>상태:</span>
                                            {(['all', 'ongoing', 'ended', 'practice'] as StatusFilter[]).map(s => (
                                                <button key={s} onClick={() => handleStatusClick(s)} className={`${getFilterButtonClasses(statusFilter === s)} w-[74.35px] justify-center`} aria-pressed={statusFilter === s}>{ {all: '전체', ongoing: '진행중', ended: '종료', practice: '연습'}[s] }</button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-sm font-semibold mr-2 ${isGlass ? 'text-slate-300' : isNeumorphic ? 'text-gray-600' : 'text-black'}`}>유형:</span>
                                            {(['all', 'algorithm', 'prompt', 'service', 'idea'] as CompetitionTypeFilter[]).map(t => (
                                                <button key={t} onClick={() => handleTypeClick(t)} className={getFilterButtonClasses(typeFilter === t)} aria-pressed={typeFilter === t}>{ {all: '전체', algorithm: '알고리즘', prompt: '프롬프트', service: '개발', idea: '아이디어'}[t] }</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center gap-2 flex-wrap">
                                        <button onClick={handleReset} className={getFilterButtonClasses(false)}>초기화</button>
                                        <button onClick={handleToggleManual} className={getFilterButtonClasses(isManualVisible)}>매뉴얼</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                    
                    {isManualVisible && <ManualModal isOpen={isManualVisible} onClose={handleToggleManual} theme={theme} />}

                    {isLoading && !allCompetitions.length && <LoadingSpinner theme={theme} />}
                    {error && <ErrorMessage message={error} theme={theme} />}
                    {!error && (
                         <section aria-labelledby="results-heading" className={isFetchingSemanticKeywords ? 'ai-searching' : ''}>
                            <h2 id="results-heading" className="sr-only">콘텐츠 목록 결과</h2>
                            {viewMode === 'list' && (
                                <CompetitionListView
                                    filteredCompetitions={filteredCompetitions}
                                    paginatedCompetitions={paginatedCompetitions}
                                    currentPage={currentPage}
                                    paginationTotalItems={paginationTotalItems}
                                    hasActiveFilters={hasActiveFilters}
                                    theme={theme}
                                    showDataLinksOnly={showDataLinksOnly}
                                    isLoading={isLoading}
                                    aiTip={aiTip}
                                    isFetchingAiTip={isFetchingAiTip}
                                    aiTipError={aiTipError}
                                    onStatusClick={handleStatusClick}
                                    onKeywordClick={handleKeywordClick}
                                    onSortClick={handleSortClick}
                                    onPageChange={setCurrentPage}
                                    onResetFilters={handleReset}
                                />
                            )}
                            {viewMode === 'dayschool' && (
                                <DaySchoolContentView
                                    filteredDaySchoolCourses={filteredDaySchoolCourses}
                                    paginatedDaySchoolCourses={paginatedDaySchoolCourses}
                                    theme={theme}
                                    popularDaySchoolKeywords={popularDaySchoolKeywords}
                                    daySchoolKeywordFilter={daySchoolKeywordFilter}
                                    handleDaySchoolKeywordClick={handleDaySchoolKeywordClick}
                                    daySchoolDifficultyFilter={daySchoolDifficultyFilter}
                                    handleDaySchoolDifficultyClick={handleDaySchoolDifficultyClick}
                                    currentPage={currentPage}
                                    daySchoolSortCriteria={daySchoolSortCriteria}
                                    daySchoolSortDirection={daySchoolSortDirection}
                                    handleDaySchoolSortChange={handleDaySchoolSortChange}
                                    daySchoolTypeFilter={daySchoolTypeFilter}
                                    handleDaySchoolTypeChange={handleDaySchoolTypeChange}
                                    paginationTotalItems={paginationTotalItems}
                                    onPageChange={setCurrentPage}
                                    isLoading={isLoading}
                                    onResetFilters={handleReset}
                                    aiTip={aiTip}
                                    isFetchingAiTip={isFetchingAiTip}
                                    aiTipError={aiTipError}
                                />
                            )}
                            {viewMode === 'basecode' && (
                                <BaseCodeContentView
                                    filteredBaseCode={filteredBaseCode}
                                    paginatedBaseCode={paginatedBaseCode}
                                    theme={theme}
                                    baseCodeCategoryFilter={baseCodeCategoryFilter}
                                    handleBaseCodeCategoryChange={handleBaseCodeCategoryChange}
                                    currentPage={currentPage}
                                    paginationTotalItems={paginationTotalItems}
                                    onPageChange={setCurrentPage}
                                    isLoading={isLoading}
                                    onResetFilters={handleReset}
                                    aiTip={aiTip}
                                    isFetchingAiTip={isFetchingAiTip}
                                    aiTipError={aiTipError}
                                />
                            )}
                            {viewMode === 'roadmap' && <RoadmapView theme={theme} />}
                            {viewMode === 'competition_roadmap' && <CompetitionRoadmapView theme={theme} />}
                        </section>
                    )}
                </div>
            </main>

            <Footer theme={theme} />
        </>
    );
};

export default App;
