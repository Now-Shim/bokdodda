-- 김설계 (user_id=1) 프로필 데이터 업데이트
UPDATE planner_profiles 
SET 
  career_start_year = 2015,
  first_organization = '삼성생명',
  career_path = '삼성생명 → 교보생명 → 현대해상',
  product_ratio = '생보 60% / 손보 40%',
  birth_year = 1985,
  gender = '여성',
  marital_status = '기혼',
  updated_at = CURRENT_TIMESTAMP
WHERE user_id = 1;

-- 데이터 확인
SELECT 
  user_id,
  career_start_year,
  first_organization,
  career_path,
  product_ratio,
  birth_year,
  gender,
  marital_status
FROM planner_profiles 
WHERE user_id = 1;
