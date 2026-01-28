
export const DACON_API_BASE = 'https://app.dacon.io';
export const DACON_DEV_API_BASE = 'https://dev-app.dacon.io';

/**
 * 데이콘 플랫폼 데이터 접근을 위한 통합 API 서비스
 */
export const daconApi = {
    /**
     * 전체 경진대회 목록 조회
     */
    getCompetitions: async (offset = 0, range = 10000) => {
        const response = await fetch(`${DACON_API_BASE}/api/v1/competition/list?offset=${offset}&range=${range}`);
        if (!response.ok) throw new Error(`Competition API error: ${response.status}`);
        return response.json();
    },

    /**
     * 데이스쿨 학습 콘텐츠(강좌, 해커톤, 특강) 목록 조회
     */
    getEducationList: async () => {
        const response = await fetch(`${DACON_DEV_API_BASE}/api/v2/edu/getAllMainList`);
        if (!response.ok) throw new Error(`Education List API error: ${response.status}`);
        return response.json();
    },

    /**
     * 경진대회 핵심 통계 데이터 조회 (총 대회 수, 상금 등)
     */
    getCompetitionStats: async () => {
        const response = await fetch(`${DACON_API_BASE}/api/v1/main/cpt-stats`);
        if (!response.ok) throw new Error(`Competition Stats API error: ${response.status}`);
        return response.json();
    },

    /**
     * 데이스쿨 학습 통계 데이터 조회 (참여자 수, 레슨 수 등)
     */
    getEducationStats: async () => {
        const response = await fetch(`${DACON_API_BASE}/api/v2/edu/main`);
        if (!response.ok) throw new Error(`Education Stats API error: ${response.status}`);
        return response.json();
    }
};
