# 북돋다 (BukDotDa)
**Book | Jar | All** - 보험 설계사를 위한 AI 코칭 플랫폼

## 🎯 프로젝트 개요
- **브랜드명**: 북돋다
  - **Book**: 인문학 기반의 지식
  - **Jar (독)**: 한국의 항아리, 담아내고 키워내는 공간
  - **All**: 모두를 위한, 모든 문제를 해결하는
  
- **목표**: 30년 현장 영업 경험을 AI와 결합하여 설계사 개인 맞춤형 실시간 코칭 제공
- **핵심 가치**: 재학습(Relearning)을 통한 플랫폼 독자적 진화

## 🌐 접속 정보
**메인 URL**: https://3000-iuxxx5vpsdpcjyti6fmff-a402f90a.sandbox.novita.ai

### 데모 계정
```
Director:  director@bukdotda.com / director123
관리자:    manager@bukdotda.com / demo123
설계사01:  planner01@bukdotda.com / demo123
설계사02:  planner02@bukdotda.com / demo123
...
설계사10:  planner10@bukdotda.com / demo123
```

## ✅ 최신 업데이트 (2026-04-24)

### 🎯 완료된 작업
1. **Manager 대시보드 완전 수정** ✅
   - 세션 목록 렌더링 null safety 처리
   - TypeError 에러 완전 해결
   - 세션 목록 정상 표시 확인
   
2. **Manager AI 분석 기능 정상화** ✅
   - Gemini API 모델 통일 (gemini-2.5-flash)
   - D1 데이터베이스 마이그레이션 완료
   - 10개 테이블 생성 (knowledge_base, external_links 등)
   
3. **정규표현식 렌더링 문제 해결** ✅
   - HTML에서 `\n` 이스케이프 처리
   - JavaScript 구문 오류 수정
   
4. **D1 데이터베이스 초기화** ✅
   - 사용자 데이터 (Director 1명, Manager 1명, Planner 10명)
   - 코칭 세션 2건 (이영수)
   - Planner 프로필 2건

### 🧪 테스트 완료
| 기능 | 상태 |
|------|------|
| Manager 대시보드 로딩 | ✅ 정상 |
| 세션 목록 표시 | ✅ 2개 표시 |
| Manager AI 분석 | ✅ 작동 |
| Director 대시보드 | ✅ 정상 |
| Planner 대시보드 | ✅ 정상 |

## 📦 백업 정보
- **백업 파일**: https://www.genspark.ai/api/files/s/DW7xMm8K
- **백업 날짜**: 2026-04-24
- **크기**: 1.81 MB
- **포함 내용**: 전체 프로젝트 (소스코드, D1 마이그레이션, Git 히스토리)

## 🔄 재시작 가이드

### 1️⃣ 프로젝트 복원 (백업에서)
```bash
# 백업 파일 다운로드 및 압축 해제
cd /home/user
wget https://www.genspark.ai/api/files/s/DW7xMm8K -O webapp-backup.tar.gz
tar -xzf webapp-backup.tar.gz
```

### 2️⃣ D1 데이터베이스 초기화
```bash
cd /home/user/webapp

# D1 마이그레이션 적용 (로컬 개발)
npx wrangler d1 migrations apply webapp-production --local

# 환경 변수 확인 (.dev.vars 파일 필요)
cat .dev.vars
# GEMINI_API_KEY=your-key
# OPENAI_API_KEY=your-key
# OPENAI_BASE_URL=https://api.openai.com/v1
# GENSPARK_TOKEN=your-token
```

### 3️⃣ 서버 시작
```bash
# 빌드
npm run build

# PM2로 서버 시작
fuser -k 3000/tcp 2>/dev/null || true
pm2 start ecosystem.config.cjs

# 테스트
curl http://localhost:3000
pm2 logs webapp --nostream
```

### 4️⃣ 테스트 데이터 확인
```bash
# D1 데이터 확인
npx wrangler d1 execute webapp-production --local --command="SELECT COUNT(*) FROM users"
npx wrangler d1 execute webapp-production --local --command="SELECT COUNT(*) FROM coaching_sessions"
```

## 🎯 Director 대시보드 (완성)
- ✅ **통계 대시보드**
  - 전체 설계사 수, 코칭 세션 수
  - 검증 완료 세션, 재학습 데이터 수
  - 설계사별 세션 수 차트
  - 코칭 효과성 분포 차트
  - 최근 우수 사례 표시

- ✅ **코칭 세션 검토**
  - 전체 세션 목록 및 필터링
  - 검증 상태별, 설계사별, 효과성별 필터
  - 세션 상세 정보 (질문, AI 코칭, 설계사 피드백)
  - 피드백 작성 모달 (1-5점 평가)
  - 재학습 데이터 선별 체크박스

- ✅ **자료 업로드 시스템 + AI 자동 연동**
  - 교육 자료 및 노하우 업로드 (텍스트/파일)
  - 카테고리별 분류 (영업기법, 고객관리, 상품지식 등)
  - 대상 설정 (설계사용/관리자용/공용)
  - 외부 링크 추가 (URL, 인증 정보)
  - 마크다운 지원
  - 고우선순위 자료 지정
  - **업로드된 자료가 AI 코칭에 실시간 자동 반영**

## 🔍 관리자 대시보드 (완성)
- ✅ **전체 현황 탭**
  - 전체 설계사, 코칭 세션, Manager 역할 분석 수 통계
  - 최근 코칭 활동 타임라인 (5건)
  - 주의가 필요한 설계사 알림 (5명)
  
- ✅ **코칭 세션 관리**
  - 설계사별, 상황 유형별 필터링
  - 세션 상세 정보 및 AI 코칭 내용
  - **Manager AI 역할 분석 기능** ⭐
    - Gemini AI 기반 추가 역할 분석
    - 설계사 성향 분석
    - 추천 교육/코칭 방향
    - Manager 지원 방안
    - 후속 관찰 포인트
  - 내부 노트 작성/수정 (설계사 비공개)
  
- ✅ **설계사 관리**
  - 설계사 프로필 카드 뷰
  - 성향, 영업 스타일, 경력, 전문 분야 확인
  - 코칭 세션 수, 교육 이수 현황
  - 상세 정보 클릭 시 해당 설계사 세션 필터링

## 🤖 Genspark AI 실시간 연동
- ✅ **진짜 AI 코칭**: 더 이상 고정 응답이 아닌 실시간 AI 분석
- ✅ **컨텍스트 기반**: 설계사 프로필(성향, 경력, 강점/약점) 반영
- ✅ **30년 노하우 내장**: 프롬프트에 현장 경험 지식베이스 포함
- ✅ **개인화된 조언**: 각 설계사에게 맞춤형 코칭 제공
- ✅ **Manager AI 분석**: Gemini 2.5 Flash 모델 기반 추가 역할 분석

## 👥 3단계 권한 구조
| 역할 | 접근 권한 | 주요 기능 | 페이지 상태 |
|------|-----------|----------|-----------|
| **설계사** | 자신의 데이터만 | AI 코칭 요청, 피드백 제출 | ✅ 100% 완성 |
| **관리자** | 전체 데이터 + 내부 노트 + Manager AI | 모니터링, 내부 노트, Manager AI 분석, 설계사 관리 | ✅ 100% 완성 |
| **Director** | 모든 데이터 + 검증 | 피드백, 재학습 데이터 검증, 자료 업로드 | ✅ 100% 완성 |

## 🏗️ 기술 아키텍처

### Backend
- **프레임워크**: Hono (Cloudflare Workers)
- **AI 엔진**: 
  - Genspark AI (gpt-5 model) - Planner 코칭
  - Google Gemini 2.5 Flash - Manager AI 분석
- **데이터베이스**: Cloudflare D1 (SQLite)

### Frontend
- **스타일**: TailwindCSS
- **아이콘**: Font Awesome
- **HTTP**: Axios
- **차트**: Chart.js

### 배포
- **플랫폼**: Cloudflare Pages
- **프로세스**: PM2 (개발 환경)
- **빌드**: Vite

## 📡 주요 API 엔드포인트

### Manager 전용 (신규!)
- `GET /api/manager/overview` - 전체 현황 (통계, 최근 활동, 주의 설계사)
- `GET /api/manager/sessions` - 전체 세션 목록
- `GET /api/manager/planners` - 설계사 목록
- `POST /api/manager/advice/:id` - **Manager AI 역할 분석** ⭐
- `POST /api/manager/action` - Manager 조치 기록

### Director
- `GET /api/director/dashboard` - 통계 대시보드
- `GET /api/director/sessions` - 전체 세션
- `POST /api/director/feedback` - Director 피드백
- `POST /api/director/knowledge` - 자료 업로드
- `POST /api/director/external-link` - 외부 링크 추가

### Planner
- `GET /api/coaching-sessions/:plannerId` - 코칭 세션 목록
- `POST /api/coaching-sessions` - AI 코칭 요청
- `POST /api/coaching-sessions/:id/feedback` - 피드백 제출

## 🔄 재학습 시스템

### 데이터 수집 흐름
```
설계사 질문
    ↓
AI 실시간 코칭 (설계사 프로필 반영)
    ↓
설계사 피드백 (효과성 평가 1-5점)
    ↓
관리자 모니터링 + Manager AI 분석 ⭐
    ↓
관리자 내부 노트 작성
    ↓
Director 검증 및 평가 (1-5점)
    ↓
재학습 데이터로 선별
    ↓
Director 자료 업로드로 지식베이스 확장
    ↓
향후 유사 상황 시 우선 참조
```

## 📊 현재 데이터 (D1 Database)

### 통계
- Director: 1명
- Manager: 1명
- 설계사: 10명
- 코칭 세션: 2건 (이영수)
- Planner 프로필: 2건
- 지식베이스 자료: 0건 (업로드 가능)
- 외부 링크: 0건 (추가 가능)

## 🐛 해결된 주요 이슈

### 1. Manager 세션 렌더링 문제 (2026-04-24)
- **문제**: `TypeError: Cannot read properties of null (reading 'substring')`
- **원인**: `session.coachingAdvice`가 null일 때 `.substring()` 호출
- **해결**: null safety 처리 추가

### 2. Manager AI Gemini API 오류
- **문제**: 404 Not Found - models/gemini-1.5-flash
- **원인**: v1 API에서 gemini-1.5-flash 미지원
- **해결**: gemini-2.5-flash로 모델 변경

### 3. D1 데이터베이스 테이블 누락
- **문제**: no such table: knowledge_base
- **원인**: D1 마이그레이션 미실행
- **해결**: `npx wrangler d1 migrations apply webapp-production --local`

### 4. 정규표현식 HTML 렌더링 오류
- **문제**: `/\n/g`가 HTML에서 깨짐
- **원인**: TypeScript에서 `\n`이 실제 줄바꿈으로 변환됨
- **해결**: `\\n`으로 이스케이프 처리

## 📈 다음 단계 (Phase 3)

### 즉시 추가할 기능
1. **GitHub 연동 및 배포**
   - GitHub 리포지토리 생성
   - Cloudflare Pages 자동 배포
   - 프로덕션 URL 획득

2. **프로덕션 D1 데이터베이스 설정**
   - 프로덕션 D1 생성
   - 마이그레이션 실행
   - 시드 데이터 입력

3. **Manager AI 분석 고도화**
   - 지식베이스 연동
   - 외부 링크 참조
   - 분석 결과 저장 및 이력 관리

4. **역할별 자료 필터링 완성**
   - 대상 설정(설계사용/관리자용/공용) 완전 적용
   - Manager/Planner 대시보드 자료 필터링
   - UI 접근 제어

## 💡 개발 팁

### 로그 확인
```bash
# PM2 로그 (비차단)
pm2 logs webapp --nostream --lines 50

# Wrangler 로그 파일
ls -lht ~/.config/.wrangler/logs/ | head -10
```

### D1 데이터 확인
```bash
# 로컬 D1 쿼리
npx wrangler d1 execute webapp-production --local --command="SELECT * FROM users LIMIT 5"
npx wrangler d1 execute webapp-production --local --command="SELECT * FROM coaching_sessions"
```

### 문제 해결
```bash
# 포트 3000 강제 종료
fuser -k 3000/tcp

# PM2 완전 초기화
pm2 delete all
pm2 kill

# 캐시 삭제 및 재빌드
rm -rf .wrangler dist node_modules/.cache
npm run build
```

## 🎓 사용 가이드

### 관리자 (Manager)
1. 로그인 (`manager@bukdotda.com` / `demo123`)
2. **전체 현황** 탭에서 통계 확인
3. **코칭 세션 관리** 탭에서 세션 목록 확인
4. 세션 선택 → "Manager 역할 분석" 클릭
5. "AI 분석 시작" → 1~2분 대기
6. AI 분석 결과 확인 및 저장
7. 필요시 추가 메모 작성
8. **설계사 관리** 탭에서 설계사 프로필 확인

### Director
1. 로그인 (`director@bukdotda.com` / `director123`)
2. **통계** 탭에서 전체 현황 및 차트 확인
3. **코칭 세션 검토** 탭에서 세션 검토
4. 피드백 작성 및 재학습 데이터 선별
5. **자료 업로드** 탭에서 지식베이스 확장
6. 대상 설정 및 우선순위 지정

### 설계사
1. 로그인 (`planner01@bukdotda.com` / `demo123`)
2. "AI 코칭 요청" 클릭
3. 상황 유형 선택 + 상황 설명
4. AI 실시간 분석 결과 확인
5. 현장 적용 후 피드백 제출

## 🔧 프로젝트 구조
```
webapp/
├── src/
│   ├── index.tsx          # 메인 애플리케이션 (Hono 라우트)
│   ├── ai-helper.ts       # Genspark AI 연동
│   ├── data.ts            # 데이터 타입 정의
│   ├── pages-planner.ts   # 설계사 페이지
│   ├── pages-manager.ts   # 관리자 페이지 (Manager AI 포함)
│   └── pages-director.ts  # Director 페이지
├── migrations/            # D1 스키마 (10개 마이그레이션)
│   ├── 0001_initial_schema.sql
│   ├── 0002_knowledge_base.sql
│   ├── 0003_add_director_manager_roles.sql
│   ├── 0004_external_links.sql
│   ├── 0005_add_link_authentication.sql
│   ├── 0006_add_manager_ai_advice.sql
│   └── ...
├── public/                # 정적 파일
├── dist/                  # 빌드 출력
├── .wrangler/             # D1 로컬 데이터 (자동 생성)
├── ecosystem.config.cjs   # PM2 설정
├── wrangler.jsonc         # Cloudflare 설정
├── .dev.vars              # 환경 변수 (로컬)
└── README.md              # 이 문서
```

## 📜 Git 커밋 히스토리 (최근 10개)

```
7744ccb 🐛 Manager 세션 렌더링 null safety 처리
a436856 🐛 Manager 세션 목록 렌더링 디버깅 로그 추가
29b1d42 ✅ D1 마이그레이션 적용 + Gemini 모델 통일
640960d 🐛 정규표현식 HTML 렌더링 문제 해결
03aba4f 🐛 Manager 대시보드 정규표현식 구문 오류 수정
adf054e 🐛 Manager AI 디버깅 로그 추가
32189ed 🔧 Manager AI Gemini API 버전 수정: v1beta → v1
8bc81a0 🔧 Manager AI Gemini 모델 수정
19f0c5f 🐛 PM2 재시작 후 세션 데이터 사라지는 문제 해결
7ecafe4 🐛 Manager AI 분석 에러 수정 + 자동 새로고침 추가
```

---

**제작**: 변방의 장수 (교육센터장) x Genspark AI
**최종 업데이트**: 2026년 4월 24일 (금)
**버전**: Phase 2.5 - Manager AI 완전 안정화 🚀✅

**다음 만남**: 늦어도 월요일 (2026-04-28) 👋
