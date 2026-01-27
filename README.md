# AI 기반 보험 영업 교육/훈련 플랫폼 구축 제안

## 프로젝트 개요
- **이름**: AI 기반 보험 영업 교육/훈련 플랫폼
- **목표**: 30년간의 부채 관리 경험과 AI 기술을 기반으로 실전 중심의 보험 교육/훈련 플랫폼 구축
- **주요 기능**: 
  - AI와 현장 경험을 결합한 실전 공학 플랫폼
  - 상황별 상담 시뮬레이션 시스템
  - 맞춤형 교육 콘텐츠 제공

## 제안 정보
- **제안 기관**: 메가(가칭)공대 미래경영 교육센터
- **제안자**: 최호석 교육센터장
- **이메일**: bchdd@hotmail.net
- **전화**: 010-4652-8936
- **제안일**: 2025년 1월
- **희망 시작일**: 2026년 상반기

## URL
- **개발 서버**: https://3000-iuxxx5vpsdpcjyti6fmff-0e616f0a.sandbox.novita.ai
- **API 엔드포인트**: `/api/proposal` - 제안서 데이터 조회

## 현재 구현된 기능
✅ 제안서 웹사이트 기본 구조
✅ 제안 기관 정보 테이블
✅ 프로젝트 배경 및 목적 섹션
✅ 핵심 비전 설명
✅ 현재 AI의 한계점 소개
✅ 목표 플랫폼 특징 설명
✅ 반응형 디자인 (모바일/태블릿/데스크톱)
✅ 애니메이션 효과
✅ API 엔드포인트

## 데이터 아키텍처
- **데이터 모델**: JSON 기반 제안서 데이터 구조
- **스토리지**: 현재는 메모리 내 데이터 (향후 Cloudflare D1 또는 KV 사용 가능)
- **데이터 플로우**: API → JSON 응답 → 프론트엔드 렌더링

## 기술 스택
- **프레임워크**: Hono (Cloudflare Workers)
- **프론트엔드**: HTML5 + TailwindCSS + Vanilla JavaScript
- **아이콘**: Font Awesome
- **배포**: Cloudflare Pages
- **프로세스 관리**: PM2

## 사용자 가이드

### 웹사이트 방문
1. 위의 개발 서버 URL로 접속
2. 제안서 내용을 확인
3. 각 섹션은 스크롤 시 애니메이션과 함께 표시됩니다

### 주요 섹션
- **헤더**: 제안 제목 및 부제
- **제안 기관 정보**: 연락처 및 제안 일정
- **프로젝트 배경**: 핵심 비전, 현재 AI의 한계, 목표 플랫폼

### API 사용
```bash
# 제안서 데이터 조회
curl https://3000-iuxxx5vpsdpcjyti6fmff-0e616f0a.sandbox.novita.ai/api/proposal
```

## 향후 개발 계획
- [ ] 추가 섹션 구현 (프로젝트 범위, 일정, 예산 등)
- [ ] 상호작용 기능 추가 (문의하기 양식)
- [ ] 관리자 페이지 구현
- [ ] 데이터베이스 연동 (Cloudflare D1)
- [ ] 사용자 인증 시스템
- [ ] PDF 다운로드 기능

## 로컬 개발

### 요구사항
- Node.js 18+
- npm

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 빌드
npm run build

# 개발 서버 시작 (PM2)
fuser -k 3000/tcp 2>/dev/null || true
pm2 start ecosystem.config.cjs

# 서버 확인
curl http://localhost:3000

# 로그 확인
pm2 logs webapp --nostream

# 서버 중지
pm2 delete webapp
```

### 배포 (Cloudflare Pages)
```bash
# Cloudflare 인증
npx wrangler login

# 프로덕션 배포
npm run deploy:prod
```

## 배포 상태
- **플랫폼**: Cloudflare Pages (준비 완료)
- **상태**: ✅ 개발 중 (로컬 서버 실행 중)
- **최종 업데이트**: 2025년 1월 27일

## 프로젝트 구조
```
webapp/
├── src/
│   └── index.tsx          # Hono 애플리케이션 (API + HTML 렌더링)
├── public/                # 정적 파일 (현재 미사용)
├── dist/                  # 빌드 출력
├── ecosystem.config.cjs   # PM2 설정
├── wrangler.jsonc         # Cloudflare 설정
├── vite.config.ts         # Vite 빌드 설정
└── package.json           # 프로젝트 메타데이터
```

## 라이선스
© 2025 메가(가칭)공대 미래경영 교육센터. All rights reserved.
