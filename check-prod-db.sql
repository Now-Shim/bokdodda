-- Check coaching sessions
SELECT COUNT(*) as session_count FROM coaching_sessions;

-- Check users
SELECT id, email, name, role FROM users LIMIT 5;

-- Check planner profiles
SELECT COUNT(*) as profile_count FROM planner_profiles;
