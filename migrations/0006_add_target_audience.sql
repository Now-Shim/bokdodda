-- 자료와 링크에 대상 구분 컬럼 추가

-- knowledge_base 테이블에 target_audience 컬럼 추가
ALTER TABLE knowledge_base ADD COLUMN target_audience TEXT DEFAULT 'both';

-- external_links 테이블에 target_audience 컬럼 추가  
ALTER TABLE external_links ADD COLUMN target_audience TEXT DEFAULT 'both';

-- target_audience 값: 'planner' (설계사용), 'manager' (관리자용), 'both' (공용)
