
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
import { daconApi } from './services/daconApi';

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

    // FIX: Define handleToggleManual to fix "Cannot find name 'handleToggleManual'"
    const handleToggleManual = useCallback(() => {
        setIsManualVisible(prev => !prev);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsBannerVisible(currentScrollY < 10);
            if (currentScrollY < 10) {
                setIsHeaderAndFilterVisible(true);
            } else if (currentScrollY > lastScrollY.current) {
                setIsHeaderAndFilterVisible(false);
            } else {
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
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                tagLine1: { type: Type.STRING, description: '메인 헤드라인 문구' },
                                slogan: { type: Type.STRING, description: '부가적인 슬로건 문구' },
                            },
                            required: ["tagLine1", "slogan"],
                        },
                    },
                });
                const generatedText = JSON.parse(response.text.trim());
                if (generatedText.tagLine1 && generatedText.slogan) {
                    setBannerText({ tagLine1: generatedText.tagLine1, tagLine2: "58% 특별할인", slogan: generatedText.slogan });
                } else {
                    throw new Error("Invalid response format");
                }
            } catch (error) {
                console.error("Failed to fetch banner text:", error);
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
            const [result, dsResult] = await Promise.all([
                daconApi.getCompetitions(),
                daconApi.getEducationList()
            ]);

            // Competitions
            let combinedCompetitions: Competition[] = (result.status === 1 && Array.isArray(result.data)) ? result.data : [];
            const existingIds = new Set(combinedCompetitions.map(c => c.cpt_id));
            staticCompetitions.forEach(staticComp => {
                if (!existingIds.has(staticComp.cpt_id)) combinedCompetitions.push(staticComp);
            });

            const keywordCounts: { [key: string]: number } = {};
            combinedCompetitions.forEach(c => (c.keyword || '').split('|').forEach(k => {
                const trimmed = k.trim();
                if (trimmed) keywordCounts[trimmed] = (keywordCounts[trimmed] || 0) + 1;
            }));
            const sortedKeywords = Object.entries(keywordCounts).sort(([, a], [, b]) => b - a).map(([k]) => k).slice(0, 10);
            
            setAllCompetitions(combinedCompetitions);
            setPopularKeywords(sortedKeywords);

            // Education Content
            let allLearningContent: DaySchoolCourse[] = [];
            if (dsResult) {
                if (dsResult.projects && Array.isArray(dsResult.projects.list)) {
                    allLearningContent = allLearningContent.concat(dsResult.projects.list.map((item: any): DaySchoolCourse => ({
                        project_id: parseInt(item.project_id, 10),
                        title: item.title.replace(/🎪$/, '').trim(),
                        summary_img_object_key: item.summary_img_object_key,
                        difficulty: item.difficulty, status: item.status, stage_count: item.stage_count,
                        updated_at: item.updated_at, created_at: item.created_at, duration_in_minutes: item.duration_in_minutes,
                        tags: item.tags || [], participant_count: item.participant_count,
                        link: `https://dacon.io/edu/${item.project_id}`, type: 'course',
                    })));
                }
                if (dsResult.hackathons && Array.isArray(dsResult.hackathons.list)) {
                    allLearningContent = allLearningContent.concat(dsResult.hackathons.list.map((item: any): DaySchoolCourse => ({
                        project_id: parseInt(item.cpt_id, 10),
                        title: item.title, summary_img_object_key: '', difficulty: '중급',
                        status: new Date() <= new Date(item.period_end) ? 'OPEN' : 'ENDED', stage_count: '1',
                        updated_at: item.period_end, created_at: item.period_start, duration_in_minutes: '120',
                        tags: (item.keyword || '').split('|').map((k: string) => ({ tag_title: k.trim() })).filter(Boolean),
                        participant_count: item.participant_count || 0,
                        link: `https://dacon.io/competitions/official/${item.cpt_id}/overview/description`, type: 'hackathon',
                    })));
                }
                if (dsResult.rankerVideos && Array.isArray(dsResult.rankerVideos.list)) {
                    allLearningContent = allLearningContent.concat(dsResult.rankerVideos.list.map((item: any): DaySchoolCourse => ({
                        project_id: parseInt(item.tb_id, 10), title: item.title,
                        summary_img_object_key: item.thumbnail_url || '', difficulty: '고급', status: 'OPEN', stage_count: '1',
                        updated_at: item.created_at, created_at: item.created_at, duration_in_minutes: '60',
                        tags: [{ tag_title: '랭커특강' }], participant_count: 0,
                        link: `https://dacon.io/forum/${item.tb_id}`, type: 'lecture',
                    })));
                }
            }

            if (allLearningContent.length === 0) {
                 const fallbackData = [...daySchoolCourses, ...rankerLectures];
                 allLearningContent = fallbackData.map(course => {
                    const titleLower = course.title.toLowerCase();
                    const keywordsInTitle = ['python', 'llm', 'langchain', 'rag', 'cnn', 'lstm', '파이썬', '딥러닝', '머신러닝'];
                    const newTags = keywordsInTitle.filter(kw => titleLower.includes(kw)).map(kw => ({ tag_title: kw }));
                    return { ...course, tags: newTags.length > 0 ? newTags : course.tags };
                });
            }
            
            const predefinedKeywords = ['파이썬', '딥러닝', '머신러닝', 'AI', '데이터', 'LangChain', 'RAG', 'LLM', 'CNN', 'LSTM', '회귀', '분류', '시각화', '챗봇', '프로젝트'];
            const dsKeywordCounts: { [key: string]: number } = {};
            allLearningContent.forEach(course => {
                const contentText = (course.title + ' ' + (course.tags || []).map(t => t.tag_title).join(' ')).toLowerCase();
                predefinedKeywords.forEach(k => { if (contentText.includes(k.toLowerCase())) dsKeywordCounts[k] = (dsKeywordCounts[k] || 0) + 1; });
            });
            const sortedDsKeywords = Object.entries(dsKeywordCounts).sort(([, a], [, b]) => b - a).slice(0, 15).map(([k]) => k);
            
            setAllDaySchoolContent(allLearningContent);
            setPopularDaySchoolKeywords(sortedDsKeywords);
        } catch (err: any) {
            console.error('Fetching data failed:', err);
            setAllCompetitions(staticCompetitions);
            setAllDaySchoolContent([...daySchoolCourses, ...rankerLectures]);
            setError(err.message + ' (API 호출에 실패하여 일부 데이터만 표시될 수 있습니다.)');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchTickerStats = useCallback(async () => {
        try {
            const result = await daconApi.getCompetitionStats();
            if (result && result.length > 0) {
                const stats = result[0];
                const formatPrize = (amountInManWon: number): string => {
                    const amount = amountInManWon * 10000;
                    if (amount >= 100000000) return `${Math.round((amount / 100000000) * 10) / 10}억원`;
                    return `${Math.round(amount / 10000).toLocaleString()}만원`;
                };
                setTickerStats({
                    totalCount: stats.cnt_of_competition, ongoingCount: stats.on_going,
                    totalPrize: formatPrize(stats.prize), totalParticipants: stats.participants.toLocaleString(),
                });
            }
        } catch (err) { console.error('Stats fetch failed:', err); setTickerStats(null); }
    }, []);
    
    const fetchDaySchoolTickerStats = useCallback(async () => {
        try { setDaySchoolTickerStats(await daconApi.getEducationStats()); } 
        catch (err) { console.error('DS Stats fetch failed:', err); setDaySchoolTickerStats(null); }
    }, []);

    useEffect(() => {
        fetchAllData(); fetchTickerStats(); fetchDaySchoolTickerStats();
        const intervalId = setInterval(() => { fetchAllData(); fetchTickerStats(); fetchDaySchoolTickerStats(); }, 3600000);
        return () => clearInterval(intervalId);
    }, [fetchAllData, fetchTickerStats, fetchDaySchoolTickerStats]);

    useEffect(() => {
        try {
            const storedSearches = localStorage.getItem('daconRecentSearches');
            if (storedSearches) {
                const parsedData = JSON.parse(storedSearches);
                if (isStringArray(parsedData)) setRecentSearches(parsedData as string[]);
            }
        } catch (error) { console.error("Recent search parse error", error); }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => setKeywordFilter(inputValue), 300);
        return () => clearTimeout(handler);
    }, [inputValue]);

    useEffect(() => {
        const fetchSemanticKeywords = async () => {
            if (!keywordFilter || keywordFilter.trim().length < 2) { setSemanticKeywords([]); return; }
            setIsFetchingSemanticKeywords(true);
            try {
                const prompt = `You are a search enhancement AI for 'Dacon', a Korean data science competition platform. A user is searching for '${keywordFilter}'. Provide a comma-separated list of 5-7 highly relevant Korean and English keywords, synonyms, and related technical terms to broaden the search. Focus on terms common in AI/data science. Output ONLY the comma-separated list.`;
                const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
                const keywordsText = response.text.trim();
                if (keywordsText) {
                    const keywords = keywordsText.split(',').map(k => k.trim()).filter(Boolean);
                    setSemanticKeywords([...new Set(keywords)]);
                } else { setSemanticKeywords([]); }
            } catch (error) {
                console.error("Semantic search failed:", error); setSemanticKeywords([]); addToast('AI 확장 검색에 실패했습니다.');
            } finally { setIsFetchingSemanticKeywords(false); }
        };
        fetchSemanticKeywords();
    }, [keywordFilter, addToast]);

    // FIX: Define suggestions useMemo to fix "Cannot find name 'suggestions'"
    const suggestions = useMemo(() => {
        if (!inputValue) {
            return {
                recent: recentSearches,
                popular: popularKeywords,
            };
        }
        const combined = [...new Set([...recentSearches, ...popularKeywords])];
        const filtered = combined.filter(
            search =>
                search.toLowerCase().includes(inputValue.toLowerCase()) &&
                search.toLowerCase() !== inputValue.toLowerCase()
        );
        return { filtered };
    }, [inputValue, recentSearches, popularKeywords]);

    useEffect(() => {
        if (isInitialMount.current || !keywordFilter.trim()) return;
        const newSearches = [keywordFilter.trim(), ...recentSearches.filter(s => s.toLowerCase() !== keywordFilter.trim().toLowerCase())].slice(0, MAX_RECENT_SEARCHES);
        setRecentSearches(newSearches);
        localStorage.setItem('daconRecentSearches', JSON.stringify(newSearches));
        addToast(`'${keywordFilter.trim()}'(으)로 검색합니다.`);
    }, [keywordFilter, addToast]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) setShowSuggestions(false);
            if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) setIsMoreMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // FIX: Renamed handleSortChange to handleSortClick to fix "Cannot find name 'handleSortClick'"
    const handleSortClick = useCallback((criteria: SortCriteria) => { setSortCriteria(criteria); addToast(`정렬 기준: ${{startDateDesc: '최신순', endDateAsc: '마감 임박순', participantsDesc: '참가자 많은 순', prizeDesc: '상금순'}[criteria]}`); }, [addToast]);

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
            competitions = competitions.filter(comp => typeFilterKeywords[typeFilter].some(k => comp.name.toLowerCase().includes(k)));
        }

        const trimmedKeyword = keywordFilter.trim().toLowerCase();
        if (trimmedKeyword) {
            const allSearchTerms = [...new Set([trimmedKeyword, ...semanticKeywords.map(k => k.toLowerCase())])];
            competitions = competitions.filter(comp => {
                const compText = (comp.name + ' ' + (comp.keyword || '')).toLowerCase();
                return allSearchTerms.some(term => compText.includes(term));
            });
        }

        return [...competitions].sort((a, b) => {
            const aIsOngoing = new Date() <= new Date(a.period_end);
            const bIsOngoing = new Date() <= new Date(b.period_end);
            if (aIsOngoing && !bIsOngoing) return -1;
            if (!aIsOngoing && bIsOngoing) return 1;

            if (trimmedKeyword) {
                const aText = (a.name.toLowerCase() + (a.keyword || '').toLowerCase());
                const bText = (b.name.toLowerCase() + (b.keyword || '').toLowerCase());
                const aMatch = aText.includes(trimmedKeyword);
                const bMatch = bText.includes(trimmedKeyword);
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
            }
            
            switch (sortCriteria) {
                case 'endDateAsc': return new Date(a.period_end).getTime() - new Date(b.period_end).getTime();
                case 'participantsDesc': return b.user_count - a.user_count;
                case 'prizeDesc': return parsePrizeMoney(b.prize_info) - parsePrizeMoney(a.prize_info);
                case 'startDateDesc': default: return new Date(b.period_start).getTime() - new Date(a.period_start).getTime();
            }
        });
    }, [allCompetitions, showDataLinksOnly, statusFilter, typeFilter, keywordFilter, semanticKeywords, sortCriteria]);

    const filteredDaySchoolCourses = useMemo(() => {
        let filtered = allDaySchoolContent;
        if (daySchoolTypeFilter !== 'all') filtered = filtered.filter(c => c.type === daySchoolTypeFilter);

        const mainKeyword = keywordFilter.trim().toLowerCase();
        const categoryKeyword = daySchoolKeywordFilter?.toLowerCase();
        if (mainKeyword || categoryKeyword) {
            const allSearchTerms = new Set<string>();
            if (mainKeyword) { allSearchTerms.add(mainKeyword); semanticKeywords.forEach(k => allSearchTerms.add(k.toLowerCase())); }
            if (categoryKeyword) allSearchTerms.add(categoryKeyword);
            filtered = filtered.filter(c => {
                const contentText = (c.title + ' ' + (c.tags || []).map(t => t.tag_title).join(' ')).toLowerCase();
                return Array.from(allSearchTerms).some(term => contentText.includes(term));
            });
        }
        if (daySchoolDifficultyFilter) filtered = filtered.filter(c => c.difficulty === daySchoolDifficultyFilter);
        
        return [...filtered].sort((a, b) => {
            const multiplier = (daySchoolSortCriteria === 'titleAsc' || daySchoolSortCriteria === 'difficulty') ? (daySchoolSortDirection === 'asc' ? 1 : -1) : (daySchoolSortDirection === 'desc' ? -1 : 1);
            let comparison = 0;
            switch (daySchoolSortCriteria) {
                 case 'difficulty': {
                    const difficultyOrder: { [key: string]: number } = { '초급': 1, '중급': 2, '고급': 3 };
                    comparison = (difficultyOrder[a.difficulty] || 99) - (difficultyOrder[b.difficulty] || 99);
                    break;
                }
                case 'duration_in_minutes': comparison = Number(a.duration_in_minutes) - Number(b.duration_in_minutes); break;
                case 'participant_count': comparison = a.participant_count - b.participant_count; break;
                case 'status': if (a.status === 'NEW' && b.status !== 'NEW') return -1; if (a.status !== 'NEW' && b.status === 'NEW') return 1; return b.project_id - a.project_id;
                case 'titleAsc': comparison = a.title.localeCompare(b.title); break;
                case 'idDesc': default: comparison = b.project_id - a.project_id; break;
            }
            return comparison * (daySchoolSortDirection === 'asc' ? 1 : -1);
        });
    }, [allDaySchoolContent, keywordFilter, semanticKeywords, daySchoolKeywordFilter, daySchoolSortCriteria, daySchoolSortDirection, daySchoolDifficultyFilter, daySchoolTypeFilter]);
    
    const filteredBaseCode = useMemo(() => {
        let filtered = baseCodeData;
        if (baseCodeCategoryFilter !== 'all') filtered = filtered.filter(item => item.category === baseCodeCategoryFilter);
        const trimmedKeyword = keywordFilter.trim().toLowerCase();
        if (trimmedKeyword) {
            const allSearchTerms = [...new Set([trimmedKeyword, ...semanticKeywords.map(k => k.toLowerCase())])];
            filtered = filtered.filter(item => {
                const itemText = (item.title + ' ' + (item.keywords || []).join(' ')).toLowerCase();
                return allSearchTerms.some(term => itemText.includes(term));
            });
        }
        return filtered;
    }, [keywordFilter, semanticKeywords, baseCodeCategoryFilter]);
    
    const fetchAiTip = useCallback(() => {
        setIsFetchingAiTip(true); setAiTipError(null); setAiTip(null);
        setTimeout(() => { setAiTip(staticAiTips[Math.floor(Math.random() * staticAiTips.length)]); setIsFetchingAiTip(false); }, 300);
    }, []);

    useEffect(() => { if (!isInitialMount.current) setCurrentPage(1); }, [keywordFilter, statusFilter, sortCriteria, viewMode, showDataLinksOnly, typeFilter, daySchoolSortCriteria, daySchoolKeywordFilter, daySchoolDifficultyFilter, daySchoolTypeFilter, baseCodeCategoryFilter, daySchoolSortDirection]);
    useEffect(() => {
        let title = '데이콘 AI 경진대회 대시보드';
        if (viewMode === 'dayschool') title = '학습 강좌 목록 | 데이콘';
        else if (viewMode === 'roadmap') title = 'AI 탐험가 로드맵 | 데이콘';
        else if (viewMode === 'basecode') title = '기초 코드 목록 | 데이콘';
        else if (viewMode === 'competition_roadmap') title = '대회 참가 방법 | 데이콘';
        else if (keywordFilter) title = `'${keywordFilter}' 검색 결과 | 데이콘`;
        document.title = title;
    }, [keywordFilter, viewMode]);
    useEffect(() => { isInitialMount.current = false; }, []);
    useEffect(() => {
        const noResults = (viewMode === 'list' && filteredCompetitions.length === 0) || (viewMode === 'dayschool' && filteredDaySchoolCourses.length === 0) || (viewMode === 'basecode' && filteredBaseCode.length === 0);
        if (!isLoading && noResults) fetchAiTip();
    }, [isLoading, filteredCompetitions.length, filteredDaySchoolCourses.length, filteredBaseCode.length, viewMode, fetchAiTip]);

    const handleViewChange = useCallback((view: ViewMode, type: DaySchoolTypeFilter = 'all') => {
        if (view !== viewMode || (view === 'dayschool' && type !== daySchoolTypeFilter)) {
            setViewMode(view); setCurrentPage(1);
            if (view !== 'list') { setStatusFilter('all'); setTypeFilter('all'); setSortCriteria('startDateDesc'); }
            if (view !== 'dayschool') { setDaySchoolKeywordFilter(null); setDaySchoolDifficultyFilter(null); }
            if (view !== 'basecode') setBaseCodeCategoryFilter('all');
            setDaySchoolTypeFilter(type);
            addToast(`${{list: '대회 목록', basecode: '기초 코드', dayschool: '학습 강좌', roadmap: '로드맵', competition_roadmap: '대회 참가 방법'}[view]} 보기로 전환합니다.`);
        }
    }, [viewMode, addToast, daySchoolTypeFilter]);

    const handleCompetitionNavClick = useCallback(() => {
        const wasChanged = viewMode !== 'list' || showDataLinksOnly;
        setViewMode('list'); setShowDataLinksOnly(false);
        if (wasChanged) addToast('전체 대회 목록 보기로 전환합니다.');
        setCurrentPage(1);
    }, [viewMode, showDataLinksOnly, addToast]);

    const handleDataLinksToggle = useCallback(() => {
        if (viewMode !== 'list') { setViewMode('list'); setShowDataLinksOnly(true); addToast('데이터 다운로드 가능 대회만 표시합니다.'); } 
        else { setShowDataLinksOnly(prev => { const newValue = !prev; addToast(newValue ? '데이터 다운로드 가능 대회만 표시합니다.' : '전체 대회 목록을 표시합니다.'); return newValue; }); }
        setCurrentPage(1);
    }, [viewMode, addToast]);

    const handleStatusClick = useCallback((status: StatusFilter) => { setStatusFilter(status); window.scrollTo({ top: 0, behavior: 'smooth' }); addToast(`상태 필터: ${{all: '전체', ongoing: '진행중', ended: '종료', practice: '연습'}[status]}`); }, [addToast]);
    const handleTypeClick = useCallback((type: CompetitionTypeFilter) => { setTypeFilter(type); window.scrollTo({ top: 0, behavior: 'smooth' }); addToast(`유형 필터: ${{all: '전체', algorithm: '알고리즘', prompt: '프롬프트', service: '개발', idea: '아이디어'}[type]}`); }, [addToast]);
    const handleDaySchoolSortChange = useCallback((criteria: DaySchoolSortCriteria) => {
        setDaySchoolSortCriteria(currentCrit => {
            if (currentCrit === criteria) { setDaySchoolSortDirection(currentDir => currentDir === 'desc' ? 'asc' : 'desc'); } 
            else { setDaySchoolSortDirection(criteria === 'titleAsc' || criteria === 'difficulty' ? 'asc' : 'desc'); }
            return criteria;
        });
        const criteriaMap: Record<DaySchoolSortCriteria, string> = { status: '신규순', idDesc: '최신순', titleAsc: '제목순', difficulty: '난이도순', duration_in_minutes: '학습 시간순', participant_count: '참여 인원순' };
        addToast(`정렬 기준: ${criteriaMap[criteria]}`);
    }, [addToast]);
    const handleDaySchoolKeywordClick = useCallback((keyword: string | null) => { setDaySchoolKeywordFilter(keyword); window.scrollTo({ top: 0, behavior: 'smooth' }); addToast(keyword ? `키워드 필터: #${keyword}` : '키워드 필터를 초기화했습니다.'); }, [addToast]);
    const handleDaySchoolDifficultyClick = useCallback((difficulty: string) => { const newDifficulty = daySchoolDifficultyFilter === difficulty ? null : difficulty; setDaySchoolDifficultyFilter(newDifficulty); window.scrollTo({ top: 0, behavior: 'smooth' }); addToast(newDifficulty ? `난이도 필터: ${newDifficulty}` : '난이도 필터를 초기화했습니다.'); }, [addToast, daySchoolDifficultyFilter]);
    const handleDaySchoolTypeChange = useCallback((type: DaySchoolTypeFilter) => { setDaySchoolTypeFilter(type); window.scrollTo({ top: 0, behavior: 'smooth' }); addToast(`종류 필터: ${{all: '전체', course: '강좌', hackathon: '해커톤', lecture: '랭커특강'}[type]}`); }, [addToast]);
    const handleBaseCodeCategoryChange = useCallback((category: BaseCodeCategory | 'all') => { setBaseCodeCategoryFilter(category); window.scrollTo({ top: 0, behavior: 'smooth' }); addToast(category === 'all' ? '모든 코드 카테고리 표시' : `${category} 카테고리 필터 적용`); }, [addToast]);
    const handleKeywordClick = useCallback((keyword: string) => { setInputValue(keyword); window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
    const handleReset = useCallback(() => {
        setInputValue(''); setKeywordFilter(''); setStatusFilter('all'); setTypeFilter('all'); setSortCriteria('startDateDesc'); setShowDataLinksOnly(false); setCurrentPage(1); setDaySchoolSortCriteria('status'); setDaySchoolKeywordFilter(null); setDaySchoolDifficultyFilter(null); setDaySchoolTypeFilter('all'); setBaseCodeCategoryFilter('all'); setDaySchoolSortDirection('desc'); if (viewMode !== 'list') setViewMode('list'); addToast('모든 필터를 초기화했습니다.');
    }, [viewMode, addToast]);
    
    const paginatedCompetitions = useMemo(() => {
        const hasFilters = !!keywordFilter.trim() || statusFilter !== 'all' || typeFilter !== 'all' || showDataLinksOnly;
        if (hasFilters) { const offset = (currentPage - 1) * ITEMS_PER_PAGE; return filteredCompetitions.slice(offset, offset + ITEMS_PER_PAGE); }
        const itemsOnFirstPage = ITEMS_PER_PAGE - 2;
        if (currentPage === 1) return filteredCompetitions.slice(0, itemsOnFirstPage);
        const offset = itemsOnFirstPage + (currentPage - 2) * ITEMS_PER_PAGE;
        return filteredCompetitions.slice(offset, offset + ITEMS_PER_PAGE);
    }, [filteredCompetitions, currentPage, keywordFilter, statusFilter, typeFilter, showDataLinksOnly]);

    const paginatedDaySchoolCourses = useMemo(() => {
        const itemsOnFirstPage = ITEMS_PER_PAGE_DAYSCHOOL - 2;
        if (currentPage === 1) return filteredDaySchoolCourses.slice(0, itemsOnFirstPage);
        const offset = itemsOnFirstPage + (currentPage - 2) * ITEMS_PER_PAGE_DAYSCHOOL;
        return filteredDaySchoolCourses.slice(offset, offset + ITEMS_PER_PAGE_DAYSCHOOL);
    }, [filteredDaySchoolCourses, currentPage]);

    const paginatedBaseCode = useMemo(() => filteredBaseCode.slice((currentPage - 1) * ITEMS_PER_PAGE_BASECODE, currentPage * ITEMS_PER_PAGE_BASECODE), [filteredBaseCode, currentPage]);
    const paginationTotalItems = useMemo(() => {
        if (viewMode === 'dayschool') return filteredDaySchoolCourses.length > 0 ? filteredDaySchoolCourses.length + 2 : 0;
        if (viewMode === 'basecode') return filteredBaseCode.length;
        const hasFilters = !!keywordFilter.trim() || statusFilter !== 'all' || typeFilter !== 'all' || showDataLinksOnly;
        return filteredCompetitions.length > 0 ? (hasFilters ? filteredCompetitions.length : filteredCompetitions.length + 2) : 0;
    }, [filteredCompetitions.length, filteredDaySchoolCourses.length, filteredBaseCode.length, viewMode, keywordFilter, statusFilter, typeFilter, showDataLinksOnly]);
    
    const tickerItems = useMemo(() => {
        if (['dayschool', 'roadmap', 'basecode', 'competition_roadmap'].includes(viewMode)) {
            if (!daySchoolTickerStats) return null;
            return [`총 ${daySchoolTickerStats.participants.toLocaleString()}명 참여`, `${daySchoolTickerStats.lesson_count}개 레슨`, `${daySchoolTickerStats.contents_count}개 콘텐츠`, '데이터로 꿈을 현실로!'];
        }
        if (!tickerStats) return null;
        return [`총 ${tickerStats.totalCount}개 대회`, `진행중 ${tickerStats.ongoingCount}개`, `총 상금 약 ${tickerStats.totalPrize}`, `총 참가자 ${tickerStats.totalParticipants}명`];
    }, [viewMode, tickerStats, daySchoolTickerStats]);

    const isGlass = theme === 'glass';
    const isNeumorphic = theme === 'neumorphic';
    const getNavButtonClasses = (buttonView: string) => {
        let active = false;
        switch (buttonView) {
            case '대회': active = (viewMode === 'list' && !showDataLinksOnly) || viewMode === 'competition_roadmap' || viewMode === 'basecode'; break;
            case '데이터': active = viewMode === 'list' && showDataLinksOnly; break;
            case '코드': active = viewMode === 'basecode'; break;
            case '참가 방법': active = viewMode === 'competition_roadmap'; break;
            case '학습': active = viewMode === 'dayschool' || viewMode === 'roadmap'; break;
            case '강좌': active = viewMode === 'dayschool' && daySchoolTypeFilter === 'course'; break;
            case '해커톤': active = viewMode === 'dayschool' && daySchoolTypeFilter === 'hackathon'; break;
            case '랭커특강': active = viewMode === 'dayschool' && daySchoolTypeFilter === 'lecture'; break;
            case '로드맵': active = viewMode === 'roadmap'; break;
        }
        const base = `px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all duration-300 transform flex items-center gap-2`;
        const webtoonBase = `px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-bold rounded-md transition-all duration-200 border-2 border-black`;
        const learning = ['학습', '강좌', '해커톤', '랭커특강', '로드맵'].includes(buttonView);
        const activeLearningColor = 'bg-[rgb(253,224,72,0.73)]';
        if (learning) {
            if (isGlass) return `${base} border ${active ? `${activeLearningColor} text-black font-bold border-yellow-400` : 'bg-slate-800/40 text-slate-200 border-slate-700'}`;
            if (isNeumorphic) return `${base} ${active ? `shadow-[inset_5px_5px_10px_#a3b1c6] text-black ${activeLearningColor}` : 'shadow-[5px_5px_10px_#a3b1c6] text-gray-700'}`;
            return `${webtoonBase} ${active ? `${activeLearningColor} text-black shadow-[3px_3px_0_#000]` : 'bg-white'}`;
        }
        if (isGlass) return `${base} border ${active ? 'bg-sky-500/60 text-white border-sky-400' : 'bg-slate-800/40 text-slate-200 border-slate-700'}`;
        if (isNeumorphic) return `${base} ${active ? `shadow-[inset_5px_5px_10px_#a3b1c6] text-blue-600` : 'shadow-[5px_5px_10px_#a3b1c6] text-gray-700'}`;
        return `${webtoonBase} ${active ? 'bg-blue-500 text-white shadow-[3px_3px_0_#000]' : 'bg-white'}`;
    };
    const getFilterButtonClasses = (isActive: boolean) => {
        const base = `px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold rounded-lg transition-all duration-300 transform flex items-center gap-2`;
        if (isGlass) return `${base} border ${isActive ? 'bg-sky-500/60 text-white border-sky-400' : 'bg-slate-800/50 text-slate-200 border-slate-700'}`;
        if (isNeumorphic) return `${base} ${isActive ? 'shadow-[inset_5px_5px_10px_#a3b1c6] text-blue-600' : 'shadow-[5px_5px_10px_#a3b1c6] text-gray-700'}`;
        return `${base} border-2 border-black font-bold rounded-md ${isActive ? 'bg-blue-500 text-white shadow-[3px_3px_0_#000]' : 'bg-white'}`;
    };

    return (
        <>
            <div aria-live="polite" className="fixed top-20 right-4 z-[100] space-y-2">
                {toasts.map(t => <Toast key={t.id} {...t} onClose={removeToast} theme={theme} />)}
            </div>
            <Header bannerText={bannerText} tickerItems={tickerItems} theme={theme} setTheme={setTheme} onCompetitionClick={handleCompetitionNavClick} onLearningClick={() => handleViewChange('dayschool')} isBannerVisible={isBannerVisible} isHeaderContentVisible={isHeaderAndFilterVisible} />
            <main className={`transition-all duration-300 ${isBannerVisible ? 'pt-[218px]' : isHeaderAndFilterVisible ? 'pt-[144px]' : 'pt-[64px]'}`}>
                <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12">
                     <section className={`sticky ${isBannerVisible ? 'top-[218px]' : isHeaderAndFilterVisible ? 'top-[144px]' : 'top-[64px]'} z-30 mb-8 p-4 rounded-2xl flex flex-col gap-4 transition-transform duration-300 ${isHeaderAndFilterVisible ? 'translate-y-0' : '-translate-y-full'} ${isGlass ? 'bg-slate-900/75 backdrop-blur-md border border-slate-700' : isNeumorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_#a3b1c6]' : 'bg-white border-2 border-black'}`}>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div ref={searchContainerRef} className="relative w-full md:flex-1">
                                <input type="text" placeholder="키워드로 전체 검색 (대회, 강좌, 코드)" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onFocus={() => setShowSuggestions(true)} className={`w-full pl-4 pr-12 py-3 rounded-lg focus:outline-none ${isGlass ? 'bg-slate-900/70 border border-slate-600/50 text-slate-100' : isNeumorphic ? 'bg-[#e0e5ec] shadow-[inset_5px_5px_10px_#a3b1c6]' : 'bg-white border-2 border-black'}`} autoComplete="off" />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    {isFetchingSemanticKeywords && <div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${isGlass ? 'border-sky-300' : 'border-blue-500'}`}></div>}
                                    {inputValue && !isFetchingSemanticKeywords && <button onClick={() => setInputValue('')} className="p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>}
                                </div>
                                {showSuggestions && (suggestions.recent?.length || suggestions.popular?.length || suggestions.filtered?.length) && (
                                    <div className={`absolute top-full left-0 w-full mt-2 rounded-2xl z-50 p-2 max-h-60 overflow-y-auto ${isGlass ? 'bg-slate-800/95 border border-slate-600' : isNeumorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_#a3b1c6]' : 'bg-white border-2 border-black shadow-[6px_6px_0_#000]'}`}>
                                        {!inputValue ? (<>{suggestions.recent?.length > 0 && <div><h4 className="px-2 pt-1 pb-2 text-xs font-bold opacity-50">최근 검색어</h4>{suggestions.recent.map(s => <li key={s} onClick={() => { setInputValue(s); setShowSuggestions(false); }} className="p-2 text-sm rounded-lg cursor-pointer hover:bg-sky-500/10 list-none">{s}</li>)}</div>}{suggestions.popular?.length > 0 && <div className="mt-2"><h4 className="px-2 pt-1 pb-2 text-xs font-bold opacity-50">인기 키워드</h4>{suggestions.popular.map(s => <li key={s} onClick={() => { setInputValue(s); setShowSuggestions(false); }} className="p-2 text-sm rounded-lg cursor-pointer hover:bg-sky-500/10 list-none">{s}</li>)}</div>}</>) : (suggestions.filtered?.map(s => <li key={s} onClick={() => { setInputValue(s); setShowSuggestions(false); }} className="p-2 text-sm rounded-lg cursor-pointer hover:bg-sky-500/10 list-none">{s}</li>))}
                                    </div>
                                )}
                            </div>
                            {viewMode === 'list' && <div className="relative hidden md:block"><select value={sortCriteria} onChange={(e) => handleSortClick(e.target.value as SortCriteria)} className={`appearance-none pl-4 pr-10 py-3 rounded-lg focus:outline-none cursor-pointer ${isGlass ? 'bg-slate-900/70 border border-slate-600/50 text-slate-100' : isNeumorphic ? 'bg-[#e0e5ec] shadow-[inset_5px_5px_10px_#a3b1c6]' : 'bg-white border-2 border-black'}`}><option value="startDateDesc">최신순</option><option value="endDateAsc">마감 임박순</option><option value="participantsDesc">참가자 많은 순</option><option value="prizeDesc">상금순</option></select></div>}
                        </div>
                        <div className={`relative pt-4 border-t ${isGlass ? 'border-slate-700/50' : isNeumorphic ? 'border-gray-300/50' : 'border-black'}`}>
                             <div className="flex items-center justify-between gap-x-4">
                                <div className="flex-1 overflow-x-auto custom-scrollbar">
                                    <div className="inline-flex items-center gap-x-4 md:gap-x-6 pb-2">
                                        <div className="inline-flex items-center gap-2"><button onClick={handleCompetitionNavClick} className={getNavButtonClasses('대회')}>대회</button><button onClick={handleDataLinksToggle} className={`${getNavButtonClasses('데이터')} hidden md:flex`}>데이터</button><button onClick={() => handleViewChange('basecode')} className={`${getNavButtonClasses('코드')} hidden md:flex`}>코드</button><button onClick={() => handleViewChange('competition_roadmap')} className={getNavButtonClasses('참가 방법')}>참가 방법</button></div>
                                        <div className={`h-5 w-px ${isGlass ? 'bg-slate-700' : 'bg-gray-300'} md:hidden`}></div>
                                        <div className="inline-flex items-center gap-2"><button onClick={() => handleViewChange('dayschool', 'all')} className={getNavButtonClasses('학습')}>학습</button><button onClick={() => handleViewChange('dayschool', 'course')} className={`${getNavButtonClasses('강좌')} hidden md:flex`}>강좌</button><button onClick={() => handleViewChange('dayschool', 'hackathon')} className={`${getNavButtonClasses('해커톤')} hidden md:flex`}>해커톤</button><button onClick={() => handleViewChange('dayschool', 'lecture')} className={`${getNavButtonClasses('랭커특강')} hidden md:flex`}>랭커특강</button><button onClick={() => handleViewChange('roadmap')} className={getNavButtonClasses('로드맵')}>로드맵</button></div>
                                    </div>
                                </div>
                                {viewMode === 'list' && <div className="ml-2 hidden md:block"><button onClick={() => setIsDetailFilterVisible(!isDetailFilterVisible)} className={getFilterButtonClasses(isDetailFilterVisible)}>상세필터</button></div>}
                            </div>
                        </div>
                        {viewMode === 'list' && isDetailFilterVisible && (
                            <div className="hidden md:block pt-4 border-t border-gray-300/50">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className="flex items-center gap-2"><span className="text-sm font-semibold opacity-70">상태:</span>{(['all', 'ongoing', 'ended', 'practice'] as StatusFilter[]).map(s => <button key={s} onClick={() => handleStatusClick(s)} className={getFilterButtonClasses(statusFilter === s)}>{ {all: '전체', ongoing: '진행중', ended: '종료', practice: '연습'}[s] }</button>)}</div>
                                        <div className="flex items-center gap-2"><span className="text-sm font-semibold opacity-70">유형:</span>{(['all', 'algorithm', 'prompt', 'service', 'idea'] as CompetitionTypeFilter[]).map(t => <button key={t} onClick={() => handleTypeClick(t)} className={getFilterButtonClasses(typeFilter === t)}>{ {all: '전체', algorithm: '알고리즘', prompt: '프롬프트', service: '개발', idea: '아이디어'}[t] }</button>)}</div>
                                    </div>
                                    <div className="flex items-center gap-2"><button onClick={handleReset} className={getFilterButtonClasses(false)}>초기화</button><button onClick={handleToggleManual} className={getFilterButtonClasses(isManualVisible)}>매뉴얼</button></div>
                                </div>
                            </div>
                        )}
                    </section>
                    {isManualVisible && <ManualModal isOpen={isManualVisible} onClose={handleToggleManual} theme={theme} />}
                    {isLoading && !allCompetitions.length && <LoadingSpinner theme={theme} />}
                    {error && <ErrorMessage message={error} theme={theme} />}
                    {!error && (
                         <section className={isFetchingSemanticKeywords ? 'ai-searching' : ''}>
                            {viewMode === 'list' && <CompetitionListView filteredCompetitions={filteredCompetitions} paginatedCompetitions={paginatedCompetitions} currentPage={currentPage} paginationTotalItems={paginationTotalItems} hasActiveFilters={!!keywordFilter.trim() || statusFilter !== 'all' || typeFilter !== 'all' || showDataLinksOnly} theme={theme} showDataLinksOnly={showDataLinksOnly} isLoading={isLoading} aiTip={aiTip} isFetchingAiTip={isFetchingAiTip} aiTipError={aiTipError} onStatusClick={handleStatusClick} onKeywordClick={handleKeywordClick} onSortClick={handleSortClick} onPageChange={setCurrentPage} onResetFilters={handleReset} />}
                            {viewMode === 'dayschool' && <DaySchoolContentView filteredDaySchoolCourses={filteredDaySchoolCourses} paginatedDaySchoolCourses={paginatedDaySchoolCourses} theme={theme} popularDaySchoolKeywords={popularDaySchoolKeywords} daySchoolKeywordFilter={daySchoolKeywordFilter} handleDaySchoolKeywordClick={handleDaySchoolKeywordClick} daySchoolDifficultyFilter={daySchoolDifficultyFilter} handleDaySchoolDifficultyClick={handleDaySchoolDifficultyClick} currentPage={currentPage} daySchoolSortCriteria={daySchoolSortCriteria} daySchoolSortDirection={daySchoolSortDirection} handleDaySchoolSortChange={handleDaySchoolSortChange} daySchoolTypeFilter={daySchoolTypeFilter} handleDaySchoolTypeChange={handleDaySchoolTypeChange} paginationTotalItems={paginationTotalItems} onPageChange={setCurrentPage} isLoading={isLoading} onResetFilters={handleReset} aiTip={aiTip} isFetchingAiTip={isFetchingAiTip} aiTipError={aiTipError} />}
                            {viewMode === 'basecode' && <BaseCodeContentView filteredBaseCode={filteredBaseCode} paginatedBaseCode={paginatedBaseCode} theme={theme} baseCodeCategoryFilter={baseCodeCategoryFilter} handleBaseCodeCategoryChange={handleBaseCodeCategoryChange} currentPage={currentPage} paginationTotalItems={paginationTotalItems} onPageChange={setCurrentPage} isLoading={isLoading} onResetFilters={handleReset} aiTip={aiTip} isFetchingAiTip={isFetchingAiTip} aiTipError={aiTipError} />}
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
