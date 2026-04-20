-- 외부 링크 인증 정보 추가
ALTER TABLE external_links ADD COLUMN auth_required INTEGER DEFAULT 0;  -- 인증 필요 여부 (0: 불필요, 1: 필요)
ALTER TABLE external_links ADD COLUMN username TEXT;                    -- 로그인 아이디
ALTER TABLE external_links ADD COLUMN password TEXT;                    -- 로그인 비밀번호 (평문 저장, 향후 암호화 권장)
ALTER TABLE external_links ADD COLUMN login_url TEXT;                   -- 로그인 페이지 URL (메인 URL과 다를 경우)
ALTER TABLE external_links ADD COLUMN crawl_selector TEXT;              -- 크롤링할 콘텐츠의 CSS 셀렉터 (고급 기능)

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_external_links_auth ON external_links(auth_required);

-- 메가넷 샘플 데이터 추가 (로그인 정보는 Director가 직접 입력)
INSERT INTO external_links (name, url, description, category, is_active, auth_required, login_url) VALUES 
('메가넷 보험정보', 'https://www.meganet.co.kr', '보험업계 전문 정보 플랫폼 (로그인 필요)', '상품정보', 0, 1, 'https://www.meganet.co.kr/login');
