-- 경력 정보 컬럼 추가
ALTER TABLE planner_profiles ADD COLUMN career_start_year INTEGER;
ALTER TABLE planner_profiles ADD COLUMN first_organization TEXT;
ALTER TABLE planner_profiles ADD COLUMN career_path TEXT;
ALTER TABLE planner_profiles ADD COLUMN product_ratio TEXT;
