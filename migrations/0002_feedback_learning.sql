-- 디렉터 피드백 기반 재학습 시스템 테이블

CREATE TABLE IF NOT EXISTS feedback_learning (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  rating INTEGER NOT NULL,
  feedback_text TEXT,
  good_examples TEXT,  -- JSON array
  bad_examples TEXT,   -- JSON array
  director_guidelines TEXT,  -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES coaching_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback_learning(category);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback_learning(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback_learning(created_at);
