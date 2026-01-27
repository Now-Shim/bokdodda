-- 사용자 테이블 (설계사 및 관리자)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('planner', 'admin')), -- planner: 설계사, admin: 관리자
  phone TEXT,
  join_date DATE DEFAULT (DATE('now')),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 설계사 프로필 (추가 정보)
CREATE TABLE IF NOT EXISTS planner_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  -- 성향 및 스타일
  personality_type TEXT, -- MBTI 등
  sales_style TEXT, -- 영업 스타일 (공격적, 관계중심, 분석적 등)
  experience_years INTEGER DEFAULT 0,
  specialization TEXT, -- 전문 분야 (생명보험, 손해보험 등)
  strengths TEXT, -- 강점
  weaknesses TEXT, -- 약점/개선필요 영역
  -- 통계
  total_coaching_sessions INTEGER DEFAULT 0,
  total_training_completed INTEGER DEFAULT 0,
  -- 메타데이터
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI 코칭 세션
CREATE TABLE IF NOT EXISTS coaching_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  planner_id INTEGER NOT NULL,
  -- 세션 정보
  session_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  context TEXT NOT NULL, -- 현장 맥락 (상황 설명)
  situation_type TEXT, -- 상황 유형 (신규고객, 기존고객, 클레임처리 등)
  -- AI 분석 결과
  ai_analysis TEXT, -- AI의 상황 분석
  coaching_advice TEXT, -- 코칭 조언
  recommended_approach TEXT, -- 추천 접근법
  tacit_knowledge_applied TEXT, -- 적용된 암묵적 지식
  -- 피드백
  planner_feedback TEXT, -- 설계사 피드백
  effectiveness_rating INTEGER CHECK(effectiveness_rating BETWEEN 1 AND 5), -- 효과성 평가 (1-5)
  -- 메타데이터
  is_shared BOOLEAN DEFAULT 0, -- 관리자와 공유 여부
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 교육 프로그램
CREATE TABLE IF NOT EXISTS training_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 카테고리 (영업기법, 상품지식, 고객관리 등)
  difficulty TEXT CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER, -- 소요 시간 (분)
  content TEXT, -- 교육 내용
  learning_objectives TEXT, -- 학습 목표
  -- 통계
  enrollment_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  -- 메타데이터
  is_active BOOLEAN DEFAULT 1,
  created_by INTEGER, -- 생성한 관리자 ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 교육 프로그램 수강
CREATE TABLE IF NOT EXISTS training_enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  planner_id INTEGER NOT NULL,
  program_id INTEGER NOT NULL,
  -- 진행 상황
  status TEXT DEFAULT 'enrolled' CHECK(status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
  progress_percent INTEGER DEFAULT 0 CHECK(progress_percent BETWEEN 0 AND 100),
  -- 평가
  completion_date DATETIME,
  assessment_score INTEGER CHECK(assessment_score BETWEEN 0 AND 100),
  feedback TEXT, -- 수강 후기
  -- 메타데이터
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (program_id) REFERENCES training_programs(id) ON DELETE CASCADE,
  UNIQUE(planner_id, program_id) -- 중복 수강 방지
);

-- 관리자 인사이트 (공유된 코칭 세션 분석)
CREATE TABLE IF NOT EXISTS admin_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coaching_session_id INTEGER NOT NULL,
  admin_id INTEGER NOT NULL,
  -- 인사이트 내용
  insight_type TEXT, -- 유형 (패턴발견, 개선제안, 교육필요 등)
  insight_content TEXT NOT NULL,
  recommended_programs TEXT, -- 추천 교육 프로그램 ID들 (JSON 배열)
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
  -- 액션
  action_taken BOOLEAN DEFAULT 0,
  action_notes TEXT,
  -- 메타데이터
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coaching_session_id) REFERENCES coaching_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 플랫폼 학습 데이터 (재학습용)
CREATE TABLE IF NOT EXISTS platform_learning_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- 입력 데이터
  situation_context TEXT NOT NULL,
  planner_profile_snapshot TEXT, -- 당시 설계사 프로필 (JSON)
  -- 출력 데이터
  coaching_provided TEXT NOT NULL,
  -- 결과 데이터
  effectiveness_score REAL, -- 효과성 점수
  actual_outcome TEXT, -- 실제 결과
  planner_satisfaction INTEGER CHECK(planner_satisfaction BETWEEN 1 AND 5),
  -- 메타데이터
  source_session_id INTEGER, -- 원본 코칭 세션 ID
  is_validated BOOLEAN DEFAULT 0, -- 검증된 데이터인지
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_session_id) REFERENCES coaching_sessions(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_planner_profiles_user_id ON planner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_planner_id ON coaching_sessions(planner_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_date ON coaching_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_shared ON coaching_sessions(is_shared);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_planner_id ON training_enrollments(planner_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_program_id ON training_enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_status ON training_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_platform_learning_validated ON platform_learning_data(is_validated);
