import React from 'react';

type Theme = 'glass' | 'neumorphic' | 'webtoon';

interface ManualModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
}

const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose, theme }) => {
    if (!isOpen) {
        return null;
    }

    const isGlass = theme === 'glass';
    const isNeumorphic = theme === 'neumorphic';

    const ManualSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="mb-6">
            <h4 className={`text-lg font-bold mb-2 pb-1 ${isGlass ? 'text-sky-300 border-b border-slate-500/50' : isNeumorphic ? 'text-blue-600 border-b border-gray-300/50' : 'text-black border-b-2 border-black'}`}>{title}</h4>
            <div className={`space-y-2 text-sm ${isGlass ? 'text-slate-300' : isNeumorphic ? 'text-gray-600' : 'text-gray-800'}`}>{children}</div>
        </div>
    );
    
    const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <span className={isGlass 
            ? "font-semibold text-slate-100 bg-slate-700/50 px-1.5 py-0.5 rounded-md border border-slate-600/50" 
            : isNeumorphic
            ? "font-semibold text-gray-700 bg-[#e0e5ec] px-1.5 py-0.5 rounded-md shadow-[3px_3px_6px_#a3b1c6,-3px_-3px_6px_#ffffff]"
            : "font-semibold text-black bg-gray-200 px-1.5 py-0.5 rounded-md border border-black"
        }>
            {children}
        </span>
    );
    
    const modalContainerClasses = isGlass 
        ? "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeInUp"
        : isNeumorphic
        ? "fixed inset-0 bg-gray-800/20 z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeInUp"
        : "fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeInUp";
    
    const modalPanelClasses = isGlass
        ? "bg-slate-800/70 backdrop-blur-lg border border-slate-500/30 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] p-4 sm:p-6 flex flex-col"
        : isNeumorphic
        ? "bg-[#e0e5ec] border border-white/50 rounded-2xl shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] w-full max-w-4xl max-h-[90vh] p-4 sm:p-6 flex flex-col"
        : "bg-white border-2 border-black rounded-lg shadow-[8px_8px_0_#000] w-full max-w-4xl max-h-[90vh] p-4 sm:p-6 flex flex-col";

    const headerClasses = isGlass
        ? "flex items-center justify-between pb-4 border-b border-slate-500/30 flex-shrink-0"
        : isNeumorphic
        ? "flex items-center justify-between pb-4 border-b border-gray-300/50 flex-shrink-0"
        : "flex items-center justify-between pb-4 border-b-2 border-black flex-shrink-0";
    
    const titleClasses = isGlass ? "text-xl sm:text-2xl font-bold text-slate-100" : isNeumorphic ? "text-xl sm:text-2xl font-bold text-slate-700 text-shadow-soft" : "text-xl sm:text-2xl font-bold text-black";

    const closeButtonClasses = isGlass
        ? "p-2 rounded-full transition-all duration-200 bg-slate-700/50 hover:bg-slate-600/70"
        : isNeumorphic
        ? "p-2 rounded-full transition-all duration-300 transform shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-gray-700 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1 active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff]"
        : "p-2 rounded-md transition-all duration-200 bg-white text-black border-2 border-black hover:bg-gray-100";

    return (
        <div 
            className={modalContainerClasses} 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true"
            id="manual-modal"
        >
            <div 
                className={modalPanelClasses}
                onClick={e => e.stopPropagation()}
            >
                <header className={headerClasses}>
                    <h3 className={titleClasses}>사이트 이용 매뉴얼</h3>
                    <button 
                        onClick={onClose} 
                        className={closeButtonClasses} 
                        aria-label="매뉴얼 닫기"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isGlass ? 'text-slate-300' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className="overflow-y-auto flex-grow mt-4 pr-2 space-y-4">
                    <ManualSection title="👋 소개">
                        <p>데이콘 콘텐츠 대시보드에 오신 것을 환영합니다! 이 대시보드는 데이콘의 모든 <Key>대회</Key>, <Key>학습 강좌</Key>, <Key>기초 코드</Key>, <Key>학습 로드맵</Key>을 한 곳에서 쉽고 빠르게 탐색할 수 있도록 돕는 강력한 원스톱 서비스입니다.</p>
                    </ManualSection>

                    <ManualSection title="✨ 주요 기능">
                        <p><strong>테마 전환:</strong> 헤더의 아이콘 버튼으로 사이트 디자인을 '글래스모피즘', '뉴로모피즘', '웹툰' 3가지 스타일로 자유롭게 전환할 수 있습니다.</p>
                        <p><strong>특별 카드:</strong> 대회 목록 첫 페이지에는 두 가지 특별한 정보 카드가 있습니다.
                            <br/>- <Key>예정 대회 카드:</Key> 곧 열릴 주요 대회 목록을 미리 알려주어 중요한 기회를 놓치지 않게 도와줍니다.
                            <br/>- <Key>AI 필수 지식 카드:</Key> AI가 생성하는 데이터 사이언티스트를 위한 필수 지식과 꿀팁을 제공합니다. <Key>새로고침</Key> 버튼으로 새로운 팁을 얻어보세요!
                        </p>
                        <p><strong>실시간 티커:</strong> 화면 상단에 흐르는 텍스트로, 데이콘의 전체 대회 및 학습 콘텐츠 관련 핵심 통계를 실시간으로 보여줍니다.</p>
                    </ManualSection>

                    <ManualSection title="🔄️ 화면 보기 모드 및 탐색">
                        <p>상단 필터 영역의 버튼들을 통해 다양한 콘텐츠 뷰로 전환할 수 있습니다.</p>
                        <p><strong>대회 그룹:</strong>
                            <br/>- <Key>대회:</Key> 모든 AI 경진대회(진행중, 종료, 연습)를 탐색합니다.
                            <br/>- <Key>데이터:</Key> 데이터 다운로드가 가능한 대회 목록만 필터링하여 보여줍니다.
                            <br/>- <Key>코드:</Key> 대회별 베이스라인 코드를 생성AI, NLP 등 카테고리별로 모아봅니다.
                        </p>
                        <p><strong>학습 그룹:</strong>
                            <br/>- <Key>학습:</Key> 모든 강좌, 해커톤, 랭커특강을 한 곳에서 볼 수 있습니다. <Key>강좌</Key>, <Key>해커톤</Key>, <Key>랭커특강</Key> 버튼으로 세부 필터링도 가능합니다.
                            <br/>- <Key>로드맵:</Key> '직장인', '입문자' 등 나의 페르소나를 선택하면 맞춤형 학습 경로를 추천해주는 'AI 탐험가 로드맵'을 시작할 수 있습니다.
                        </p>
                    </ManualSection>
                    
                    <ManualSection title="🔍 통합 검색 및 필터링">
                        <p><strong>통합 키워드 검색:</strong> 검색창 하나로 <Key>대회, 강좌, 코드</Key> 등 모든 콘텐츠를 한 번에 검색하세요.</p>
                        <p className="pl-4">
                            - <strong>AI 확장 검색:</strong> 검색어를 입력하면 AI가 연관 키워드를 자동으로 추천하여 더 풍부한 검색 결과를 제공합니다. (예: '의료' 검색 시 'medical', '병원' 등 확장)
                        </p>
                        <p className="pl-4">
                            - <strong>검색어 제안:</strong> 검색창을 클릭하면 <Key>최근 검색어</Key>와 <Key>인기 키워드</Key>가 표시되어 편리하게 재검색할 수 있습니다.
                        </p>
                        <p><strong>상세 필터:</strong> 현재 보고 있는 화면 모드에 따라 최적화된 필터가 제공됩니다.
                            <br />- <Key>대회 보기 시:</Key> 상태(진행중/종료), 유형(알고리즘/아이디어), 기간별로 필터링합니다.
                            <br />- <Key>학습 보기 시:</Key> 종류(강좌/해커톤), 인기 키워드, 난이도별로 필터링합니다.
                            <br />- <Key>코드 보기 시:</Key> 기술 카테고리별로 필터링합니다.
                        </p>
                         <p><strong>정렬:</strong> 대회 목록에서는 <Key>최신순</Key>, <Key>마감 임박순</Key>, <Key>참가자순</Key>, <Key>상금순</Key>으로, 학습 목록에서는 <Key>신규순</Key>, <Key>난이도순</Key> 등으로 정렬할 수 있습니다.</p>
                    </ManualSection>
                    
                    <ManualSection title="🔧 기타 편의 기능">
                        <p><Key>초기화</Key> 버튼을 누르면 모든 검색, 필터, 정렬 조건이 초기 상태로 돌아갑니다.</p>
                        <p>각 콘텐츠 카드를 클릭하면 해당 상세 정보 페이지(dacon.io)로 바로 이동합니다.</p>
                    </ManualSection>
                </div>
            </div>
        </div>
    );
};

export default ManualModal;