# 회원제 사이트 크롤링 구현 계획

## 개요
보케어(bocare.co.kr) 등 회원제 보험 정보 사이트의 자료를 AI 코칭에 활용

## 기술 스택
- **Cloudflare Browser Rendering API** (추천) 또는
- **Puppeteer + Cloudflare Workers** (대안)

## 구현 방식

### 1단계: 보케어 계정 정보 저장 (암호화)
```sql
CREATE TABLE member_site_credentials (
  id INTEGER PRIMARY KEY,
  site_name TEXT NOT NULL,
  site_url TEXT NOT NULL,
  username TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,  -- 암호화 저장
  last_login DATETIME,
  is_active INTEGER DEFAULT 1
);

INSERT INTO member_site_credentials 
VALUES (1, '보케어', 'https://bocare.co.kr', '사용자ID', '암호화된비밀번호', NULL, 1);
```

### 2단계: 자동 로그인 크롤러 API 추가
```typescript
// POST /api/crawler/member-site
app.post('/api/crawler/member-site', async (c) => {
  const { siteId, targetUrl } = await c.req.json()
  
  // 1. DB에서 계정 정보 조회
  const credentials = await env.DB.prepare(`
    SELECT * FROM member_site_credentials WHERE id = ?
  `).bind(siteId).first()
  
  // 2. Cloudflare Browser Rendering으로 자동 로그인
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium'
  })
  
  const page = await browser.newPage()
  
  // 3. 로그인 페이지 접속
  await page.goto('https://bocare.co.kr/login')
  
  // 4. 로그인 폼 작성
  await page.type('#username', credentials.username)
  await page.type('#password', decryptPassword(credentials.password_encrypted))
  await page.click('#login-button')
  
  // 5. 로그인 후 목표 페이지 접속
  await page.waitForNavigation()
  await page.goto(targetUrl)
  
  // 6. 콘텐츠 추출
  const content = await page.evaluate(() => {
    return document.body.innerText
  })
  
  await browser.close()
  
  return c.json({ success: true, content })
})
```

### 3단계: AI 코칭에 통합
```typescript
// 기존 외부 링크 크롤링에 추가
if (link.requires_login) {
  // 회원제 사이트 크롤링
  const memberContent = await fetch('/api/crawler/member-site', {
    method: 'POST',
    body: JSON.stringify({ siteId: link.site_id, targetUrl: link.url })
  })
  externalLinkData += memberContent.content
} else {
  // 기존 공개 사이트 크롤링
  const publicContent = await fetch('https://api.genspark.ai/v1/crawler', ...)
  externalLinkData += publicContent.content
}
```

## 비용 분석

### 옵션 A: Cloudflare Browser Rendering (추천)
- 비용: $5/1,000 페이지 뷰
- 예상 사용량: 월 1,000회 크롤링 → **$5/월**
- 장점: 서버리스, 관리 불필요

### 옵션 B: 자체 Puppeteer 서버
- 비용: 서버 운영비 + 개발 시간
- 예상: VPS $10/월 + 개발 4~6시간
- 단점: 서버 관리 필요

## 투자 대비 효과 분석

### 보케어 연회비: ₩260,000/년
- 월 환산: **₩21,666/월**

### 크롤링 비용: $5/월
- 원화 환산: **약 ₩7,000/월**

### 순이익
- **절감액: ₩21,666 - ₩7,000 = ₩14,666/월**
- **연간: ₩175,992 절감** ✅

### 추가 이점
1. ✅ 자료 업로드 작업 시간 절감 (월 10~20시간)
2. ✅ 최신 정보 자동 업데이트
3. ✅ 다양한 보험 정보 종합 활용
4. ✅ 설계사에게 더 풍부한 코칭 제공

## 구현 시간
- Phase 1: 기본 로그인 크롤러 (2~3시간)
- Phase 2: AI 코칭 통합 (1시간)
- Phase 3: 테스트 및 최적화 (1~2시간)
- **총 소요 시간: 4~6시간**

## 보안 고려사항
1. 비밀번호 암호화 저장 (AES-256)
2. 크롤링 주기 제한 (1일 1~2회)
3. 세션 관리 (재로그인 최소화)
4. IP 차단 방지 (User-Agent 랜덤화)

## 결론
✅ **투자 가치 충분!**
- 연간 ₩175,992 절감
- 업무 효율 대폭 증가
- 코칭 품질 향상

**권장사항: 구현 진행** 🚀
