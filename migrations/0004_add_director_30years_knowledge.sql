-- Migration: 0004_add_director_30years_knowledge
-- Director의 30년 노하우 필드 추가

ALTER TABLE coaching_sessions ADD COLUMN director_30years_knowledge TEXT;
