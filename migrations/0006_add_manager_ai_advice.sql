-- Add manager_ai_advice column to coaching_sessions table
-- This field stores AI-generated advice for managers about what additional actions they should take

ALTER TABLE coaching_sessions ADD COLUMN manager_ai_advice TEXT;
