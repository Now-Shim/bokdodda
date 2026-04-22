-- Gemini AI 3단계 분석 시스템을 위한 새 컬럼 추가

-- 1단계: AI 분석
ALTER TABLE coaching_sessions ADD COLUMN analyzed_question TEXT; -- 분석된 질문
ALTER TABLE coaching_sessions ADD COLUMN category TEXT; -- 카테고리
ALTER TABLE coaching_sessions ADD COLUMN key_points TEXT; -- 핵심 포인트

-- 2단계: 코칭 (근거 기반)
ALTER TABLE coaching_sessions ADD COLUMN coaching_point TEXT; -- 코칭 포인트
ALTER TABLE coaching_sessions ADD COLUMN coaching_evidence TEXT; -- 코칭 근거
ALTER TABLE coaching_sessions ADD COLUMN dialogue TEXT; -- 대화 스크립트
ALTER TABLE coaching_sessions ADD COLUMN learning_needs TEXT; -- 학습 필요 내용
ALTER TABLE coaching_sessions ADD COLUMN action_guidelines TEXT; -- 행동 지침

-- 3단계: 참조 자료
ALTER TABLE coaching_sessions ADD COLUMN reference_sources TEXT; -- JSON 형식의 참조 자료 배열

-- 인덱스 추가 (검색 최적화)
CREATE INDEX IF NOT EXISTS idx_sessions_category ON coaching_sessions(category);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON coaching_sessions(session_date);
