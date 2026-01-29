import React, { useState, useEffect, useRef } from 'react';
import Ticker from './Ticker';
import ThemeToggle from './ThemeToggle';
import type { BannerText } from '../data/bannerTexts';

type Theme = 'glass' | 'neumorphic' | 'webtoon';

interface HeaderProps {
    tickerItems: string[] | null;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    onCompetitionClick: () => void;
    onLearningClick: () => void;
    bannerText: BannerText | null;
    isBannerVisible: boolean;
    isHeaderContentVisible: boolean;
}

const Header: React.FC<HeaderProps> = ({ tickerItems, theme, setTheme, onCompetitionClick, onLearningClick, bannerText, isBannerVisible, isHeaderContentVisible }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
    const moreDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
                setIsMoreDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    type NavLink = {
        name: string;
        href: string;
        onClick?: undefined;
    } | {
        name: string;
        href?: undefined;
        onClick: () => void;
    };
    
    const mainNavLinks: NavLink[] = [
        { name: '커뮤니티', href: 'https://dacon.io/community/forum' },
        { name: '대회', onClick: onCompetitionClick },
        { name: '학습', onClick: onLearningClick },
        { name: '랭킹', href: 'https://dacon.io/ranking/info' },
    ];

    const moreNavLinks: { name: string; href: string }[] = [
        { name: '공지사항', href: 'https://dacon.io/more/notice' },
        { name: '자주묻는 질문', href: 'https://dacon.io/more/faq' },
        { name: '데이콘 소개', href: 'https://about.dacon.io' },
    ];
    
    const mobileNavLinks: NavLink[] = [
        ...mainNavLinks,
        ...moreNavLinks,
    ];
    
    const isGlass = theme === 'glass';
    const isNeumorphic = theme === 'neumorphic';
    
    const headerClasses = isGlass
        ? "fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700"
        : isNeumorphic
        ? "fixed top-0 w-full z-50 bg-[#e0e5ec] border-b border-gray-300/50 shadow-[0px_8px_16px_#a3b1c6]"
        : "fixed top-0 w-full z-50 bg-white border-b-2 border-black";
    
    const navLinkClasses = isGlass
        ? "text-slate-300 hover:text-white px-3 py-2 rounded-md text-[16px] font-medium transition-colors duration-200"
        : isNeumorphic
        ? "text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-[16px] font-medium transition-colors duration-200"
        : "text-black hover:text-blue-600 px-3 py-2 rounded-md text-[16px] font-bold transition-colors duration-200";

    const bannerContainerClasses = isGlass
        ? "bg-gradient-to-r from-cyan-800 to-slate-900 text-white"
        : isNeumorphic
        ? "bg-gradient-to-r from-blue-100 via-gray-100 to-blue-50 text-gray-800 border-b border-gray-300/50"
        : "bg-yellow-300 text-black border-b-2 border-black";

    const bannerPromoBoxClasses = isGlass
        ? "bg-blue-500 text-white px-4 py-2 rounded-lg -rotate-3 transform shadow-lg text-center animate-text-glow"
        : isNeumorphic
        ? "bg-blue-200 text-blue-800 px-4 py-2 rounded-lg -rotate-3 transform shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-center"
        : "bg-white text-black px-4 py-2 rounded-md -rotate-3 transform text-center border-2 border-black shadow-[4px_4px_0_#000]";

    const bannerTextClasses = isGlass
        ? "hidden md:inline font-semibold text-lg"
        : isNeumorphic
        ? "hidden md:inline font-semibold text-lg text-slate-700"
        : "hidden md:inline font-bold text-lg";
        
    const bannerLinkClasses = isGlass
        ? "text-cyan-400 font-bold flex items-center text-lg hover:underline whitespace-nowrap animate-text-glow"
        : isNeumorphic
        ? "text-blue-700 font-bold flex items-center text-lg hover:underline whitespace-nowrap"
        : "text-blue-700 font-bold flex items-center text-lg hover:underline whitespace-nowrap";

    const dropdownPanelClasses = isGlass
        ? 'bg-slate-800/90 backdrop-blur-lg border border-slate-600'
        : isNeumorphic
        ? 'bg-[#e0e5ec] shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff]'
        : 'bg-white border-2 border-black shadow-[4px_4px_0_#000]';

    const dropdownItemClasses = isGlass
        ? 'block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50'
        : isNeumorphic
        ? 'block px-4 py-2 text-sm text-gray-600 hover:bg-white/50 rounded-md'
        : 'block px-4 py-2 text-sm text-black hover:bg-gray-100 font-semibold';

    return (
        <header className={headerClasses}>
            <div
                className={`
                    ${bannerContainerClasses}
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${isBannerVisible ? 'max-h-[74px] opacity-100' : 'max-h-0 opacity-0'}
                `}
                aria-hidden={!isBannerVisible}
            >
                <a
                    href="https://www.dacon.io/edu/online"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    tabIndex={isBannerVisible ? 0 : -1}
                >
                    {!bannerText ? (
                        <div className="max-w-7xl mx-auto flex items-center justify-center py-3 px-4 h-[74px]">
                            <div className={`animate-pulse w-full max-w-lg h-8 rounded-md ${
                                isGlass ? 'bg-slate-700/50' : isNeumorphic ? 'bg-gray-300' : 'bg-gray-200'
                            }`}></div>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-12 py-3 px-4 overflow-hidden h-[74px]">
                            <div className="flex items-center space-x-3 sm:space-x-6 animate-slide-in-left-bounce">
                                <div className={bannerPromoBoxClasses}>
                                    <p className="font-bold text-sm leading-tight whitespace-nowrap">{bannerText.tagLine1}</p>
                                    <p className={`font-bold text-lg sm:text-xl leading-tight whitespace-nowrap ${theme === 'neumorphic' && 'text-shadow-soft'}`}>{bannerText.tagLine2}</p>
                                </div>
                                <span className={bannerTextClasses}>{bannerText.slogan}</span>
                            </div>
                            <span className={`${bannerLinkClasses} animate-slide-in-right-bounce`}>
                                보러가기
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1.5 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                    )}
                </a>
            </div>

            <nav className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <a href="https://dacon.io/" target="_blank" rel="noopener noreferrer">
                                <img
                                    src="https://r2-images.dacon.co.kr/external/dacon-logo.svg"
                                    alt="DACON Logo"
                                    className="h-[18px]"
                                />
                            </a>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {mainNavLinks.map((link) => (
                                    'href' in link ?
                                    <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className={navLinkClasses}>{link.name}</a>
                                    : <button key={link.name} onClick={link.onClick} className={navLinkClasses}>{link.name}</button>
                                ))}
                                <div className="relative" ref={moreDropdownRef}>
                                    <button onClick={() => setIsMoreDropdownOpen(p => !p)} className={`${navLinkClasses} flex items-center gap-1`}>
                                        더보기
                                        <svg className={`w-4 h-4 transition-transform duration-200 ${isMoreDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                    {isMoreDropdownOpen && (
                                        <div className={`absolute top-full right-0 mt-2 w-40 rounded-lg shadow-lg z-10 origin-top-right ${dropdownPanelClasses}`}>
                                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                {moreNavLinks.map(link => (
                                                    <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className={`${dropdownItemClasses} w-full text-left block`} role="menuitem">
                                                        {link.name}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                         <ThemeToggle theme={theme} setTheme={setTheme} />
                        <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                type="button"
                                className={`ml-2 inline-flex items-center justify-center p-2 rounded-md ${isGlass ? 'text-slate-300 hover:text-white' : isNeumorphic ? 'text-gray-600 hover:text-blue-600' : 'text-black hover:bg-gray-100'} focus:outline-none`}
                                aria-controls="mobile-menu"
                                aria-expanded={isMenuOpen}
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMenuOpen ? (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {isMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {mobileNavLinks.map((link) => (
                           'href' in link ?
                           <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className={`${navLinkClasses} block`}>{link.name}</a>
                           : <button key={link.name} onClick={() => { link.onClick(); setIsMenuOpen(false); }} className={`${navLinkClasses} block w-full text-left`}>{link.name}</button>
                        ))}
                    </div>
                </div>
            )}
            
            <div 
                className={`
                    max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${isHeaderContentVisible ? 'h-20 py-4 opacity-100' : 'h-0 py-0 opacity-0'}
                `}
                aria-hidden={!isHeaderContentVisible}
            >
                {tickerItems && tickerItems.length > 0 && (
                    <Ticker items={tickerItems} theme={theme} />
                )}
            </div>
            
        </header>
    );
};

export default Header;