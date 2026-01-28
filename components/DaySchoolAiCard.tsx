
import React, { useState, useEffect, useCallback } from 'react';

type Theme = 'glass' | 'neumorphic' | 'webtoon';

interface RecommendationData {
    title: string;
    recommendations: {
        course_title: string;
        reason: string;
    }[];
    tip: string;
}

const staticRecommendations: RecommendationData[] = [
    {
        title: "AI 경진대회, 첫걸음 떼기",
        recommendations: [
            { course_title: "파이썬 첫걸음: 데이터 분석의 기초", reason: "모든 데이터 분석의 시작은 파이썬입니다. 기본 문법과 데이터 구조를 익혀보세요." },
            { course_title: "판다스(Pandas) 활용하기: 데이터 가공의 기술", reason: "데이터를 자유자재로 다룰 수 있게 해주는 필수 라이브러리, 판다스를 마스터하세요." },
            { course_title: "타이타닉 생존 예측: 나의 첫 머신러닝", reason: "실제 데이터를 바탕으로 머신러닝 모델링의 전체 과정을 경험하며 자신감을 키울 수 있습니다." }
        ],
        tip: "경진대회는 순위보다 '완주'가 중요합니다. 다른 사람의 코드를 따라쳐보며 배우는 것도 훌륭한 학습 방법입니다!"
    },
    {
        title: "모델 성능, 한 단계 레벨업!",
        recommendations: [
            { course_title: "LightGBM 활용하기: 예측 모델의 왕도", reason: "대부분의 정형 데이터 경진대회에서 우승자들이 사용하는 강력한 부스팅 모델입니다." },
            { course_title: "시계열 데이터 이해하기: 시간의 흐름 속 패턴 찾기", reason: "주가, 날씨, 판매량 등 시간 순서가 중요한 데이터를 다루는 법을 배웁니다." },
            { course_title: "AI로 이미지 분류 해보기: CNN 기초", reason: "이미지 인식의 기본이 되는 CNN 모델의 원리를 이해하고 직접 구현해보세요." }
        ],
        tip: "상위권 참가자들의 코드를 분석(Fork)하는 것은 성능 향상을 위한 가장 빠른 지름길 중 하나입니다."
    }
];

interface DaySchoolAiCardProps {
    theme: Theme;
}

const DaySchoolAiCard: React.FC<DaySchoolAiCardProps> = ({ theme }) => {
    const [data, setData] = useState<RecommendationData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const getRandomRecommendation = useCallback(() => {
        setIsLoading(true);
        // Simulate a short delay for visual feedback
        setTimeout(() => {
            const randomRecGroup = staticRecommendations[Math.floor(Math.random() * staticRecommendations.length)];
            // Randomly select one recommendation from the chosen group to display
            const singleRecommendation = randomRecGroup.recommendations[Math.floor(Math.random() * randomRecGroup.recommendations.length)];
            
            setData({
                ...randomRecGroup,
                recommendations: [singleRecommendation]
            });
            setIsLoading(false);
        }, 300);
    }, []);

    useEffect(() => {
        getRandomRecommendation();
    }, [getRandomRecommendation]);

    const handleRefresh = (e: React.MouseEvent) => {
        e.stopPropagation();
        getRandomRecommendation();
    };

    const isGlass = theme === 'glass';
    const isNeumorphic = theme === 'neumorphic';
    
    const containerClasses = `dayschool-ai-card p-6 rounded-2xl flex flex-col relative animate-fadeInUp`;

    const refreshButtonClasses = isGlass
        ? "p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
        : isNeumorphic
        ? "p-2 rounded-full transition-all duration-300 transform shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-gray-700 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1 active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff]"
        : "p-2 rounded-md bg-white border-2 border-black hover:bg-gray-100 transition-colors";

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                    <div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${isGlass ? 'border-white' : 'border-blue-500'}`}></div>
                    <p className={`mt-4 text-sm ${isGlass ? 'text-white/80' : isNeumorphic ? 'text-gray-500' : 'text-black'}`}>AI가 맞춤 강좌를 추천하는 중...</p>
                </div>
            );
        }

        if (!data) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center min-h-[200px]">
                    <p className={`text-red-500`}>추천 데이터를 불러올 수 없습니다.</p>
                </div>
            );
        }

        return (
            <>
                <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold pr-12 dayschool-ai-card-title">{data.title}</h3>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 flex-grow">
                    {data.recommendations.map((rec, index) => (
                        <div key={index} className="dayschool-ai-rec-item p-4 rounded-lg">
                            <h4 className="font-bold dayschool-ai-rec-title">{rec.course_title}</h4>
                            <p className="mt-1 text-sm dayschool-ai-rec-reason">{rec.reason}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t dayschool-ai-tip-separator">
                    <p className="text-sm font-semibold dayschool-ai-tip-text">
                        <span className="mr-2" role="img" aria-label="light-bulb">💡</span>
                        {data.tip}
                    </p>
                </div>
            </>
        );
    };

    return (
        <div className={containerClasses}>
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={handleRefresh}
                    title="새로운 추천 생성"
                    className={refreshButtonClasses}
                    aria-label="Generate new AI recommendations"
                >
                    <span className="text-xl" role="img" aria-label="새로고침">🔄</span>
                </button>
            </div>
            {renderContent()}
        </div>
    );
};

export default DaySchoolAiCard;
