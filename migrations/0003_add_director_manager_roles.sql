-- Director 및 Manager 역할 추가
-- SQLite에서는 CHECK constraint를 직접 수정할 수 없으므로
-- 테이블을 재생성해야 합니다.

-- 1. 기존 데이터 백업
CREATE TABLE users_backup AS SELECT * FROM users;

-- 2. 기존 테이블 삭제
DROP TABLE users;

-- 3. 새로운 역할 포함하여 테이블 재생성
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('planner', 'admin', 'director', 'manager')),
  phone TEXT,
  join_date DATE DEFAULT (DATE('now')),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 백업 데이터 복원
INSERT INTO users SELECT * FROM users_backup;

-- 5. 백업 테이블 삭제
DROP TABLE users_backup;

-- 6. Director 및 Manager 사용자 추가
INSERT OR IGNORE INTO users (id, email, name, password_hash, role, phone, status) VALUES
(1, 'director@bukdotda.com', '변방의 장수', 'director123', 'director', '010-1234-5678', 'active'),
(2, 'manager@bukdotda.com', '김관리 매니저', 'manager123', 'manager', '010-2345-6789', 'active');
