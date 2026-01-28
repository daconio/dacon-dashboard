
import React from 'react';

const TopBanner: React.FC = () => {
    return (
        <div className="bg-[#FFD400] text-black px-4 py-3 text-center text-sm sm:text-base font-medium relative z-50">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                <div className="flex items-center gap-2">
                    <span className="bg-white border border-black px-2 py-0.5 text-xs font-bold rounded shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
                        AI, 당신의 미래.
                    </span>
                    <span className="font-bold border-b border-black">58% 특별할인</span>
                </div>
                <span>대콘에서 잠재력을 깨우고 새로운 커리어를 시작하세요.</span>
                <a href="#" className="font-bold hover:underline flex items-center gap-1 ml-2">
                    보러가기
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </a>
            </div>
        </div>
    );
};

export default TopBanner;
