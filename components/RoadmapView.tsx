import React, { useState } from 'react';
import DaySchoolCard from './DaySchoolCard';
import { personas, PersonaData, RoadmapStage } from '../data/roadmapData';
import type { Theme } from '../types';

interface RoadmapViewProps {
    theme: Theme;
}

const StageIcon: React.FC<{ icon: string, theme: Theme }> = ({ icon, theme }) => {
    const iconColor = theme === 'dark' ? 'currentColor' : theme === 'light' ? '#5a67d8' : '#000000';
    const iconMap: { [key: string]: React.ReactNode } = {
        sapling: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.121 15.536A9.004 9.004 0 0112 15c-1.248 0-2.428.213-3.536.608M12 3v12m0 0l-3.536-3.536M12 15l3.536-3.536" /></svg>,
        compass: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12L9 9l-3 6 6 3 3-6z" /></svg>,
        shield: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 019-2.606 11.955 11.955 0 019 2.606 12.02 12.02 0 00-2.382-9.988z" /></svg>,
        book: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
        quill: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
        wizard: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke={iconColor} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    };
    return iconMap[icon] || null;
};

const PersonaCard: React.FC<{ persona: PersonaData, onSelect: () => void, theme: Theme }> = ({ persona, onSelect, theme }) => {
    return (
        <div className="persona-card">
            <div className="persona-card-icon" role="img" aria-label={persona.title}>{persona.icon}</div>
            <h3 className="persona-card-title">{persona.title}</h3>
            <p className="persona-card-description">{persona.description}</p>
            <button onClick={onSelect} className="persona-card-button">
                이 경로로 시작
            </button>
        </div>
    );
};

const RoadmapDisplay: React.FC<{ persona: PersonaData, theme: Theme, onReset: () => void }> = ({ persona, theme, onReset }) => {
    
    const getResetButtonClasses = () => {
        const base = "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 transform mb-8";
        if (theme === 'dark') return `${base} bg-slate-700/50 text-slate-200 border border-slate-600/50 hover:bg-slate-600/50`;
        if (theme === 'light') return `${base} shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1 active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff]`;
        return `${base} bg-white text-black border-2 border-black hover:bg-gray-100`;
    };
    
    return (
         <div className="animate-fadeInUp">
            <header className="text-center mb-8">
                <div className="flex justify-center mb-6">
                    <button onClick={onReset} className={getResetButtonClasses()}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        다른 경로 선택
                    </button>
                </div>
                 <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-slate-100 text-shadow-elegant' : theme === 'light' ? 'text-slate-700 text-shadow-soft' : 'text-black'}`}>
                    {persona.title} 로드맵
                </h2>
                <p className={`max-w-3xl mx-auto text-lg ${theme === 'dark' ? 'text-slate-300' : theme === 'light' ? 'text-gray-600' : 'text-gray-800'}`}>
                    {persona.longDescription}
                </p>
            </header>
            
            <div className="roadmap-path-container">
                {persona.stages.map((stage, index) => (
                    <React.Fragment key={stage.level}>
                        <section className="roadmap-stage">
                            <div className="stage-icon-wrapper">
                                <StageIcon icon={stage.icon} theme={theme} />
                            </div>
                            <div className="text-center mb-8">
                                <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-sky-300' : theme === 'light' ? 'text-blue-600' : 'text-black'}`}>
                                    {stage.title}
                                </h3>
                                <p className={`mt-2 text-sm max-w-xl ${theme === 'dark' ? 'text-slate-400' : theme === 'light' ? 'text-gray-500' : 'text-gray-600'}`}>
                                    {stage.description}
                                </p>
                            </div>
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {stage.courses.map((course, courseIndex) => (
                                    <DaySchoolCard
                                        key={course.project_id}
                                        course={course}
                                        theme={theme}
                                        animationIndex={courseIndex}
                                    />
                                ))}
                            </div>
                             {stage.projects && stage.projects.choices.length === 2 && (
                                <div className="project-quest-container">
                                    <h4 className="project-quest-title">{stage.projects.title}</h4>
                                    <div className="project-choices-grid">
                                        {stage.projects.choices.map((project, projIndex) => (
                                            <DaySchoolCard
                                                key={`proj-${project.project_id}`}
                                                course={project}
                                                theme={theme}
                                                animationIndex={projIndex}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {index < persona.stages.length - 1 && (
                             <div className="roadmap-connector">
                                 <div className="roadmap-connector-line"></div>
                             </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}


const RoadmapView: React.FC<RoadmapViewProps> = ({ theme }) => {
    const [selectedPersona, setSelectedPersona] = useState<PersonaData | null>(null);

    if (!selectedPersona) {
        return (
            <div className="animate-fadeInUp">
                <header className="text-center mb-12">
                    <h2 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-slate-100 text-shadow-elegant' : theme === 'light' ? 'text-slate-700 text-shadow-soft' : 'text-black'}`}>
                        AI 탐험가 로드맵
                    </h2>
                    <p className={`max-w-3xl mx-auto ${theme === 'dark' ? 'text-slate-300' : theme === 'light' ? 'text-gray-600' : 'text-gray-800'}`}>
                        AI 세계를 탐험하는 모험가님, 환영합니다! 당신의 목표는 무엇인가요?
                        <br />
                        아래 페르소나 중 하나를 선택하여 당신만의 맞춤형 학습 여정을 시작해보세요.
                    </p>
                </header>
                <div className="persona-card-grid">
                    {personas.map(p => (
                        <PersonaCard key={p.key} persona={p} onSelect={() => setSelectedPersona(p)} theme={theme} />
                    ))}
                </div>
            </div>
        )
    }

    return <RoadmapDisplay persona={selectedPersona} theme={theme} onReset={() => setSelectedPersona(null)} />;
};

export default RoadmapView;