-- ==========================================
-- 북돋다 프로덕션 데이터베이스 초기화 스크립트
-- ==========================================

-- 1. 테이블 생성 (스키마)
-- 사용자 테이블 (설계사 및 관리자)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('planner', 'admin', 'director', 'manager')),
  phone TEXT,
  join_date DATE DEFAULT (DATE('now')),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 설계사 프로필 (추가 정보)
CREATE TABLE IF NOT EXISTS planner_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  personality_type TEXT,
  sales_style TEXT,
  experience_years INTEGER DEFAULT 0,
  specialization TEXT,
  strengths TEXT,
  weaknesses TEXT,
  total_coaching_sessions INTEGER DEFAULT 0,
  total_training_completed INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI 코칭 세션
CREATE TABLE IF NOT EXISTS coaching_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  planner_id INTEGER NOT NULL,
  session_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  context TEXT NOT NULL,
  situation_type TEXT,
  coaching_point TEXT,
  coaching_evidence TEXT,
  dialogue TEXT,
  learning_needs TEXT,
  action_guidelines TEXT,
  planner_feedback TEXT,
  effectiveness_rating INTEGER CHECK(effectiveness_rating BETWEEN 1 AND 5),
  is_shared BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 교육 프로그램
CREATE TABLE IF NOT EXISTS training_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER,
  content TEXT,
  learning_objectives TEXT,
  enrollment_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 교육 프로그램 수강
CREATE TABLE IF NOT EXISTS training_enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  planner_id INTEGER NOT NULL,
  program_id INTEGER NOT NULL,
  status TEXT DEFAULT 'enrolled' CHECK(status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
  progress_percent INTEGER DEFAULT 0 CHECK(progress_percent BETWEEN 0 AND 100),
  completion_date DATETIME,
  assessment_score INTEGER CHECK(assessment_score BETWEEN 0 AND 100),
  feedback TEXT,
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (program_id) REFERENCES training_programs(id) ON DELETE CASCADE,
  UNIQUE(planner_id, program_id)
);

-- 관리자 인사이트
CREATE TABLE IF NOT EXISTS admin_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coaching_session_id INTEGER NOT NULL,
  admin_id INTEGER NOT NULL,
  insight_type TEXT,
  insight_content TEXT NOT NULL,
  recommended_programs TEXT,
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
  action_taken BOOLEAN DEFAULT 0,
  action_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coaching_session_id) REFERENCES coaching_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 플랫폼 학습 데이터
CREATE TABLE IF NOT EXISTS platform_learning_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  situation_context TEXT NOT NULL,
  planner_profile_snapshot TEXT,
  coaching_provided TEXT NOT NULL,
  effectiveness_score REAL,
  actual_outcome TEXT,
  planner_satisfaction INTEGER CHECK(planner_satisfaction BETWEEN 1 AND 5),
  source_session_id INTEGER,
  is_validated BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_session_id) REFERENCES coaching_sessions(id)
);

-- 코칭 대화 히스토리
CREATE TABLE IF NOT EXISTS coaching_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES coaching_sessions(id) ON DELETE CASCADE
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
CREATE INDEX IF NOT EXISTS idx_coaching_conversations_session_id ON coaching_conversations(session_id);

-- 2. 기본 사용자 데이터 삽입
INSERT OR REPLACE INTO users (id, email, password_hash, name, role, phone) VALUES
-- Director
(1, 'director@bukdotda.com', 'director123', '변방의 장수', 'director', '010-4652-8936'),

-- Manager  
(2, 'manager@bukdotda.com', 'manager123', '김관리 매니저', 'manager', '010-1111-2222'),

-- Planners (10명)
(11, 'planner01@bukdotda.com', 'demo123', '이영수', 'planner', '010-2001-0001'),
(12, 'planner02@bukdotda.com', 'demo123', '박민지', 'planner', '010-2002-0002'),
(13, 'planner03@bukdotda.com', 'demo123', '김철수', 'planner', '010-2003-0003'),
(14, 'planner04@bukdotda.com', 'demo123', '정수연', 'planner', '010-2004-0004'),
(15, 'planner05@bukdotda.com', 'demo123', '최동훈', 'planner', '010-2005-0005'),
(16, 'planner06@bukdotda.com', 'demo123', '강미래', 'planner', '010-2006-0006'),
(17, 'planner07@bukdotda.com', 'demo123', '윤서진', 'planner', '010-2007-0007'),
(18, 'planner08@bukdotda.com', 'demo123', '장현우', 'planner', '010-2008-0008'),
(19, 'planner09@bukdotda.com', 'demo123', '오지혜', 'planner', '010-2009-0009'),
(20, 'planner10@bukdotda.com', 'demo123', '서준호', 'planner', '010-2010-0010');

-- 3. Planner 프로필 데이터
INSERT OR REPLACE INTO planner_profiles (user_id, personality_type, sales_style, experience_years, specialization, strengths, weaknesses) VALUES
(11, 'ESTJ', '분석적', 5, '생명보험', '체계적인 상품 설명, 논리적 설득', '감성적 공감 부족'),
(12, 'ENFP', '관계중심', 3, '손해보험', '친근한 관계 형성, 고객 니즈 파악', '계약 클로징 약함'),
(13, 'ISTJ', '공격적', 8, '생명보험', '빠른 계약 체결, 목표 달성력', '장기 관계 유지 어려움'),
(14, 'INFJ', '관계중심', 2, '종합보험', '고객 신뢰 구축, 세심한 관리', '신규 고객 개척 소극적'),
(15, 'ENTJ', '공격적', 7, '생명보험', '강한 추진력, 대형 계약 성사', '고객 거부감 발생 가능'),
(16, 'ISFP', '관계중심', 4, '손해보험', '따뜻한 서비스, 고객 만족도 높음', '영업 실적 압박 스트레스'),
(17, 'ESTP', '분석적', 6, '종합보험', '시장 트렌드 파악, 상품 지식 우수', '서류 작업 지연'),
(18, 'INFP', '관계중심', 1, '생명보험', '진정성 있는 상담, 고객 공감', '자신감 부족, 영업 경험 부족'),
(19, 'ENFJ', '공격적', 5, '손해보험', '카리스마, 리더십, 팀 협력', '개인 성과 집착'),
(20, 'INTP', '분석적', 9, '종합보험', '복잡한 상품 설계, 문제 해결 능력', '고객 소통 어려움');
