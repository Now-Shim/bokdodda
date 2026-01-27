# 보험 설계사 AI 코칭 플랫폼

## 프로젝트 개요
- **이름**: 보험 설계사 AI 코칭 플랫폼
- **목표**: 30년 현장 영업 경험을 기반으로 한 AI 기반 실시간 코칭 제공
- **주요 기능**: 
  - AI 기반 상황별 코칭 제공
  - 설계사 개인 성향 및 스타일 맞춤형 조언
  - 관리자 대시보드를 통한 통합 관리
  - 교육 프로그램 추천 및 관리
  - 플랫폼 재학습을 통한 지속적 개선

## URL
- **개발 서버**: https://3000-iuxxx5vpsdpcjyti6fmff-0e616f0a.sandbox.novita.ai
- **로그인 페이지**: `/` (메인)
- **설계사 대시보드**: `/planner`
- **관리자 대시보드**: `/admin`

## 데모 계정
```
관리자: admin@coaching.com / admin123
설계사1: planner01@coaching.com / demo123
설계사2: planner02@coaching.com / demo123
설계사3: planner03@coaching.com / demo123
```

## 현재 구현된 기능

### ✅ 인증 시스템
- 로그인/로그아웃
- 역할 기반 접근 제어 (설계사/관리자)
- LocalStorage 기반 세션 관리

### ✅ 설계사 기능
1. **개인 프로필**
   - 성향 (MBTI), 영업 스타일 표시
   - 경력, 전문 분야 확인
   - 코칭 세션 통계

2. **AI 코칭 요청**
   - 현장 상황 입력
   - 상황 유형 선택 (신규고객, 기존고객, 대형계약 등)
   - 실시간 AI 분석 및 조언 제공

3. **코칭 결과**
   - AI 상황 분석
   - 맞춤형 코칭 조언
   - 구체적인 접근법 제시
   - 30년 현장 노하우 제공

4. **피드백 시스템**
   - 효과성 평가 (1-5점)
   - 후기 작성
   - 피드백 기반 재학습 데이터 수집

5. **코칭 히스토리**
   - 과거 코칭 세션 조회
   - 상세 내용 확인

### ✅ 관리자 기능
1. **통계 대시보드**
   - 참여 설계사 수
   - 총 코칭 세션 수
   - 공유된 세션 수
   - 평균 만족도

2. **공유 세션 관리**
   - 설계사별 코칭 세션 모니터링
   - 효과적인 사례 확인
   - 개선 필요 영역 파악

3. **교육 프로그램 관리**
   - 프로그램 목록 조회
   - 수강 통계 확인
   - 완료율 모니터링

## 데이터 아키텍처

### 현재 (초기 버전)
- **데이터 저장**: 메모리 내 JavaScript 객체
- **장점**: 빠른 개발, 즉시 테스트 가능
- **제한사항**: 서버 재시작 시 데이터 초기화

### 향후 (프로덕션)
- **데이터베이스**: Cloudflare D1 (SQLite)
- **스키마**: 이미 설계 완료 (`migrations/0001_initial_schema.sql`)
- **테이블**:
  - `users`: 사용자 (설계사/관리자)
  - `planner_profiles`: 설계사 프로필
  - `coaching_sessions`: 코칭 세션
  - `training_programs`: 교육 프로그램
  - `training_enrollments`: 교육 수강 정보
  - `admin_insights`: 관리자 인사이트
  - `platform_learning_data`: 재학습 데이터

## 플랫폼 작동 원리

### 1. 설계사 코칭 프로세스
```
설계사 → 현장 상황 입력 → AI 분석 → 맞춤형 조언 + 30년 노하우 → 현장 적용 → 피드백 제출
```

### 2. 재학습 메커니즘
```
피드백 수집 → 효과성 평가 → 패턴 분석 → AI 모델 업데이트 → 개선된 코칭 제공
```

### 3. 관리자 역할
```
공유 세션 분석 → 우수 사례 발굴 → 교육 프로그램 추천 → 설계사 성장 지원
```

## 기술 스택
- **프레임워크**: Hono (Cloudflare Workers)
- **프론트엔드**: HTML5 + TailwindCSS + Vanilla JavaScript
- **아이콘**: Font Awesome
- **HTTP 클라이언트**: Axios
- **배포**: Cloudflare Pages (준비 완료)
- **프로세스 관리**: PM2
- **향후 DB**: Cloudflare D1

## 사용자 가이드

### 설계사 사용법
1. 로그인 (planner01@coaching.com / demo123)
2. 프로필 확인 - 나의 성향과 스타일 파악
3. AI 코칭 요청 버튼 클릭
4. 현장 상황을 상세히 입력
5. AI 코칭 결과 확인
6. 조언을 현장에 적용
7. 피드백 제출 (효과성 평가)

### 관리자 사용법
1. 로그인 (admin@coaching.com / admin123)
2. 대시보드에서 전체 통계 확인
3. 공유된 세션 검토
4. 우수 사례 발굴
5. 설계사별 교육 프로그램 추천

## API 엔드포인트

### 인증
- `POST /api/login` - 로그인

### 설계사
- `GET /api/planner/:id` - 프로필 조회
- `GET /api/coaching-sessions/:plannerId` - 코칭 세션 목록
- `POST /api/coaching-sessions` - 새 코칭 요청
- `POST /api/coaching-sessions/:id/feedback` - 피드백 제출

### 관리자
- `GET /api/admin/dashboard` - 통계 조회
- `GET /api/admin/shared-sessions` - 공유 세션 목록
- `GET /api/training-programs` - 교육 프로그램 목록

## 로컬 개발

### 서버 시작
```bash
# 빌드
npm run build

# PM2로 서버 시작
fuser -k 3000/tcp 2>/dev/null || true
pm2 start ecosystem.config.cjs

# 서버 확인
curl http://localhost:3000

# 로그 확인
pm2 logs webapp --nostream
```

### 서버 관리
```bash
# 서버 재시작
pm2 restart webapp

# 서버 중지
pm2 stop webapp

# PM2에서 제거
pm2 delete webapp
```

## 향후 개발 계획

### Phase 2 - D1 데이터베이스 연동
- [ ] Cloudflare D1 생성
- [ ] 마이그레이션 실행
- [ ] 백엔드 API를 D1과 연동
- [ ] 실제 데이터 영속성 확보

### Phase 3 - AI 고도화
- [ ] 외부 AI API 연동 (OpenAI, Claude 등)
- [ ] 설계사 성향별 맞춤 프롬프트
- [ ] 상황별 심화 분석
- [ ] 과거 데이터 기반 추론

### Phase 4 - 재학습 시스템
- [ ] 피드백 데이터 자동 수집
- [ ] 효과성 패턴 분석
- [ ] AI 모델 자동 업데이트
- [ ] 개인화 수준 향상

### Phase 5 - 교육 연동
- [ ] 교육 프로그램 추천 자동화
- [ ] 수강 신청 기능
- [ ] 진도 관리
- [ ] 평가 시스템

### Phase 6 - 확장 기능
- [ ] 모바일 앱 (PWA)
- [ ] 푸시 알림
- [ ] 설계사 간 익명 사례 공유
- [ ] 게임화 요소 (리더보드, 배지 등)
- [ ] 100명 → 1000명 스케일링

## 배포 상태
- **플랫폼**: Cloudflare Pages (준비 완료)
- **상태**: ✅ 개발 중 (로컬 서버 실행 중)
- **최종 업데이트**: 2025년 1월 27일

## 프로젝트 구조
```
webapp/
├── src/
│   └── index.tsx              # Hono 애플리케이션 (API + 프론트엔드)
├── migrations/
│   └── 0001_initial_schema.sql # D1 데이터베이스 스키마
├── seed.sql                   # 초기 데이터
├── public/                    # 정적 파일 (현재 미사용)
├── dist/                      # 빌드 출력
├── ecosystem.config.cjs       # PM2 설정
├── wrangler.jsonc             # Cloudflare 설정
├── vite.config.ts             # Vite 빌드 설정
└── package.json               # 프로젝트 메타데이터
```

## 핵심 차별점

### 1. 30년 현장 노하우 결합
- 단순 AI 조언이 아닌, 실제 현장 경험 기반
- 상황별 실전 팁 제공
- 암묵적 지식(Tacit Knowledge) 전수

### 2. 개인 맞춤형 코칭
- 설계사 성향 (MBTI) 고려
- 영업 스타일 반영
- 강점/약점 분석 기반

### 3. 재학습 시스템
- 피드백 기반 지속적 개선
- 100명 설계사 데이터로 강력한 플랫폼 구축
- 실제 현장 데이터로 학습

### 4. 관리자 협업
- 우수 사례 공유
- 교육 프로그램 연계
- 조직 전체 역량 향상

## 라이선스
© 2025 메가(가칭)공대 미래경영 교육센터. All rights reserved.
