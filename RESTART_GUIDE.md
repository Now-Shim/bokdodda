# 북돋다 플랫폼 재시작 가이드

## 📋 빠른 재시작 (Quick Restart)

```bash
# 1. 포트 정리
fuser -k 3000/tcp 2>/dev/null || true

# 2. 빌드 (필요시)
cd /home/user/webapp && npm run build

# 3. PM2 재시작
pm2 restart webapp

# 4. 서비스 확인
curl http://localhost:3000
pm2 logs --nostream
```

## 🔐 로그인 계정 정보

### Director (디렉터)
- 이메일: `director@bukdotda.com`
- 비밀번호: `director123`
- 역할: 전체 시스템 관리, 코칭 품질 검증

### Manager (매니저)
- 이메일: `manager@bukdotda.com`
- 비밀번호: `demo123`
- 역할: 설계사 관리, AI 역할 분석

### Planner (설계사)
- 이메일: `planner01@bukdotda.com`
- 비밀번호: `demo123`
- 역할: AI 코칭 요청

## 🧪 테스트 실행

```bash
# 전체 통합 테스트
cd /home/user/webapp
bash test-all-dashboards.sh

# 개별 대시보드 테스트
curl http://localhost:3000/director    # Director
curl http://localhost:3000/manager     # Manager  
curl http://localhost:3000/planner     # Planner
```

## 🔧 문제 해결

### Director 대시보드가 작동하지 않을 때
```bash
# 1. 전역 함수 확인
curl -s http://localhost:3000/director | grep -o "window\.[a-zA-Z]*"

# 2. JavaScript 에러 확인
pm2 logs webapp --nostream | grep -i error

# 3. 빌드 후 재시작
cd /home/user/webapp && npm run build && pm2 restart webapp
```

### 샌드박스가 멈췄을 때
- 모든 명령이 타임아웃되면 ResetSandbox 필요
- 리셋 후 자동으로 빌드 및 재시작 진행

## 📊 전역 함수 목록

### Director (26개)
- Tab & Auth: `switchTab`, `logout`
- Session: `applyFilters`, `openFeedbackModal`, `closeFeedbackModal`, `submitFeedback`, `setRating`
- Knowledge: `uploadKnowledge`, `clearUploadForm`, `switchInputMode`, `deleteKnowledge`, `editKnowledge`, `saveKnowledgeEdit`, `viewKnowledge`, `closeViewModal`, `closeEditModal`
- Link: `openAddLinkModal`, `closeLinkModal`, `saveLink`, `editLink`, `toggleLinkStatus`, `deleteLink`

### Manager (12개)
- `switchTab`, `logout`, `applyFilters`
- `openNoteModal`, `closeNoteModal`, `generateManagerAdvice`, `submitManagerAction`
- `viewPlannerDetail`, `openManagerAnalysis`
- `toggleNotifications`, `handleNotificationClick`, `markAllAsRead`

### Planner (1개)
- `closeModal`

## 📁 프로젝트 구조

```
/home/user/webapp/
├── src/
│   ├── index.tsx           # 메인 서버 (Hono)
│   ├── pages-director.ts   # Director 대시보드
│   ├── pages-manager.ts    # Manager 대시보드
│   └── pages-planner.ts    # Planner 대시보드
├── migrations/
│   ├── 0001_initial_schema.sql
│   ├── 0002_add_notifications.sql
│   └── 0003_create_notifications.sql
├── test-all-dashboards.sh  # 통합 테스트
├── ecosystem.config.cjs     # PM2 설정
└── wrangler.jsonc          # Cloudflare 설정
```

## 🌐 서비스 URL

Production: https://3000-iuxxx5vpsdpcjyti6fmff-a402f90a.sandbox.novita.ai

- Director: `/director`
- Manager: `/manager`
- Planner: `/planner`

## 📝 최근 수정 사항

### 2026-04-28: Director 대시보드 전역 함수 수정
- ✅ 존재하지 않는 함수 제거 (`openSessionDetail`, `submitDirectorFeedback`, `addExternalLink`)
- ✅ 누락된 함수 추가 (`openFeedbackModal`, `submitFeedback`, `setRating`, `viewKnowledge` 등)
- ✅ 함수 카테고리별 그룹화로 가독성 향상
- ✅ 모든 통합 테스트 통과

### 2026-04-27: 실시간 알림 시스템 구현
- ✅ Manager 대시보드 알림 UI
- ✅ 10초 간격 자동 폴링
- ✅ 알림 클릭 시 세션 자동 열기
