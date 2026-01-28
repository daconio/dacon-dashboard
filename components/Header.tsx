
import React from 'react';
import ThemeToggle from './ThemeToggle';
import type { Theme } from '../types';

interface HeaderProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    tickerStats: {
        totalCount: number;
        ongoingCount: number;
        totalPrize: string;
        totalParticipants: string;
    } | null;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme }) => {
    return (
        <header className="sticky top-0 w-full z-40 bg-white border-b-2 border-black h-16">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                {/* Left: Logo & Nav */}
                <div className="flex items-center gap-8">
                    <div className="cursor-pointer" onClick={() => window.location.reload()}>
                        <span className="text-2xl font-black tracking-tighter text-[#3b82f6]">DACON</span>
                    </div>
                    
                    <nav className="hidden md:flex items-center space-x-6 font-bold text-gray-700">
                        <a href="#" className="hover:text-blue-600 transition-colors">커뮤니티</a>
                        <a href="#" className="text-black transition-colors">대회</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">학습</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">랭킹</a>
                        <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                            <span>더보기</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </nav>
                </div>

                {/* Right: Icons */}
                <div className="flex items-center gap-4">
                    <button className="p-2 border-2 border-black rounded hover:bg-gray-100 transition-colors relative">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>
            </div>
        </header>
    );
};

export default Header;
