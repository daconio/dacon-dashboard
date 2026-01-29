import React, { useState, useEffect } from 'react';
import type { BaseCodeItem } from '../types';

type Theme = 'glass' | 'neumorphic' | 'webtoon';

interface BaseCodeCardProps {
    item: BaseCodeItem;
    theme: Theme;
    animationIndex: number;
}

const CategoryIcon: React.FC<{ category: string }> = ({ category }) => {
    const iconMap: { [key: string]: React.ReactNode } = {
        '생성AI': <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.553L16.5 21.75l-.398-1.197a3.375 3.375 0 00-2.456-2.456L12.5 17.5l1.197-.398a3.375 3.375 0 002.456-2.456L16.5 13.5l.398 1.197a3.375 3.375 0 002.456 2.456L20.5 17.5l-1.197.398a3.375 3.375 0 00-2.456 2.456z" />,
        'NLP': <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.625M21 21l-5.25-11.625M3.75 5.25h16.5M3.75 9h16.5" />,
        '정형': <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125H6.75m13.5 0H18v-1.5c0-.621-.504-1.125-1.125-1.125H9.75m-6.375 0H15m0 0v-1.5c0-.621-.504-1.125-1.125-1.125H2.25C1.629 12.75 1.125 13.254 1.125 13.875v1.5m14.25 0H6.75" />,
        '전처리': <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.433 2.433A3 3 0 008 18.468a3 3 0 005.78-1.128 2.25 2.25 0 012.433-2.433a3 3 0 00-1.128-5.78 2.25 2.25 0 01-2.433-2.433A3 3 0 008 3.532a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.433 2.433A3 3 0 006.53 9H9a.75.75 0 01.75.75v5.372a.75.75 0 01-.22.53z" />,
        '데이터분석': <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 21h16.5M16.5 3v11.25c0 .621-.504 1.125-1.125 1.125H8.625c-.621 0-1.125-.504-1.125-1.125V3" />,
        '비전': <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.25-7.5a1.012 1.012 0 011.736 0l4.25 7.5a1.012 1.012 0 010 .639l-4.25 7.5a1.012 1.012 0 01-1.736 0l-4.25-7.5zm15.342 0a1.012 1.012 0 010-.639l4.25-7.5a1.012 1.012 0 011.736 0l4.25 7.5a1.012 1.012 0 010 .639l-4.25 7.5a1.012 1.012 0 01-1.736 0l-4.25-7.5z" />
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {iconMap[category]}
        </svg>
    );
};

const BaseCodeCard: React.FC<BaseCodeCardProps> = ({ item, theme, animationIndex }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), animationIndex * 50);
        return () => clearTimeout(timer);
    }, [animationIndex]);

    const isGlass = theme === 'glass';

    return (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="h-full block">
            <div className={`basecode-card ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
                <div className={`basecode-card-header category-${item.category}`}>
                    <CategoryIcon category={item.category} />
                    {item.category}
                </div>
                <div className="p-4 flex flex-col flex-grow justify-between">
                    <h3 className={`text-base font-bold leading-snug mb-3 flex-grow ${isGlass ? 'text-slate-100' : 'text-black'}`}>{item.title}</h3>
                    {item.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.keywords.map(kw => (
                                <span key={kw} className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    isGlass ? 'bg-slate-700/50 text-slate-300' 
                                    : theme === 'neumorphic' ? 'bg-gray-200 text-gray-700' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                    #{kw}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </a>
    );
};

export default React.memo(BaseCodeCard);