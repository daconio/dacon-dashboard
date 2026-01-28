import React, { useState, useEffect } from 'react';
import type { Theme } from '../types';

interface UpcomingCompetitionCardProps {
    animationIndex: number;
    className?: string;
    theme: Theme;
}

const upcomingList = [
    "헥토 2차(채용)",
    "서울시립대학교",
];

const UpcomingCompetitionCard: React.FC<UpcomingCompetitionCardProps> = ({ animationIndex, className = '', theme }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, animationIndex * 75); // Stagger delay
        return () => clearTimeout(timer);
    }, [animationIndex]);

    const isGlass = theme === 'dark';
    const isNeumorphic = theme === 'light';

    const baseClasses = isGlass
        ? `bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-2xl shadow-2xl shadow-teal-500/20 transition-all duration-300 flex flex-col h-full p-6 items-center justify-center text-center relative border border-cyan-400/30`
        : isNeumorphic
        ? `bg-[#e0e5ec] rounded-2xl shadow-[inset_8px_8px_16px_#a3b1c6,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 flex flex-col h-full p-6 items-center justify-center text-center relative`
        : `bg-green-200 rounded-lg border-2 border-black shadow-[6px_6px_0_#000] transition-all duration-300 flex flex-col h-full p-6 items-center justify-center text-center relative`;

    return (
        <div className={`${baseClasses} ${isVisible ? 'animate-fadeInUp' : 'opacity-0'} ${className}`}>
            <div className="flex-grow flex flex-col items-center justify-center w-full">
                <span role="img" aria-label="calendar" className={`text-4xl mb-4 ${isGlass ? 'text-white animate-pulse-subtle' : isNeumorphic ? 'text-shadow-soft' : ''}`}>📅</span>
                <h4 className={`text-lg font-bold mb-3 ${isGlass ? 'text-teal-200' : isNeumorphic ? 'text-green-600 text-shadow-soft' : 'text-black'}`}>예정 대회</h4>
                <ul className={`text-md md:text-lg font-semibold leading-relaxed space-y-2 ${isGlass ? 'text-white text-shadow-elegant' : isNeumorphic ? 'text-gray-700' : 'text-black'}`}>
                    {upcomingList.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default UpcomingCompetitionCard;