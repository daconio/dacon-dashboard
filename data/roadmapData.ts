import type { DaySchoolCourse } from '../types';
import { daySchoolCourses } from './daySchoolCourses';

// Helper to find a course by its title substring
const findCourse = (titleSubstring: string): DaySchoolCourse | undefined => {
    const lowerSubstr = titleSubstring.toLowerCase();
    return daySchoolCourses.find(c => c.title.toLowerCase().includes(lowerSubstr));
};

export interface RoadmapStage {
    level: number;
    title: string;
    description: string;
    icon: 'sapling' | 'compass' | 'shield' | 'book' | 'quill' | 'wizard';
    courses: DaySchoolCourse[];
    projects: {
        title: string;
        description: string;
        choices: [DaySchoolCourse, DaySchoolCourse];
    } | null;
}

export interface PersonaData {
    key: 'challenger' | 'researcher' | 'developer' | 'analyst' | 'professional' | 'beginner' | 'enthusiast';
    title: string;
    icon: string;
    description: string;
    longDescription: string;
    stages: RoadmapStage[];
}

const professionalRoadmap: RoadmapStage[] = [
    {
        level: 1,
        title: "Lv.1 핵심 스킬 압축",
        description: "가장 중요한 기본기만 빠르게 습득합니다. 파이썬과 판다스로 데이터를 다루고, 강력한 LightGBM 모델로 첫 예측을 경험합니다.",
        icon: "sapling",
        courses: [
            findCourse("나도 할 수 있다! 파이썬: 상"),
            findCourse("파이썬으로 테이블 데이터 쉽게 다루기"),
            findCourse("LightGBM 활용하기"),
            findCourse("타이타닉 생존 예측 프로젝트"),
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 실전 분류 모델링",
            description: "비즈니스와 직결되는 두 가지 분류 문제 중 하나를 선택하여, 배운 내용을 실전에 바로 적용하는 능력을 증명하세요.",
            choices: [
                findCourse("신용카드 사용자 연체 예측 프로젝트"),
                findCourse("와인 품질 분류 프로젝트"),
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    },
    {
        level: 2,
        title: "Lv.2 성과를 내는 모델링",
        description: "모델의 성능을 극대화하고, 그 결과를 명확히 설명하는 방법을 배웁니다. 변수 생성, 앙상블, 시계열 예측 등 실무 핵심 기술을 연마합니다.",
        icon: "shield",
        courses: [
            findCourse("성능 향상을 위한 변수 조합 만들기"),
            findCourse("모델을 조합하여 성능 높이기: 상"),
            findCourse("AI판단 해석하기: 상"),
            findCourse("주요 시계열 알고리즘 이해하기"),
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 시계열 예측 도전",
            description: "수요 예측, 시간 관리 등 직장에서 마주할 법한 시계열 문제를 해결하며 예측 역량을 한 단계 끌어올리세요.",
            choices: [
                findCourse("구내식당 인원 예측 프로젝트"),
                findCourse("버스 운행 시간 예측 프로젝트"),
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    },
    {
        level: 3,
        title: "Lv.3 비즈니스 가치 창출",
        description: "업무를 자동화하고 새로운 가치를 만드는 생성형 AI의 세계를 탐험합니다. LLM 챗봇과 자동화 툴로 당신의 업무 효율을 극대화하세요.",
        icon: "compass",
        courses: [
            findCourse("ChatGPT API를 사용해보자"),
            findCourse("LangChain으로 AI랑 대화하기"),
            findCourse("KPI 도출 아이디어 경진대회 기본학습"),
            findCourse("n8n 전문가처럼 시작하기"),
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 나만의 업무 자동화 툴 제작",
            description: "반복적인 업무를 해결해 줄 AI 챗봇이나 자동화 워크플로우를 직접 구축하여 '일잘러'로 거듭나세요.",
            choices: [
                findCourse("LangChain과 RAG를 활용한 서울시 정책 전문가 챗봇 만들기"),
                findCourse("n8n, 데이터분석 챗봇 프로젝트"),
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    }
];

const beginnerRoadmap: RoadmapStage[] = [
    {
        level: 1,
        title: "Lv.1 데이터와 첫 만남",
        description: "코딩이 처음이어도 괜찮아요. 파이썬의 기초 문법부터 시작해, 데이터를 눈으로 확인하는 시각화의 즐거움을 느껴봅니다.",
        icon: "sapling",
        courses: [
            findCourse("나도 할 수 있다! 파이썬: 상"),
            findCourse("나도 할 수 있다! 파이썬: 하"),
            findCourse("파이썬 시각화로 데이터 쉽게 알아보기"),
            findCourse("경진대회 플랫폼 분석 기본 학습"),
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 데이터 탐험가 되기",
            description: "데이터를 예측하기 전에 먼저 친해져야죠! 두 가지 재미있는 데이터셋 중 하나를 골라 자유롭게 탐색하고 시각화하며 숨겨진 이야기를 찾아보세요.",
            choices: [
                findCourse("재정 데이터 시각화 프로젝트"),
                findCourse("데이터로 유럽 여행 떠나기: 상"),
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    },
    {
        level: 2,
        title: "Lv.2 머신러닝 첫걸음",
        description: "AI의 핵심, 머신러닝의 기본 원리를 배웁니다. 회귀와 분류가 무엇인지 이해하고, 내 손으로 직접 첫 번째 예측 모델을 만들어봅니다.",
        icon: "book",
        courses: [
            findCourse("회귀분석 알아보기: 기초"),
            findCourse("데이터 분류 모델 만들기"),
            findCourse("머신러닝 사전 작업: 데이터 전처리"),
            findCourse("타이타닉 생존 예측 프로젝트"),
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 클래식 문제 정복",
            description: "수많은 데이터 과학자들이 거쳐간 가장 유명한 두 가지 문제에 도전하며 머신러닝의 기초를 완벽하게 마스터하세요.",
            choices: [
                findCourse("IRIS 품종 분류 프로젝트"),
                findCourse("보스턴 집값 예측 프로젝트"),
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    },
    {
        level: 3,
        title: "Lv.3 AI 세계관 확장",
        description: "머신러닝을 넘어, 이미지와 언어를 이해하는 딥러닝의 세계를 살짝 엿봅니다. 복잡한 이론보다는 '무엇을 할 수 있는지'에 집중하며 AI의 가능성을 넓혀갑니다.",
        icon: "compass",
        courses: [
            findCourse("인공지능 첫걸음: 상"),
            findCourse("컴퓨터는 사람의 말을 어떻게 이해할까?"),
            findCourse("딥러닝 시작하기: 상"),
            findCourse("AI로 이미지 분류 해보기: CNN 기초"),
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 새로운 데이터에 도전",
            description: "이제 정형 데이터를 넘어 이미지와 같은 새로운 형태의 데이터에 도전할 시간입니다. 배운 내용을 바탕으로 간단한 딥러닝 문제를 해결해보세요.",
            choices: [
                findCourse("손 글씨(숫자) 분류 AI 해커톤"),
                findCourse("영화 관객 수 예측 프로젝트"),
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    }
];

const enthusiastRoadmap: RoadmapStage[] = [
    {
        level: 1,
        title: "Lv.1 전력질주 기초",
        description: "기초는 빠르게, 실전은 강력하게. 파이썬과 핵심 라이브러리를 속성으로 익히고, 곧바로 대회 우승자들이 사용하는 부스팅 모델에 도전합니다.",
        icon: "sapling",
        courses: [
            findCourse("파이썬으로 테이블 데이터 쉽게 다루기"),
            findCourse("LightGBM 활용하기"),
            findCourse("모델을 조합하여 성능 높이기: 상"),
            findCourse("신용카드 사용자 연체 예측 프로젝트"),
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 현실 문제 해결",
            description: "단순한 예제를 넘어, 실제 비즈니스 현장에서 마주할 법한 복잡한 문제에 도전하여 당신의 잠재력을 증명하세요.",
            choices: [
                findCourse("자동차 보험사기 탐지 AI해커톤"),
                findCourse("고객 대출등급 분류 기본 학습"),
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    },
    {
        level: 2,
        title: "Lv.2 딥러닝 도메인 정복",
        description: "현대 AI의 3대 핵심 분야인 이미지, 시계열, 자연어를 동시에 정복합니다. 딥러닝 프레임워크를 다루고, 각 분야의 대표 모델들을 직접 구현합니다.",
        icon: "compass",
        courses: [
            findCourse("파이토치로 딥러닝 시작하기: 상"),
            findCourse("CNN 사전학습 모델 알아보기"),
            findCourse("LSTM을 이용한 시계열 예측"),
            findCourse("어텐션 메카니즘과 자연어 처리"),
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 딥러닝 모델 실전 적용",
            description: "이미지와 시계열, 두 가지 다른 종류의 데이터에 딥러닝 모델을 직접 적용하여, 다양한 도메인을 다루는 능력을 키웁니다.",
            choices: [
                findCourse("패션 의류 이미지 분류 프로젝트 1"),
                findCourse("서울시 평균기온 예측 프로젝트"),
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    },
    {
        level: 3,
        title: "Lv.3 최신 AI 기술 탐험",
        description: "가장 뜨거운 기술, 생성형 AI의 최전선으로 향합니다. RAG, LangGraph, AI 에이전트 등 현재 가장 주목받는 기술들을 직접 다뤄봅니다.",
        icon: "wizard",
        courses: [
            findCourse("LangChain과 함께 RAG 이해하기"),
            findCourse("AI 에이전트 첫걸음"),
            findCourse("LangGraph 데이터 분석 자동화"),
            findCourse("GraphRAG 개념 이해하기"),
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 지능형 에이전트 구축",
            description: "단순한 모델을 넘어, 스스로 작업을 계획하고 실행하는 AI 에이전트를 만들어보세요. 당신의 아이디어로 AI의 미래를 만듭니다.",
            choices: [
                findCourse("LangChain과 RAG를 활용한 서울시 정책 전문가 챗봇 만들기"),
                findCourse("LangGraph로 만드는 자기소개서"),
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    }
];

const challengerRoadmap: RoadmapStage[] = [
    {
        level: 1,
        title: "Lv.1 랭킹 입문을 위한 기초 체력",
        description: "모든 대회는 탄탄한 기초에서 시작됩니다. 파이썬과 판다스로 데이터를 다루는 법을 익히고, 첫 예측 모델을 만들어봅니다.",
        icon: "sapling",
        courses: [
            findCourse("나도 할 수 있다! 파이썬: 상"),
            findCourse("파이썬으로 테이블 데이터 쉽게 다루기"),
            findCourse("타이타닉 생존 예측 프로젝트"),
            findCourse("와인 품질 분류 프로젝트")
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 첫 실전 예측",
            description: "기초 회귀 모델링 실력을 증명할 시간입니다! 두 가지 예측 퀘스트 중 하나를 선택하여 완료하세요.",
            choices: [
                findCourse("영화 관객 수 예측 프로젝트"),
                findCourse("따릉이 대여량 예측 프로젝트")
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    },
    {
        level: 2,
        title: "Lv.2 성능 향상을 위한 전략",
        description: "단순한 모델을 넘어, 성능을 한 단계 끌어올릴 비장의 무기를 연마합니다. 변수 생성과 부스팅 모델의 힘을 느껴보세요.",
        icon: "shield",
        courses: [
            findCourse("성능 향상을 위한 변수 조합 만들기"),
            findCourse("LightGBM 활용하기"),
            findCourse("모델을 조합하여 성능 높이기: 상"),
            findCourse("신용카드 사용자 연체 예측 프로젝트")
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 고급 분류 모델링",
            description: "더 복잡한 실제 문제에 도전하여 당신의 분류 모델링 실력을 한 단계 끌어올리세요.",
            choices: [
                findCourse("자동차 보험사기 탐지 AI해커톤"),
                findCourse("고객 대출등급 분류 기본 학습")
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    },
    {
        level: 3,
        title: "Lv.3 특정 도메인 정복",
        description: "정형 데이터를 넘어, 이미지와 시계열이라는 새로운 영역에 도전합니다. 각 데이터에 맞는 특화된 기술을 익힙니다.",
        icon: "compass",
        courses: [
            findCourse("주요 시계열 알고리즘 이해하기"),
            findCourse("LSTM을 이용한 시계열 예측"),
            findCourse("AI로 이미지 분류 해보기: CNN 기초"),
            findCourse("CNN 사전학습 모델 알아보기")
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 특수 데이터셋 도전",
            description: "이미지 또는 시계열 데이터셋을 선택하여, 배운 기술을 실전에 적용하고 모델을 성공적으로 훈련시켜보세요.",
            choices: [
                findCourse("패션 의류 이미지 분류 프로젝트 1"),
                findCourse("서울시 평균기온 예측 프로젝트")
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    }
];

const researcherRoadmap: RoadmapStage[] = [
    {
        level: 1,
        title: "Lv.1 AI 연구의 첫걸음",
        description: "위대한 연구는 질문에서 시작됩니다. 파이썬으로 아이디어를 구현하고, 회귀/분류의 기본 원리를 탐구합니다.",
        icon: "sapling",
        courses: [
            findCourse("나도 할 수 있다! 파이썬: 상"),
            findCourse("회귀분석 알아보기: 기초"),
            findCourse("데이터 분류 모델 만들기"),
            findCourse("퍼즐 이미지 순서 예측 기본 학습")
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 기초 알고리즘 구현",
            description: "두 가지 기본적인 머신러닝 문제 중 하나를 선택하여, 이론을 코드로 옮기는 능력을 증명하세요.",
            choices: [
                findCourse("보스턴 집값 예측 프로젝트"),
                findCourse("IRIS 품종 분류 프로젝트")
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    },
    {
        level: 2,
        title: "Lv.2 딥러닝 이론 탐구",
        description: "현대 AI의 심장, 딥러닝의 세계로 들어갑니다. 파이토치로 신경망을 구축하고 CNN과 LSTM의 구조를 파헤칩니다.",
        icon: "book",
        courses: [
            findCourse("파이토치로 딥러닝 시작하기: 상"),
            findCourse("파이토치로 딥러닝 시작하기: 하"),
            findCourse("AI로 이미지 분류 해보기: CNN 기초"),
            findCourse("LSTM을 이용한 시계열 예측: 서울 날씨 예측하기")
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 딥러닝 모델 설계",
            description: "이미지와 시계열 데이터에 각각 CNN과 LSTM 모델을 적용하여 딥러닝의 기초를 마스터하세요.",
            choices: [
                findCourse("저해상도 이미지 분류 AI 경진대회 기본학습"),
                findCourse("비트코인 가격 예측 기본학습")
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    },
    {
        level: 3,
        title: "Lv.3 자연어 처리와 최신 트렌드",
        description: "언어의 비밀을 푸는 열쇠, 자연어 처리를 배웁니다. 어텐션 메커니즘부터 RAG까지, 최신 기술의 정수를 맛보세요.",
        icon: "wizard",
        courses: [
            findCourse("어텐션 메카니즘과 자연어 처리"),
            findCourse("LangChain과 함께 RAG 이해하기"),
            findCourse("AI판단 해석하기: 상"),
            findCourse("GraphRAG 개념 이해하기")
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 고급 NLP 모델링",
            description: "문맥을 이해하고 감성을 분석하는 등, 복잡한 자연어 처리 문제에 도전하여 당신의 연구 역량을 증명하세요.",
            choices: [
                findCourse("문맥 기반 문장 순서 예측 AI 경진대회"),
                findCourse("식당 리뷰 감성 분석 해커톤 기본학습")
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    }
];

const developerRoadmap: RoadmapStage[] = [
    {
        level: 1,
        title: "Lv.1 서비스 개발의 A to Z",
        description: "AI 서비스를 만들기 위한 첫 단추를 꿰어봅니다. 파이썬 기초를 다지고, ChatGPT API를 활용해 간단한 결과물을 만듭니다.",
        icon: "sapling",
        courses: [
            findCourse("나도 할 수 있다! 파이썬: 상"),
            findCourse("파이썬 함수 마스터하기"),
            findCourse("ChatGPT API를 사용해보자"),
            findCourse("프롬프트! 이것만 알아도 된다고?: 상")
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 첫 API 연동 서비스",
            description: "두 가지 아이디어 중 하나를 선택하여, 외부 API를 활용하는 나만의 첫 AI 기반 서비스를 만들어보세요.",
            choices: [
                findCourse("도배 하자 질의 응답 기본 학습"),
                findCourse("소득 예측 기본학습")
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    },
    {
        level: 2,
        title: "Lv.2 LLM 기반 애플리케이션 구축",
        description: "이제 본격적으로 LLM을 활용한 서비스를 만듭니다. LangChain으로 뼈대를 세우고, RAG로 똑똑한 챗봇을 구현합니다.",
        icon: "quill",
        courses: [
            findCourse("LangChain으로 AI랑 대화하기"),
            findCourse("LangChain과 함께 RAG 이해하기"),
            findCourse("스트림릿을 활용한 LLM 모델 실행"),
            findCourse("LangChain과 함께 RAG 활용하기: 상")
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 나만의 지식 챗봇 만들기",
            description: "특정 분야의 전문가 챗봇을 만들어보세요. LangChain과 RAG를 활용하여 아이디어를 현실로 구현합니다.",
            choices: [
                findCourse("LangChain과 RAG를 활용한 서울시 정책 전문가 챗봇 만들기"),
                findCourse("RAG 이해와 실습: 건강 지식 챗봇 만들기")
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    },
    {
        level: 3,
        title: "Lv.3 AI 에이전트와 자동화",
        description: "단순한 챗봇을 넘어, 스스로 생각하고 행동하는 AI 에이전트를 만듭니다. LangGraph와 n8n으로 복잡한 작업을 자동화하세요.",
        icon: "compass",
        courses: [
            findCourse("AI 에이전트 첫걸음"),
            findCourse("AI 에이전트와 LangGraph의 기초 (1)"),
            findCourse("n8n 전문가처럼 시작하기"),
            findCourse("LangGraph 데이터 분석 자동화")
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 자동화 워크플로우 구축",
            description: "LLM 에이전트와 자동화 툴을 결합하여, 복잡한 문제를 해결하는 나만의 자동화 솔루션을 만들어보세요.",
            choices: [
                findCourse("LangGraph로 만드는 자기소개서"),
                findCourse("n8n, 데이터분석 챗봇 프로젝트")
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    }
];

const analystRoadmap: RoadmapStage[] = [
    {
        level: 1,
        title: "Lv.1 데이터와 친해지기",
        description: "데이터 분석의 첫걸음은 데이터를 이해하고 깔끔하게 정리하는 것입니다. 파이썬과 판다스로 데이터를 불러오고, 시각화를 통해 데이터의 첫인상을 파악합니다.",
        icon: "sapling",
        courses: [
            findCourse("나도 할 수 있다! 파이썬: 상"),
            findCourse("파이썬으로 테이블 데이터 쉽게 다루기"),
            findCourse("파이썬 시각화로 데이터 쉽게 알아보기"),
            findCourse("경진대회 플랫폼 분석 기본 학습")
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 첫 데이터 탐험 보고서",
            description: "두 가지 실제 데이터셋 중 하나를 선택하여, 당신의 첫 탐색적 데이터 분석(EDA)을 수행하고 간단한 시각화를 만들어보세요.",
            choices: [
                findCourse("재정 데이터 시각화 프로젝트"),
                findCourse("이커머스 고객 세분화 분석 아이디어 경진대회")
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    },
    {
        level: 2,
        title: "Lv.2 인사이트 발굴하기",
        description: "데이터를 깊이 파고들어 숨겨진 패턴과 의미를 찾아냅니다. 통계적 기법을 배우고, 비즈니스 문제를 정의하여 데이터 기반의 해결책을 모색합니다.",
        icon: "compass",
        courses: [
            findCourse("데이터로 유럽 여행 떠나기: 상"),
            findCourse("KPI 도출 아이디어 경진대회 기본학습"),
            findCourse("머신러닝 사전 작업: 데이터 전처리"),
            findCourse("어울리지 않는 데이터 찾아내기: 이상치 탐지")
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 비즈니스 문제 해결",
            description: "실제 비즈니스 시나리오에 기반한 두 가지 문제 중 하나를 선택하여, 데이터 분석을 통해 구체적인 해결 방안이나 전략을 제시하세요.",
            choices: [
                findCourse("학습 플랫폼 이용자수 예측 프로젝트"),
                findCourse("구내식당 인원 예측 프로젝트")
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    },
    {
        level: 3,
        title: "Lv.3 스토리로 설득하기",
        description: "분석 결과를 명확하고 설득력 있는 스토리로 전달하는 기술을 연마합니다. 복잡한 분석 결과를 시각화하고, AI를 활용해 보고서 작성을 자동화합니다.",
        icon: "quill",
        courses: [
            findCourse("AI판단 해석하기: 상"),
            findCourse("LangGraph 데이터 분석 자동화"),
            findCourse("n8n, 데이터분석 챗봇 프로젝트"),
            findCourse("2023 NH 투자증권 빅데이터 경진대회"),
        ].filter(Boolean) as DaySchoolCourse[],
        projects: {
            title: "⚔️ 프로젝트 퀘스트: 자동화된 분석 리포트",
            description: "AI를 활용하여 데이터 분석 과정을 자동화하고, 그 결과를 바탕으로 한 리포트나 챗봇을 만들어 당신의 분석 결과를 효과적으로 전달하세요.",
            choices: [
                findCourse("AI판단 해석하기: 하"),
                findCourse("LangChain과 RAG를 활용한 서울시 정책 전문가 챗봇 만들기")
            ].filter(Boolean) as [DaySchoolCourse, DaySchoolCourse]
        }
    }
];

export const personas: PersonaData[] = [
    {
        key: 'professional',
        title: '결과로 증명하는 직장인',
        icon: '⚡️',
        description: '핵심만 빠르게 배워 실무에 바로 적용하고 싶은 분',
        longDescription: '바쁜 일상 속, AI 역량을 가장 효율적으로 장착하는 최단 경로를 안내합니다. 이 경로는 불필요한 이론은 덜어내고, 실무에서 가장 강력한 효과를 발휘하는 핵심 기술과 도구 중심으로 구성되어 있습니다.',
        stages: professionalRoadmap
    },
    {
        key: 'beginner',
        title: 'AI와 이제 막 친해지고 싶은 비전공자',
        icon: '🌱',
        description: '코딩과 AI가 처음이라, 차근차근 기초부터 탄탄히 다지고 싶은 분',
        longDescription: 'AI라는 새로운 세계에 첫발을 내딛는 당신을 응원합니다. 이 경로는 코딩의 기초부터 머신러닝의 기본 원리까지, 복잡한 수식 없이 친절한 설명과 재미있는 실습으로 구성되어 AI와 점차 친해질 수 있도록 돕습니다.',
        stages: beginnerRoadmap
    },
    {
        key: 'enthusiast',
        title: '최신 기술을 섭렵하는 열정가',
        icon: '🔥',
        description: '최신 AI 기술 트렌드를 놓치지 않고, 다양한 도메인을 빠르게 정복하고 싶은 분',
        longDescription: 'AI의 무한한 가능성에 가슴이 뛰는 당신을 위한 급행 코스입니다. 이 경로는 기초를 빠르게 훑고, 이미지, 시계열, 자연어 처리를 넘어 최신 LLM 에이전트 기술까지, AI의 현재와 미래를 가장 빠르게 경험할 수 있도록 설계되었습니다.',
        stages: enthusiastRoadmap
    },
    {
        key: 'challenger',
        title: 'AI 경진대회 도전자',
        icon: '🏆',
        description: '대회 우승과 상위 랭킹을 목표로, 실전 모델링 기술과 성능 최적화에 집중하고 싶은 분',
        longDescription: '치열한 경쟁 속에서 당신의 모델을 최고로 만드세요. 이 경로는 데이터 전처리부터 고급 앙상블 기법까지, 대회 상위권을 차지하기 위한 실전 압축 전략으로 가득 차 있습니다.',
        stages: challengerRoadmap
    },
    {
        key: 'researcher',
        title: 'AI 연구원 지망생',
        icon: '🔬',
        description: 'AI 기술의 깊이 있는 이해를 바탕으로, 대학원 진학이나 R&D 직무를 꿈꾸는 분',
        longDescription: 'AI 기술의 근본 원리를 탐구하고 세상을 놀라게 할 새로운 아이디어를 발견하세요. 이 경로는 딥러닝의 수학적 기초부터 최신 논문의 핵심 아이디어까지, 미래의 AI 연구자를 위한 탄탄한 지식의 탑을 쌓아 올립니다.',
        stages: researcherRoadmap
    },
    {
        key: 'developer',
        title: 'AI 서비스 개발자',
        icon: '🚀',
        description: 'AI 모델을 활용하여 세상에 없던 새로운 서비스나 앱을 직접 만들고 싶은 분',
        longDescription: '아이디어를 현실로 만드는 가장 빠른 길을 안내합니다. 이 경로는 최신 LLM API 활용법부터 RAG, AI 에이전트 구축까지, 당신의 상상력을 코드 한 줄로 실현시키는 방법을 알려줍니다.',
        stages: developerRoadmap
    },
    {
        key: 'analyst',
        title: '데이터 스토리텔러',
        icon: '📊',
        description: '데이터 속 숨겨진 이야기를 찾아내 비즈니스 가치를 창출하고, 시각화를 통해 인사이트를 전달하는 데 흥미를 느끼는 분',
        longDescription: '숫자 너머의 의미를 발견하고, 데이터를 설득력 있는 이야기로 바꾸는 여정에 오신 것을 환영합니다. 이 경로는 효과적인 데이터 분석과 시각화 기술을 통해, 복잡한 데이터를 명확한 인사이트로 변환하고 비즈니스 의사결정에 기여하는 데이터 스토리텔러로 성장하는 길을 안내합니다.',
        stages: analystRoadmap
    }
];