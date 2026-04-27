-- 알림 시스템 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  user_role TEXT NOT NULL, -- 'manager', 'director'
  type TEXT NOT NULL, -- 'new_session', 'feedback_updated', 'validation_needed'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  session_id INTEGER,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES coaching_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
