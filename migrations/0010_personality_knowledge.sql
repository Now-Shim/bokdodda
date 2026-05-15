-- 성향 분석 지식 관리 시스템
-- 디렉터가 업로드하는 성향 분석 관련 전문 지식

CREATE TABLE IF NOT EXISTS personality_knowledge (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- 지식 분류
  category TEXT NOT NULL CHECK(category IN ('theory', 'case', 'script', 'update')),
  -- theory: 이론 및 원칙
  -- case: 실전 사례
  -- script: 코칭 스크립트
  -- update: 업데이트 로그
  
  -- 제목 및 내용
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- 성향 필터 (어떤 성향에 적용할 것인가?)
  -- 쉼표로 구분된 성향 태그: "ESTJ,도파민형,현장파" 또는 "ALL" (모든 성향)
  personality_filter TEXT DEFAULT 'ALL',
  
  -- 적용 대상
  target_audience TEXT NOT NULL CHECK(target_audience IN ('planner', 'manager', 'both')),
  -- planner: 설계사만
  -- manager: 관리자만
  -- both: 둘 다
  
  -- 우선순위 (높을수록 AI가 우선 참조)
  priority INTEGER DEFAULT 5 CHECK(priority BETWEEN 1 AND 10),
  
  -- 활용 통계
  usage_count INTEGER DEFAULT 0,
  last_used_at DATETIME,
  
  -- 메타데이터
  created_by INTEGER NOT NULL, -- director user_id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_personality_knowledge_category ON personality_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_personality_knowledge_target ON personality_knowledge(target_audience);
CREATE INDEX IF NOT EXISTS idx_personality_knowledge_priority ON personality_knowledge(priority DESC);
CREATE INDEX IF NOT EXISTS idx_personality_knowledge_filter ON personality_knowledge(personality_filter);
