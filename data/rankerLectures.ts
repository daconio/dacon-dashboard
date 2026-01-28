import type { DaySchoolCourse } from '../types';

const defaultLectureProps: Omit<DaySchoolCourse, 'project_id' | 'title' | 'link' | 'status' | 'type'> = {
  summary_img_object_key: 'dacon-images/images/dayschool_thumbnail/default_lecture.png',
  difficulty: '고급',
  stage_count: '1',
  updated_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  duration_in_minutes: '60',
  tags: [{ tag_title: '랭커특강' }],
  participant_count: 0,
};


export const rankerLectures: DaySchoolCourse[] = [
  { project_id: 50001, title: 'ai_ann 님 | 수상으로 가는 지름길, Feature Engineering', link: 'https://dacon.io/forum/415368', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50002, title: '닉네임이다. | RAG는 실제 AI 서비스에 어떻게 적용될까?', link: 'https://dacon.io/forum/414978', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50003, title: '이힘찬 님 | 왜 AI는 너 말만 듣지? 그 비밀은 프롬프트 엔지니어링!', link: 'https://dacon.io/forum/414639', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50004, title: 'bullbear 님 | RAG의 핵심인 검색 기술에 대해 알려드려요!', link: 'https://dacon.io/forum/414298', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50005, title: '이힘찬 님 | 왜 모든 AI개발자가 RAG를 찾을까?', link: 'https://dacon.io/forum/414055', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50006, title: '닉네임 님 | LLM 활용법과 실전 적용 방법을 알려드려요!', link: 'https://dacon.io/forum/413792', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50007, title: 'KuriosKat 님 | 막막한 캡스톤 디자인! AI와 함께한다면?', link: 'https://dacon.io/forum/413615', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50008, title: '박솜 님 | AI 경진대회, 참가하면 뭐가 좋아요?', link: 'https://dacon.io/forum/413463', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50009, title: 'All_day 님 | AI 비전공자도 우승하는 기획법, 알려드려요!', link: 'https://dacon.io/forum/413429', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50010, title: 'hector21 님 | 함께 경진대회 상위권자의 노하우를 학습해요!', link: 'https://dacon.io/forum/413357', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50011, title: 'co1dtype 님 | 쌩초보를 위한 시계열 데이터 뽀개기!', link: 'https://dacon.io/forum/413071', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50012, title: '정새 님 | 비전 전문가의 문제 해결 방식을 배워보세요!', link: 'https://dacon.io/forum/412869', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50013, title: '고세구 님 | 대회를 통해 성장하는 방법을 배워보세요!', link: 'https://dacon.io/forum/412681', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50014, title: 'SungJinWi 님 | 랭커와 함께 빠르게 성장하는 방법을 알아보세요!', link: 'https://dacon.io/forum/412424', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50015, title: '재애애영 님 | 의료 데이터 도메인에 대해 알아보고 데이콘 상위권에 도전하세요!', link: 'https://dacon.io/forum/412176', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50016, title: '렛서팬더 님 | 금융 데이터를 다루는 실무자가 되어보세요!', link: 'https://dacon.io/forum/411938', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50017, title: 'lastdefiance20 님 | AI 전문가가 금융데이터를 분석하는 법', link: 'https://dacon.io/forum/411728', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50018, title: '중요한건꺾이지않는마음 님 | 데이터 분석의 최전선, 캐글 마스터와 만나다!', link: 'https://dacon.io/forum/411477', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50019, title: 'GNOEYHEAT 님 | 우승을 위한 전략과 기술을 마스터하세요!', link: 'https://dacon.io/forum/411215', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50020, title: 'Statistics 님 | 데이터 분석가 vs 데이터 분석可', link: 'https://dacon.io/forum/411573', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50021, title: 'BrainAI_이희원 님 | 승자의 코드 : 실제 경진대회 우승자의 강의!', link: 'https://dacon.io/forum/411280', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50022, title: '쥬혁이 님 | 국내 대기업 L사 해커톤 1위의 라이브코드 리뷰!', link: 'https://dacon.io/forum/411060', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50023, title: '금융분야 우승자 인터뷰 부대권 님', link: 'https://dacon.io/forum/410296', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50024, title: '금융분야 우승자 인터뷰 정회빈 님', link: 'https://dacon.io/forum/410298', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50025, title: '강우예측 우승자 인터뷰 최재민 님', link: 'https://dacon.io/forum/410299', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50026, title: '금융분야 우승자 인터뷰 지성민 님', link: 'https://dacon.io/forum/410300', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50027, title: '전력수요 우승자 인터뷰 최정명 님', link: 'https://dacon.io/forum/410301', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50028, title: '이세의 인공지능 님 | 컴알못 생물학도에서 데이콘 랭커가 되기까지!', link: 'https://dacon.io/forum/410768', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50029, title: 'datu 님 | 데이콘 New 챔피언과 AI학습 지름길 고민 해결!', link: 'https://dacon.io/forum/410560', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50030, title: '최정명 님 | 데이콘 챔피언에게 듣는 해커톤 정복 노하우', link: 'https://dacon.io/forum/410261', status: 'OPEN', type: 'lecture', ...defaultLectureProps },
  { project_id: 50031, title: '캐글 그랜드마스터 Abhishek Webinar Session', link: 'https://dacon.io/forum/406167', status: 'OPEN', type: 'lecture', ...defaultLectureProps }
];