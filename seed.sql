-- 기본 사용자 데이터
INSERT OR IGNORE INTO users (id, email, name, password_hash, role, phone, status) VALUES
(1, 'director@bukdotda.com', '최호석 센터장', 'director123', 'director', '010-1234-5678', 'active'),
(2, 'manager@bukdotda.com', '김관리 매니저', 'manager123', 'manager', '010-2345-6789', 'active'),
(11, 'planner01@bukdotda.com', '이영수', 'demo123', 'planner', '010-3456-7890', 'active'),
(12, 'planner02@bukdotda.com', '박민정', 'demo123', 'planner', '010-3456-7891', 'active'),
(13, 'planner03@bukdotda.com', '최지훈', 'demo123', 'planner', '010-3456-7892', 'active'),
(14, 'planner04@bukdotda.com', '정수진', 'demo123', 'planner', '010-3456-7893', 'active'),
(15, 'planner05@bukdotda.com', '강민수', 'demo123', 'planner', '010-3456-7894', 'active'),
(16, 'planner06@bukdotda.com', '윤서영', 'demo123', 'planner', '010-3456-7895', 'active'),
(17, 'planner07@bukdotda.com', '임동현', 'demo123', 'planner', '010-3456-7896', 'active'),
(18, 'planner08@bukdotda.com', '한지원', 'demo123', 'planner', '010-3456-7897', 'active'),
(19, 'planner09@bukdotda.com', '송민호', 'demo123', 'planner', '010-3456-7898', 'active'),
(20, 'planner10@bukdotda.com', '조유진', 'demo123', 'planner', '010-3456-7899', 'active');

-- 설계사 프로필 데이터
INSERT OR IGNORE INTO planner_profiles (user_id, personality_type, sales_style, experience_years, specialization, strengths, weaknesses) VALUES
(11, 'ESTJ', '분석형', 5, '생명보험', '체계적 설명, 논리적 설득', '감정적 교감 부족'),
(12, 'ENFP', '관계형', 3, '손해보험', '친근한 소통, 고객 공감', '계약 클로징 약함'),
(13, 'ISTJ', '체계형', 7, '종합보험', '꼼꼼한 분석, 신뢰 구축', '새로운 접근 시도 부족'),
(14, 'ESFP', '열정형', 2, '생명보험', '적극적 영업, 밝은 에너지', '상품 지식 부족'),
(15, 'INTJ', '전략형', 10, '고액 자산가', '전략적 접근, 깊이 있는 상담', '대중 친화력 부족');
