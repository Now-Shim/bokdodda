-- 기존 코칭 히스토리 데이터를 새로운 카테고리로 업데이트
-- 매핑:
-- 생활코칭 -> 기타 (일반 상담으로 분류)
-- 영업기법 -> 신규고객 (영업 기법은 주로 신규 고객 대상)
-- 클레임처리 -> 민원처리 (직접 매핑)
-- 기타 -> 기타 (유지)

-- 1. 생활코칭 -> 기타
UPDATE coaching_sessions 
SET situation_type = '기타' 
WHERE situation_type = '생활코칭';

-- 2. 영업기법 -> 신규고객
UPDATE coaching_sessions 
SET situation_type = '신규고객' 
WHERE situation_type = '영업기법';

-- 3. 클레임처리 -> 민원처리
UPDATE coaching_sessions 
SET situation_type = '민원처리' 
WHERE situation_type = '클레임처리';

-- 4. 계약전환 샘플 데이터 추가 (기존고객 중 일부를 계약전환으로 변경)
UPDATE coaching_sessions 
SET situation_type = '계약전환' 
WHERE id IN (12, 13, 14);

-- 5. 팀관리 샘플 데이터 추가 (새로운 데이터 생성)
INSERT INTO coaching_sessions (
    planner_id,
    situation_type,
    session_date,
    context,
    ai_analysis,
    coaching_advice,
    recommended_approach,
    planner_feedback,
    effectiveness_rating,
    is_shared,
    created_at
) VALUES 
(11, '팀관리', '2026-06-01 10:00:00', 
 '신입 설계사 온보딩 및 멘토링 방법에 대해 논의했습니다. 효과적인 교육 프로세스와 정기적인 1:1 미팅 일정을 수립하는 방법을 코칭받았습니다.', 
 '신입 설계사의 성공적인 정착을 위해서는 체계적인 온보딩 프로세스가 필수적입니다. 멘토링 체크리스트를 활용하여 단계별 성장을 추적하고, 주간 피드백을 통해 빠른 적응을 도와야 합니다.', 
 '• 신입 교육 자료 준비 및 공유\n• 멘토링 체크리스트 작성 및 활용\n• 주간 1:1 미팅 일정 수립\n• 1개월 온보딩 계획서 작성', 
 '체계적인 프로세스 구축으로 신입 설계사 교육 효율성 향상', 
 '멘토링 체크리스트가 매우 유용할 것 같습니다. 매주 진행하며 신입 설계사의 성장을 함께 관리하겠습니다.', 
 5,
 1,
 datetime('now')),
 
(11, '팀관리', '2026-06-05 14:00:00', 
 '팀 분위기 개선 및 동기부여 방안에 대해 상담했습니다. 팀 목표를 명확히 설정하고, 팀원들의 강점을 파악하여 적재적소에 배치하는 방법을 논의했습니다.', 
 '팀 성과 향상을 위해서는 명확한 목표 설정과 함께 팀원 개개인의 강점을 활용하는 것이 중요합니다. 정기적인 팀 빌딩 활동을 통해 소통을 강화하고, 개인별 맞춤 역할을 부여하여 몰입도를 높여야 합니다.', 
 '• 월간 팀 목표 설정 및 공유\n• 팀 빌딩 활동 계획 수립\n• 팀원별 강점 분석 및 역할 분담\n• 정기 팀 미팅 주제 선정', 
 '팀원 강점 기반 역할 배치로 팀 효율성 극대화', 
 '팀 빌딩 활동을 통해 소통이 더 원활해질 것으로 기대됩니다. 강점 기반 역할 분담도 시도해보겠습니다.', 
 4,
 1,
 datetime('now'));

-- 최종 분포 확인
SELECT situation_type, COUNT(*) as count 
FROM coaching_sessions 
GROUP BY situation_type 
ORDER BY count DESC;
