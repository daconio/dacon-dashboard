import React, { useState, useEffect, useCallback } from 'react';

type Theme = 'glass' | 'neumorphic' | 'webtoon';

interface KnowledgeCardProps {
    animationIndex: number;
    className?: string;
    theme: Theme;
}

const staticTips = [
    { title: "AI 알고리즘 필수 지식", content: "훌륭한 모델은 깨끗한 데이터에서 시작됩니다. 모델링 시간의 80%를 데이터 정제 및 특징 공학에 투자하는 것을 두려워하지 마세요." },
    { title: "AI 서비스개발 필수 지식", content: "MVP(Minimum Viable Product)를 빠르게 구축하고 사용자 피드백을 통해 반복적으로 개선하는 것이 중요합니다. 처음부터 완벽한 서비스를 만들려고 하지 마세요." },
    { title: "AI 아이디어 필수 지식", content: "문제를 명확히 정의하는 것이 모든 것의 시작입니다. 해결하려는 문제가 무엇인지, 그리고 AI가 그 문제에 대한 최적의 해결책인지 깊이 고민해보세요." },
    { title: "데이터 전처리의 중요성", content: "결측치와 이상치를 어떻게 처리하느냐에 따라 모델의 성능이 크게 달라질 수 있습니다. 도메인 지식을 활용하여 데이터를 신중하게 다루세요." },
    { title: "피처 엔지니어링 팁", content: "새로운 변수를 창조하는 것은 모델 성능 향상의 핵심입니다. 기존 변수들을 조합하거나 변환하여 모델이 패턴을 더 잘 학습하도록 도와주세요." }
];

const WittyQuoteCard: React.FC<KnowledgeCardProps> = ({ animationIndex, className = '', theme }) => {
    const [knowledgeData, setKnowledgeData] = useState<{ title: string; content: string } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, animationIndex * 75); // Stagger delay
        return () => clearTimeout(timer);
    }, [animationIndex]);

    const getRandomTip = useCallback(() => {
        setIsLoading(true);
        // Simulate a short delay to provide visual feedback on refresh
        setTimeout(() => {
            const randomTip = staticTips[Math.floor(Math.random() * staticTips.length)];
            setKnowledgeData(randomTip);
            setIsLoading(false);
        }, 300);
    }, []);


    useEffect(() => {
        getRandomTip();
    }, [getRandomTip]);

    const handleRefresh = (e: React.MouseEvent) => {
        e.stopPropagation();
        getRandomTip();
    };
    
    const isGlass = theme === 'glass';
    const isNeumorphic = theme === 'neumorphic';

    const baseClasses = isGlass
        ? `bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl shadow-indigo-500/20 transition-all duration-300 flex flex-col h-full p-6 items-center justify-center text-center relative border border-purple-400/30`
        : isNeumorphic
        ? `bg-[#e0e5ec] rounded-2xl shadow-[inset_8px_8px_16px_#a3b1c6,inset_-8px_-8px_16px_#ffffff] transition-all duration-300 flex flex-col h-full p-6 items-center justify-center text-center relative`
        : `bg-blue-200 rounded-lg border-2 border-black shadow-[6px_6px_0_#000] transition-all duration-300 flex flex-col h-full p-6 items-center justify-center text-center relative`;
    
    const refreshButtonClasses = isGlass
        ? "p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
        : isNeumorphic
        ? "p-2 rounded-full transition-all duration-300 transform shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-gray-700 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1 active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff]"
        : "p-2 rounded-md bg-white border-2 border-black hover:bg-gray-100 transition-colors";

    return (
        <div className={`${baseClasses} ${isVisible ? 'animate-fadeInUp' : 'opacity-0'} ${className}`}>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${isGlass ? 'border-white' : 'border-blue-500'}`}></div>
                    <p className={`mt-4 text-sm ${isGlass ? 'text-white/80' : isNeumorphic ? 'text-gray-500' : 'text-black'}`}>AI 필수 지식 생성 중...</p>
                </div>
            ) : (
                <>
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={handleRefresh}
                            title="새로운 지식 생성"
                            className={refreshButtonClasses}
                            aria-label="Generate new knowledge tip"
                        >
                            <span className="text-xl" role="img" aria-label="새로고침">🔄</span>
                        </button>
                    </div>

                    <div className="flex-grow flex flex-col items-center justify-center">
                         <span role="img" aria-label="brain" className={`text-4xl mb-4 ${isGlass ? 'text-white animate-pulse-subtle' : isNeumorphic ? 'text-shadow-soft' : ''}`}>🧠</span>
                        {knowledgeData && (
                            <>
                                <h4 className={`text-lg font-bold mb-3 ${isGlass ? 'text-indigo-200' : isNeumorphic ? 'text-blue-600 text-shadow-soft' : 'text-black'}`}>{knowledgeData.title}</h4>
                                <p className={`text-md md:text-lg font-semibold leading-relaxed ${isGlass ? 'text-white text-shadow-elegant' : isNeumorphic ? 'text-gray-700' : 'text-black'}`}>
                                    {knowledgeData.content}
                                </p>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default WittyQuoteCard;