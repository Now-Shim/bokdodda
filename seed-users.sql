-- 기본 사용자 데이터
INSERT OR REPLACE INTO users (id, email, password, name, role) VALUES
(1, 'director@bukdotda.com', 'director123', 'Director 김', 'director'),
(10, 'manager@bukdotda.com', 'demo123', 'Manager 이', 'manager'),
(11, 'planner01@bukdotda.com', 'demo123', '이영수', 'planner'),
(12, 'planner02@bukdotda.com', 'demo123', '박민준', 'planner');

-- Planner 프로필
INSERT OR REPLACE INTO planner_profiles (user_id, experience_years, specialization, recent_performance) VALUES
(11, 3, '암보험, 종신보험', '월 평균 5건 계약'),
(12, 5, '연금보험, 저축보험', '월 평균 8건 계약');
