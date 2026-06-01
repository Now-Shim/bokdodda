-- 기본 사용자 데이터 (복독다 코칭 시스템)
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

-- Planner 프로필 (자동 생성되지만 일부 데이터 미리 추가)
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
