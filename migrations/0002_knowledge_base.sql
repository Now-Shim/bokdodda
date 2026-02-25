-- Director 지식 베이스 (자료 업로드)
CREATE TABLE IF NOT EXISTS knowledge_base (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 카테고리 (영업기법, 고객관리, 상품지식, 클레임처리, 기타)
  content TEXT NOT NULL, -- 자료 내용 (마크다운 지원)
  file_type TEXT DEFAULT 'text' CHECK(file_type IN ('text', 'file')), -- 입력 방식
  file_name TEXT, -- 업로드된 파일명
  file_size INTEGER, -- 파일 크기 (bytes)
  priority BOOLEAN DEFAULT 0, -- 우선순위 (AI 코칭 시 우선 참조)
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INTEGER NOT NULL, -- Director ID
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- 코칭 세션에 새 필드 추가
ALTER TABLE coaching_sessions ADD COLUMN sales_process TEXT; -- 세일즈 프로세스 단계
ALTER TABLE coaching_sessions ADD COLUMN current_stage TEXT; -- 현재 단계 설명
ALTER TABLE coaching_sessions ADD COLUMN product_selling_point TEXT; -- 상품 셀링 포인트
ALTER TABLE coaching_sessions ADD COLUMN dialogue_script TEXT; -- 구체적 대화 스크립트
ALTER TABLE coaching_sessions ADD COLUMN required_knowledge TEXT; -- 필요한 지식
ALTER TABLE coaching_sessions ADD COLUMN manager_request TEXT; -- 매니저 요청 사항
ALTER TABLE coaching_sessions ADD COLUMN manager_note TEXT; -- 매니저 내부 노트
ALTER TABLE coaching_sessions ADD COLUMN director_feedback TEXT; -- Director 피드백
ALTER TABLE coaching_sessions ADD COLUMN director_rating INTEGER CHECK(director_rating BETWEEN 1 AND 5); -- Director 평가
ALTER TABLE coaching_sessions ADD COLUMN is_validated BOOLEAN DEFAULT 0; -- Director 검증 여부
ALTER TABLE coaching_sessions ADD COLUMN use_for_learning BOOLEAN DEFAULT 0; -- 재학습 데이터 사용 여부

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_priority ON knowledge_base(priority);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_uploaded_by ON knowledge_base(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_validated ON coaching_sessions(is_validated);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_learning ON coaching_sessions(use_for_learning);
