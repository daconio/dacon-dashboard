import React, { useState, useMemo } from 'react';
import type { Competition, Theme, DaySchoolCourse, BaseCodeCategory, BaseCodeItem } from '../types';
import CompetitionCard from './CompetitionCard';
import DaySchoolView from './DaySchoolView';
import BaseCodeView from './BaseCodeView';
import RoadmapView from './RoadmapView';
import { daySchoolCourses } from '../data/daySchoolCourses';
import { baseCodeData } from '../data/baseCodeData';
import { rankerLectures } from '../data/rankerLectures';

type HubTab = 'home' | 'competitions' | 'learning' | 'basecode' | 'roadmap';

interface DaconHubViewProps {
    theme: Theme;
    competitions: Competition[];
}

const DaconHubView: React.FC<DaconHubViewProps> = ({ theme, competitions }) => {
    const [activeTab, setActiveTab] = useState<HubTab>('home');
    
    // States for DaySchoolView
    const [dsKeyword, setDsKeyword] = useState<string | null>(null);
    const [dsDifficulty, setDsDifficulty] = useState<string | null>(null);
    const [dsCurrentPage, setDsCurrentPage] = useState(1);
    const [dsSortCriteria, setDsSortCriteria] = useState<any>('status');
    const [dsSortDirection, setDsSortDirection] = useState<'asc' | 'desc'>('desc');
    const [dsType, setDsType] = useState<any>('all');

    // States for BaseCodeView
    const [bcCategory, setBcCategory] = useState<BaseCodeCategory | 'all'>('all');

    // Derived data for DaySchool
    const allCourses = useMemo(() => [...daySchoolCourses, ...rankerLectures], []);
    const dsKeywords = useMemo(() => Array.from(new Set(allCourses.flatMap(c => c.tags.map(t => t.tag_title)))), [allCourses]);
    
    const filteredCourses = useMemo(() => {
        let result = allCourses;
        if (dsType !== 'all') result = result.filter(c => c.type === dsType);
        if (dsKeyword) result = result.filter(c => c.tags.some(t => t.tag_title === dsKeyword));
        if (dsDifficulty) result = result.filter(c => c.difficulty === dsDifficulty);
        
        return result.sort((a, b) => {
             // Simple sort for demo
             if (dsSortCriteria === 'duration_in_minutes') {
                 return parseInt(b.duration_in_minutes) - parseInt(a.duration_in_minutes);
             }
             return 0;
        });
    }, [allCourses, dsType, dsKeyword, dsDifficulty, dsSortCriteria]);

    // Derived data for BaseCode
    const filteredBaseCodes = useMemo(() => {
        if (bcCategory === 'all') return baseCodeData;
        return baseCodeData.filter(item => item.category === bcCategory);
    }, [bcCategory]);

    // Derived data for Home Dashboard
    const trendingCompetitions = useMemo(() => competitions.slice(0, 3), [competitions]);
    const recentCourses = useMemo(() => daySchoolCourses.filter(c => c.status === 'NEW').slice(0, 4), []);
    
    const isGlass = theme === 'dark';
    const isNeumorphic = theme === 'light';

    const getTabClasses = (tab: HubTab) => {
        const isActive = activeTab === tab;
        const base = "px-6 py-3 font-bold text-sm sm:text-base transition-all duration-300 border-b-2";
        
        if (isActive) {
            return `${base} border-blue-600 text-blue-600 ${isGlass ? 'text-sky-300 border-sky-300' : ''}`;
        }
        return `${base} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 ${isGlass ? 'text-slate-400 hover:text-slate-200' : ''}`;
    };

    return (
        <div className={`w-full min-h-screen pb-20 ${isGlass ? 'text-slate-200' : 'text-gray-800'}`}>
            {/* Hub Header */}
            <div className={`mb-8 p-6 rounded-2xl ${isGlass ? 'bg-slate-800/40 backdrop-blur-md border border-slate-600/30' : isNeumorphic ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff]' : 'bg-white border-2 border-black shadow-[4px_4px_0_#000]'}`}>
                <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                    <span className="text-4xl">🛸</span> 데이콘허브 <span className="text-sm font-normal opacity-60 bg-black text-white px-2 py-0.5 rounded-full ml-2">BETA</span>
                </h1>
                <p className="opacity-80 max-w-2xl">
                    경진대회, 학습, 코드 공유, 로드맵까지. 데이콘의 모든 콘텐츠를 한 곳에서 탐색하고 성장하세요.
                </p>
            </div>

            {/* Hub Navigation */}
            <div className={`flex overflow-x-auto mb-8 border-b ${isGlass ? 'border-slate-700' : 'border-gray-200'}`}>
                <button onClick={() => setActiveTab('home')} className={getTabClasses('home')}>홈</button>
                <button onClick={() => setActiveTab('competitions')} className={getTabClasses('competitions')}>경진대회</button>
                <button onClick={() => setActiveTab('learning')} className={getTabClasses('learning')}>학습 (DaySchool)</button>
                <button onClick={() => setActiveTab('basecode')} className={getTabClasses('basecode')}>기초코드</button>
                <button onClick={() => setActiveTab('roadmap')} className={getTabClasses('roadmap')}>로드맵</button>
            </div>

            {/* Hub Content */}
            <div className="animate-fadeInUp">
                {activeTab === 'home' && (
                    <div className="space-y-12">
                        {/* Section: Competitions */}
                        <section>
                            <div className="flex justify-between items-end mb-4">
                                <h2 className="text-2xl font-bold">🔥 실시간 인기 대회</h2>
                                <button onClick={() => setActiveTab('competitions')} className="text-sm text-blue-500 hover:underline">전체보기 &rarr;</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {trendingCompetitions.map((comp, idx) => (
                                    <CompetitionCard 
                                        key={comp.cpt_id} 
                                        competition={comp} 
                                        theme={theme} 
                                        animationIndex={idx}
                                        onStatusClick={()=>{}} onKeywordClick={()=>{}} onSortClick={()=>{}}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Section: Learning */}
                        <section>
                            <div className="flex justify-between items-end mb-4">
                                <h2 className="text-2xl font-bold">🎓 따끈따끈한 신규 강좌</h2>
                                <button onClick={() => setActiveTab('learning')} className="text-sm text-blue-500 hover:underline">전체보기 &rarr;</button>
                            </div>
                            <DaySchoolView 
                                courses={recentCourses}
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
                        </section>
                        
                         {/* Section: Banner */}
                         <section className={`p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 ${isGlass ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-white/10' : 'bg-gradient-to-r from-gray-900 to-gray-800 text-white'}`}>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">어디서부터 시작해야 할지 막막한가요?</h3>
                                <p className="opacity-80">나의 수준과 목표에 맞는 최적의 학습 경로를 AI가 추천해드립니다.</p>
                            </div>
                            <button 
                                onClick={() => setActiveTab('roadmap')}
                                className="whitespace-nowrap px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform"
                            >
                                로드맵 시작하기 🚀
                            </button>
                        </section>
                    </div>
                )}

                {activeTab === 'competitions' && (
                    <div>
                         <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">🏆 전체 경진대회</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {competitions.map((comp, idx) => (
                                <CompetitionCard 
                                    key={comp.cpt_id} 
                                    competition={comp} 
                                    theme={theme} 
                                    animationIndex={idx}
                                    onStatusClick={()=>{}} onKeywordClick={()=>{}} onSortClick={()=>{}}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'learning' && (
                    <DaySchoolView 
                        courses={filteredCourses}
                        theme={theme}
                        keywords={dsKeywords}
                        selectedKeyword={dsKeyword}
                        onKeywordClick={setDsKeyword}
                        selectedDifficulty={dsDifficulty}
                        onDifficultyClick={(d) => setDsDifficulty(d === dsDifficulty ? null : d)}
                        currentPage={dsCurrentPage}
                        sortCriteria={dsSortCriteria}
                        sortDirection={dsSortDirection}
                        onSortChange={(c) => {
                            if (dsSortCriteria === c) setDsSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                            else { setDsSortCriteria(c); setDsSortDirection('desc'); }
                        }}
                        selectedType={dsType}
                        onTypeChange={setDsType}
                    />
                )}

                {activeTab === 'basecode' && (
                    <BaseCodeView 
                        items={filteredBaseCodes}
                        theme={theme}
                        selectedCategory={bcCategory}
                        onCategoryChange={setBcCategory}
                    />
                )}

                {activeTab === 'roadmap' && (
                    <RoadmapView theme={theme} />
                )}
            </div>
        </div>
    );
};

export default DaconHubView;