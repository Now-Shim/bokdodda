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
관리자:    manager@bukdotda.com / manager123
설계사01:  planner01@bukdotda.com / demo123
설계사02:  planner02@bukdotda.com / demo123
...
설계사10:  planner10@bukdotda.com / demo123
```

## ✅ Phase 1 완료 기능

### 🤖 Genspark AI 실시간 연동
- ✅ **진짜 AI 코칭**: 더 이상 고정 응답이 아닌 실시간 AI 분석
- ✅ **컨텍스트 기반**: 설계사 프로필(성향, 경력, 강점/약점) 반영
- ✅ **30년 노하우 내장**: 프롬프트에 현장 경험 지식베이스 포함
- ✅ **개인화된 조언**: 각 설계사에게 맞춤형 코칭 제공

### 👥 3단계 권한 구조
| 역할 | 접근 권한 | 주요 기능 |
|------|-----------|----------|
| **설계사** | 자신의 데이터만 | AI 코칭 요청, 피드백 제출 |
| **관리자** | 전체 데이터 + 내부 노트 | 모니터링, 내부 노트 작성 |
| **Director** | 모든 데이터 + 검증 | 피드백, 재학습 데이터 검증 |

### 🔐 데이터 보안
- 설계사는 **내부 노트**와 **Director 피드백**을 볼 수 없음
- 관리자는 설계사에게 노출되지 않는 관찰 기록 작성 가능
- Director만 재학습 데이터 선별 권한 보유

### 📊 설계사 10명 테스트 데이터
- 다양한 성향 (ESTJ, ENFP, ISTJ, INFJ, ENTJ, ISFP, ESTP, INFP, ENFJ, INTP)
- 다양한 영업 스타일 (분석적, 관계중심, 공격적)
- 경력 1-9년 범위
- 각기 다른 강점/약점 프로필

## 🎨 브랜드 적용
- ✅ 로고: 책 아이콘 (Book)
- ✅ 브랜드명: "북돋다"
- ✅ 태그라인: "Book | Jar | All"
- ✅ 색상: 보라색 그라데이션 (#667eea → #764ba2)

## 🏗️ 기술 아키텍처

### Backend
- **프레임워크**: Hono (Cloudflare Workers)
- **AI 엔진**: Genspark AI (gpt-5 model)
- **데이터**: 메모리 내 Mock Database (향후 D1 전환 예정)

### Frontend
- **스타일**: TailwindCSS
- **아이콘**: Font Awesome
- **HTTP**: Axios

### 배포
- **플랫폼**: Cloudflare Pages
- **프로세스**: PM2
- **빌드**: Vite

## 📡 API 엔드포인트

### 인증
- `POST /api/login` - 로그인

### 설계사
- `GET /api/planner/:id` - 프로필 조회
- `GET /api/coaching-sessions/:plannerId` - 코칭 세션 목록 (내부 노트 제외)
- `POST /api/coaching-sessions` - **AI 코칭 요청 (실시간 생성!)**
- `POST /api/coaching-sessions/:id/feedback` - 피드백 제출

### 관리자
- `GET /api/manager/sessions` - 전체 세션 목록 (내부 노트 포함)
- `POST /api/manager/sessions/:id/note` - 내부 노트 작성

### Director
- `GET /api/director/sessions` - 전체 세션 (모든 필드)
- `POST /api/director/sessions/:id/feedback` - Director 피드백 및 재학습 검증
- `GET /api/director/dashboard` - 통계 대시보드

### 공통
- `GET /api/planners` - 전체 설계사 목록
- `GET /api/training-programs` - 교육 프로그램 목록

## 🔄 재학습(Relearning) 시스템

### 데이터 수집 흐름
```
설계사 질문
    ↓
AI 실시간 코칭 (설계사 프로필 반영)
    ↓
설계사 피드백 (효과성 평가 1-5점)
    ↓
관리자 내부 노트 (설계사는 안 보임)
    ↓
Director 검증 및 평가
    ↓
재학습 데이터로 선별 (useForLearning: true)
    ↓
향후 유사 상황 시 우선 참조
```

### 재학습 준비 완료
- `isValidated`: Director 검증 여부
- `useForLearning`: 재학습 데이터 사용 여부
- `directorRating`: Director 평가 (1-5점)
- `directorFeedback`: Director 전문가 의견

## 🚀 로컬 개발

### 서버 시작
```bash
# 빌드
cd /home/user/webapp
npm run build

# 서버 시작
fuser -k 3000/tcp 2>/dev/null || true
pm2 start ecosystem.config.cjs

# 테스트
curl http://localhost:3000
```

### 서버 관리
```bash
pm2 list                    # 상태 확인
pm2 logs webapp --nostream  # 로그 확인
pm2 restart webapp          # 재시작
pm2 delete webapp           # 중지 및 제거
```

## 📈 Phase 2 계획 (다음 단계)

### 🎯 즉시 추가할 기능
1. **관리자 페이지 완성**
   - 전체 설계사 모니터링
   - 내부 노트 작성 인터페이스
   - 통계 대시보드

2. **Director 페이지 완성**
   - 전체 세션 검토 인터페이스
   - 피드백 작성 및 평가
   - 재학습 데이터 관리
   - 분석 대시보드

3. **자료 업로드 기능**
   - Director가 추가 지식/자료 업로드
   - AI 프롬프트에 자동 반영
   - 텍스트/PDF 지원

### 🔮 향후 확장
4. **RAG 시스템 구축**
   - 우수 사례 벡터화
   - 유사 상황 자동 검색
   - 패턴 기반 추천

5. **교육 프로그램 연동**
   - 약점 기반 자동 추천
   - 수강 관리
   - 효과 측정

6. **100명 → 1000명 확장**
   - Cloudflare D1 데이터베이스 전환
   - 성능 최적화
   - 대시보드 고도화

## 💰 비용 구조

### 현재 (무료)
- Cloudflare Pages: 무료
- Genspark AI: 무료 (내장)

### 확장 시 예상 비용
- 100명 활발 사용 기준: 월 $50-100 (AI API)
- 1000명 확장: 월 $500-1000

## 🎓 사용 가이드

### 설계사
1. 로그인 → 프로필 확인
2. "AI 코칭 요청" 클릭
3. 상황 유형 선택 + 상황 설명 입력
4. AI 실시간 분석 결과 확인
5. 현장 적용 후 피드백 제출

### 관리자
1. 전체 설계사 세션 모니터링
2. 특이사항 발견 시 내부 노트 작성
3. 설계사에게는 노출 안 됨

### Director
1. 전체 데이터 검토
2. 우수 사례 평가 및 피드백
3. 재학습 데이터 선별
4. 추가 지식 자료 업로드 (Phase 2)

## 📊 현재 데이터

### 통계
- 설계사: 10명
- 샘플 코칭 세션: 2건
- 교육 프로그램: 6개
- Director 검증 세션: 2건

## 🔧 프로젝트 구조
```
webapp/
├── src/
│   ├── index.tsx          # 메인 애플리케이션 (API + 라우트)
│   ├── ai-helper.ts       # Genspark AI 연동
│   ├── data.ts            # Mock 데이터베이스
│   ├── pages-planner.ts   # 설계사 페이지 HTML
│   └── renderer.tsx       # (기존 파일)
├── migrations/            # D1 스키마 (Phase 2 대비)
├── public/                # 정적 파일
├── dist/                  # 빌드 출력
├── ecosystem.config.cjs   # PM2 설정
├── wrangler.jsonc         # Cloudflare 설정
└── README.md              # 이 문서
```

## 🎉 Phase 1 완성!

**완료된 핵심 기능:**
✅ Genspark AI 실시간 연동
✅ 3단계 권한 시스템
✅ 10명 테스트 데이터
✅ 브랜드 "북돋다" 적용
✅ 설계사 페이지 완성
✅ 재학습 데이터 구조 준비

**다음 단계:**
- Phase 2: 관리자/Director 페이지 완성
- Phase 3: 자료 업로드 및 RAG 시스템
- Phase 4: 실제 100명 배포

---

**제작**: 최호석 센터장 x Genspark AI
**최종 업데이트**: 2025년 1월 27일
**버전**: Phase 1.0 - Demo Ready 🚀
