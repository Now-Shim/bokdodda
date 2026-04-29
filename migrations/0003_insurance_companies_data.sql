-- 보험사 정보 테이블
CREATE TABLE IF NOT EXISTS insurance_companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,           -- 보험사 코드 (samsung_life, hanwha_life 등)
  name TEXT NOT NULL,                  -- 보험사 명 (삼성생명, 한화생명 등)
  type TEXT NOT NULL,                  -- 보험 유형 (life, general)
  website_url TEXT,                    -- 공식 홈페이지
  products_url TEXT,                   -- 상품 페이지 URL
  terms_url TEXT,                      -- 약관 페이지 URL
  news_url TEXT,                       -- 보도자료 페이지 URL
  is_active INTEGER DEFAULT 1,         -- 활성화 여부
  last_crawled_at DATETIME,            -- 마지막 크롤링 시간
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 보험 상품 테이블
CREATE TABLE IF NOT EXISTS insurance_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,         -- 보험사 ID
  product_code TEXT,                   -- 상품 코드
  product_name TEXT NOT NULL,          -- 상품명
  product_type TEXT,                   -- 상품 유형 (암보험, 건강보험 등)
  description TEXT,                    -- 상품 설명
  features TEXT,                       -- 주요 특징 (JSON)
  coverage_details TEXT,               -- 보장 내용 (JSON)
  terms_pdf_url TEXT,                  -- 약관 PDF URL
  guide_pdf_url TEXT,                  -- 상품안내장 URL
  launch_date DATE,                    -- 출시일
  is_active INTEGER DEFAULT 1,         -- 판매 중 여부
  crawled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES insurance_companies(id)
);

-- 보험사 뉴스/보도자료 테이블
CREATE TABLE IF NOT EXISTS insurance_news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,         -- 보험사 ID
  title TEXT NOT NULL,                 -- 제목
  content TEXT,                        -- 내용
  summary TEXT,                        -- 요약
  url TEXT,                            -- 원문 URL
  published_date DATE,                 -- 발행일
  category TEXT,                       -- 카테고리 (신상품, 보도자료 등)
  crawled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES insurance_companies(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_company ON insurance_products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON insurance_products(product_type);
CREATE INDEX IF NOT EXISTS idx_news_company ON insurance_news(company_id);
CREATE INDEX IF NOT EXISTS idx_news_date ON insurance_news(published_date);
CREATE INDEX IF NOT EXISTS idx_news_category ON insurance_news(category);

-- 주요 보험사 초기 데이터
INSERT OR IGNORE INTO insurance_companies (code, name, type, website_url, products_url, news_url) VALUES
  ('samsung_life', '삼성생명', 'life', 'https://www.samsunglife.com', 'https://www.samsunglife.com/product/index.do', 'https://www.samsunglife.com/company/press/list.do'),
  ('hanwha_life', '한화생명', 'life', 'https://www.hanwhalife.com', 'https://www.hanwhalife.com/product/main.do', 'https://www.hanwhalife.com/company/news/press.do'),
  ('kyobo_life', '교보생명', 'life', 'https://www.kyobo.com', 'https://www.kyobo.com/product/index.do', 'https://www.kyobo.com/company/news/press.do');
