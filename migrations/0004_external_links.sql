-- 외부 링크 관리 테이블 생성
CREATE TABLE IF NOT EXISTS external_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                  -- 링크 이름 (예: "금융감독원 보험공시")
  url TEXT NOT NULL,                   -- 링크 URL
  description TEXT,                    -- 링크 설명
  category TEXT,                       -- 카테고리 (예: "규제", "통계", "상품정보")
  is_active INTEGER DEFAULT 1,         -- 활성화 상태 (1: 활성, 0: 비활성)
  last_crawled_at DATETIME,           -- 마지막 크롤링 시각
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 링크 캐시 테이블 (크롤링 결과 저장)
CREATE TABLE IF NOT EXISTS link_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id INTEGER NOT NULL,            -- external_links.id 참조
  content TEXT NOT NULL,               -- 크롤링된 내용
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (link_id) REFERENCES external_links(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_external_links_active ON external_links(is_active);
CREATE INDEX IF NOT EXISTS idx_external_links_category ON external_links(category);
CREATE INDEX IF NOT EXISTS idx_link_cache_link_id ON link_cache(link_id);
CREATE INDEX IF NOT EXISTS idx_link_cache_cached_at ON link_cache(cached_at);

-- 샘플 데이터 삽입
INSERT INTO external_links (name, url, description, category, is_active) VALUES 
('금융감독원 보험공시', 'https://fine.fss.or.kr/main/fin/main.jsp', '보험상품 공시 및 규제 정보', '규제', 1),
('생명보험협회 통계', 'https://www.klia.or.kr/consumer/stats/index.do', '생명보험 업계 통계 자료', '통계', 1),
('손해보험협회 통계', 'https://www.knia.or.kr/statistics/index.do', '손해보험 업계 통계 자료', '통계', 1);
