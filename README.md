# 보험 설계사 AI 코칭 플랫폼

## 프로젝트 개요
30년 현장 경험과 AI 기술을 결합한 보험 설계사 전문 코칭 및 교육 플랫폼입니다.

### 핵심 가치
- **AI 기반 코칭**: 실시간 상황 분석 및 맞춤형 조언 제공
- **암묵적 지식 전수**: 30년 현장 노하우를 AI에 접목
- **개인화 교육**: 설계사 성향과 스타일에 맞춘 교육 프로그램
- **플랫폼 학습**: 100명의 설계사 데이터로 지속적으로 진화

## URL
🌐 **개발 서버**: https://3000-iuxxx5vpsdpcjyti6fmff-0e616f0a.sandbox.novita.ai

## 데모 계정
### 설계사 계정
- **이메일**: planner01@coaching.com
- **비밀번호**: 01
- **권한**: 코칭 요청, 교육 수강, 피드백 제공

### 관리자 계정
- **이메일**: admin@coaching.com
- **비밀번호**: admin
- **권한**: 전체 통계 조회, 공유 세션 관리, 인사이트 생성

## 주요 기능

### ✅ 설계사 기능
1. **AI 코칭 요청**
   - 현장 상황 입력 (신규고객, 기존고객, 계약체결 등)
   - AI 상황 분석 및 조언 제공
   - 30년 노하우 기반 추천 접근법
   - 효과성 평가 및 피드백

2. **교육 프로그램**
   - 다양한 카테고리별 교육 (영업기법, 상품지식, 고객관리)
   - 난이도별 프로그램 (초급, 중급, 고급)
   - 진행률 추적
   - 수료 관리

3. **대시보드**
   - 코칭 세션 통계
   - 최근 활동 내역
   - 진행 중인 교육 프로그램
   - 개인 성향 및 스타일 프로필

### ✅ 관리자 기능
1. **플랫폼 관리**
   - 전체 설계사 현황 조회
   - 코칭 세션 통계 분석
   - 평균 효과성 모니터링

2. **공유 세션 관리**
   - 설계사가 공유한 코칭 세션 조회
   - 패턴 분석 및 인사이트 도출
   - 맞춤형 교육 프로그램 추천

3. **설계사 관리**
   - 전체 설계사 목록 및 프로필
   - 영업 스타일 및 경력 파악
   - 활동 통계 확인

### ✅ 플랫폼 학습 기능
- 고평가 코칭 세션 자동 수집 (4점 이상)
- 재학습 데이터 축적
- 패턴 인식 및 개선

## 데이터 아키텍처

### 데이터 모델
1. **users**: 사용자 (설계사/관리자)
2. **planner_profiles**: 설계사 상세 프로필 (성향, 스타일, 경력)
3. **coaching_sessions**: AI 코칭 세션 기록
4. **training_programs**: 교육 프로그램
5. **training_enrollments**: 교육 수강 관리
6. **admin_insights**: 관리자 인사이트
7. **platform_learning_data**: 플랫폼 재학습 데이터

### 스토리지
- **Cloudflare D1**: SQLite 기반 관계형 데이터베이스
- **로컬 개발**: `.wrangler/state/v3/d1` (자동 생성)
- **프로덕션**: Cloudflare D1 (글로벌 분산)

## 기술 스택
- **프레임워크**: Hono (Cloudflare Workers)
- **프론트엔드**: HTML5, TailwindCSS, Vanilla JavaScript
- **데이터베이스**: Cloudflare D1 (SQLite)
- **배포**: Cloudflare Pages
- **프로세스 관리**: PM2

## 사용 가이드

### 1. 설계사 사용 흐름
1. 로그인 (planner01@coaching.com / 01)
2. 대시보드에서 통계 확인
3. "새 코칭 요청하기" 버튼 클릭
4. 상황 유형 선택 및 상황 설명 입력
5. AI 코칭 결과 확인:
   - AI 상황 분석
   - 코칭 조언
   - 추천 접근법
   - 30년 현장 노하우
6. 피드백 및 효과성 평가 (1-5점)
7. 관리자와 공유 여부 선택
8. 교육 프로그램 수강신청

### 2. 관리자 사용 흐름
1. 로그인 (admin@coaching.com / admin)
2. 전체 통계 확인
3. 공유된 세션 탭에서 설계사들의 코칭 내역 확인
4. 패턴 발견 시 인사이트 생성
5. 설계사 탭에서 개별 설계사 현황 파악
6. 필요시 맞춤형 교육 프로그램 추천

## 로컬 개발

### 요구사항
- Node.js 18+
- npm
- PM2 (pre-installed)

### 설치 및 실행
```bash
# 프로젝트 클론
cd /home/user/webapp

# 의존성 설치 (이미 완료됨)
npm install

# 데이터베이스 초기화
npm run db:reset

# 빌드
npm run build

# 서버 시작
fuser -k 3000/tcp 2>/dev/null || true
pm2 start ecosystem.config.cjs

# 서버 확인
curl http://localhost:3000

# 로그 확인
pm2 logs webapp --nostream

# 서버 중지
pm2 delete webapp
```

### 데이터베이스 관리
```bash
# 마이그레이션 적용
npm run db:migrate:local

# 시드 데이터 삽입
npm run db:seed

# 데이터베이스 리셋 (마이그레이션 + 시드)
npm run db:reset

# SQL 쿼리 실행
npx wrangler d1 execute webapp-production --local --command="SELECT * FROM users"
```

## API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인

### 설계사
- `GET /api/planner/dashboard/:userId` - 대시보드 데이터
- `POST /api/coaching/new` - 새 코칭 요청
- `POST /api/coaching/feedback` - 코칭 피드백 제출
- `GET /api/training/programs` - 교육 프로그램 목록
- `POST /api/training/enroll` - 교육 프로그램 등록

### 관리자
- `GET /api/admin/dashboard` - 관리자 대시보드
- `POST /api/admin/insights` - 인사이트 생성
- `GET /api/admin/planners` - 설계사 목록

## 향후 개발 계획

### Phase 2 (단기)
- [ ] OpenAI API 연동으로 실제 AI 분석 강화
- [ ] 교육 프로그램 상세 페이지 및 진도 관리
- [ ] 설계사 프로필 수정 기능
- [ ] 실시간 알림 시스템
- [ ] 데이터 시각화 (차트, 그래프)

### Phase 3 (중기)
- [ ] 설계사 간 성공 사례 공유 커뮤니티
- [ ] AI 모델 재학습 파이프라인 자동화
- [ ] 음성 코칭 인터페이스
- [ ] 모바일 앱 (React Native)
- [ ] 고급 분석 리포트 생성

### Phase 4 (장기)
- [ ] 100명 이상 설계사 온보딩
- [ ] 플랫폼 자체 학습 모델 구축
- [ ] 다국어 지원
- [ ] 타 보험사 적용 확장
- [ ] SaaS 모델로 전환

## 플랫폼 학습 메커니즘

### 데이터 수집
- 효과성 평가 4점 이상 세션 자동 수집
- 설계사 피드백 분석
- 상황-조언-결과 패턴 저장

### 학습 과정 (향후 구현)
1. 수집된 검증 데이터 분석
2. 성공 패턴 추출
3. AI 모델 파인튜닝
4. A/B 테스트로 효과 검증
5. 전체 플랫폼 적용

### 목표
- 100명의 설계사 x 평균 100회 코칭 = 10,000개 학습 데이터
- 6개월 내 독자적 코칭 모델 구축
- 업계 최고 수준의 현장 코칭 플랫폼 완성

## 프로젝트 구조
```
webapp/
├── src/
│   └── index.tsx          # Hono 애플리케이션 (API + HTML)
├── migrations/
│   └── 0001_initial_schema.sql  # 데이터베이스 스키마
├── seed.sql               # 초기 데이터
├── .wrangler/             # 로컬 D1 데이터베이스
├── dist/                  # 빌드 출력
├── ecosystem.config.cjs   # PM2 설정
├── wrangler.toml          # Cloudflare 설정
├── vite.config.ts         # Vite 빌드 설정
└── package.json           # 프로젝트 메타데이터
```

## 배포 상태
- **플랫폼**: Cloudflare Pages (준비 완료)
- **상태**: ✅ 개발 완료 (로컬 서버 실행 중)
- **데이터베이스**: Cloudflare D1 (로컬 개발 중)
- **최종 업데이트**: 2025년 1월 27일

## 라이선스
© 2025 메가(가칭)공대 미래경영 교육센터. All rights reserved.

---

## 기여자
- **프로젝트 기획**: 최호석 센터장
- **기술 개발**: AI Developer
- **데이터베이스 설계**: AI Developer
- **UI/UX 디자인**: AI Developer
