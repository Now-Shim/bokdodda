-- 개인정보 컬럼 추가
ALTER TABLE planner_profiles ADD COLUMN birth_year INTEGER;
ALTER TABLE planner_profiles ADD COLUMN gender TEXT;
ALTER TABLE planner_profiles ADD COLUMN marital_status TEXT;
