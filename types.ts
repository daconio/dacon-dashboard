export interface Competition {
  cpt_id: number;
  name: string;
  name_eng: string;
  period_start: string;
  period_end: string;
  user_count: number;
  team_count: number | null;
  prize_info: string | null;
  period_dday: number;
  on_going: number; // 1 for ongoing, 0 for ended
  keyword: string;
  practice: number;
  estimated_capacity?: number | null;
  url?: string;
}

export interface DaySchoolCourse {
  project_id: number;
  title: string;
  summary_img_object_key: string;
  difficulty: string;
  status: 'NEW' | 'OPEN' | string;
  stage_count: string;
  updated_at: string;
  created_at: string;
  duration_in_minutes: string;
  tags: { tag_title: string }[];
  participant_count: number;
  link: string;
  type: 'course' | 'hackathon' | 'lecture';
}

export type BaseCodeCategory = '생성AI' | 'NLP' | '정형' | '전처리' | '데이터분석' | '비전';

export interface BaseCodeItem {
  id: number;
  category: BaseCodeCategory;
  title: string;
  url: string;
  keywords: string[];
}

export type ViewMode = 'list' | 'basecode' | 'dayschool' | 'roadmap' | 'competition_roadmap';