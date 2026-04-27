# 북돋다 플랫폼 - 운영 가이드 📚

## 🎯 목차
1. [안정적 운영 체계](#1-안정적-운영-체계)
2. [실시간 알림 시스템](#2-실시간-알림-시스템)
3. [자동화 테스트](#3-자동화-테스트)
4. [문제 해결 가이드](#4-문제-해결-가이드)
5. [일상 운영 체크리스트](#5-일상-운영-체크리스트)

---

## 1. 안정적 운영 체계 🛡️

### 1.1 전체 대시보드 상태

✅ **모든 대시보드가 안정적으로 운영됩니다:**
- **Director 대시보드**: 15개 전역 함수 등록
- **Manager 대시보드**: 11개 전역 함수 등록
- **Planner 대시보드**: 전역 함수 등록

### 1.2 전역 함수 목록

#### Director 대시보드
```javascript
window.switchTab
window.logout
window.applyFilters
window.uploadKnowledge
window.clearUploadForm
window.switchInputMode
window.openSessionDetail
window.closeSessionModal
window.submitDirectorFeedback
window.addExternalLink
window.toggleLinkStatus
window.deleteLink
window.deleteKnowledge
window.editKnowledge
window.cancelEdit
window.saveEdit
```

#### Manager 대시보드
```javascript
window.switchTab
window.logout
window.applyFilters
window.openNoteModal
window.closeNoteModal
window.generateManagerAdvice
window.submitManagerAction
window.viewPlannerDetail
window.openManagerAnalysis
window.toggleNotifications
window.handleNotificationClick
window.markAllAsRead
```

#### Planner 대시보드
```javascript
window.closeModal
```

---

## 2. 실시간 알림 시스템 🔔

### 2.1 알림 동작 흐름

```
1. 설계사가 코칭 의뢰 → 새 세션 생성
                    ↓
2. Manager & Director에게 자동 알림 생성
                    ↓
3. 10초마다 폴링으로 알림 조회
                    ↓
4. 읽지 않은 알림 개수 배지 표시
                    ↓
5. 알림 클릭 → 해당 세션으로 바로 이동
                    ↓
6. 자동 읽음 처리 + 배지 업데이트
```

### 2.2 알림 UI 위치

**Manager 대시보드**:
- **헤더 오른쪽**: 종 모양 아이콘 + 빨간색 배지
- **클릭 시**: 드롭다운 패널 (최대 10개 알림 표시)
- **모두 읽음 버튼**: 패널 헤더에 위치

### 2.3 알림 API

```bash
# 읽지 않은 알림 조회
GET /api/notifications/:userId

# 개별 읽음 처리
POST /api/notifications/:id/read

# 전체 읽음 처리
POST /api/notifications/read-all/:userId
```

### 2.4 알림 데이터베이스 스키마

```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  user_role TEXT NOT NULL,  -- 'manager', 'director'
  type TEXT NOT NULL,        -- 'new_session', 'feedback_updated'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  session_id INTEGER,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. 자동화 테스트 🧪

### 3.1 통합 테스트 실행

```bash
cd /home/user/webapp
bash test-all-dashboards.sh
```

### 3.2 테스트 항목

**✅ 모든 테스트 통과 시 출력:**
```
🧪 북돋다 플랫폼 통합 테스트 시작...
========================================

📄 1. 기본 페이지 테스트
------------------------
Testing 메인 페이지... ✓ PASS (200)
Testing Director 대시보드... ✓ PASS (200)
Testing Manager 대시보드... ✓ PASS (200)
Testing Planner 대시보드... ✓ PASS (200)

🔌 2. API 엔드포인트 테스트
------------------------
Testing Director 로그인... ✓ PASS
Testing Manager 전체현황 API... ✓ PASS (200)
...

🔍 3. JavaScript 전역 함수 검증
------------------------
Checking Manager...
  - window.switchTab... ✓ PASS
  - window.logout... ✓ PASS
  ...

✅ 모든 테스트 통과!
```

### 3.3 배포 전 검증 프로세스

```bash
# 1. 코드 수정 후
cd /home/user/webapp
git add .
git commit -m "변경 내용"

# 2. 빌드
npm run build

# 3. 재시작
pm2 restart webapp

# 4. 테스트 실행
bash test-all-dashboards.sh

# 5. 테스트 통과 확인 후 배포
```

---

## 4. 문제 해결 가이드 🔧

### 4.1 Manager 대시보드가 작동하지 않을 때

**증상:** 버튼 클릭 시 아무 반응 없음

**원인:** JavaScript 함수가 전역 스코프에 등록되지 않음

**해결:**
1. 브라우저 DevTools 콘솔 열기 (`F12`)
2. 에러 메시지 확인
3. `window.함수명` 입력 시 `undefined` 확인
4. `pages-manager.ts`에 `window.함수명 = 함수명` 추가
5. 빌드 및 재시작

### 4.2 알림이 표시되지 않을 때

**체크리스트:**
```bash
# 1. D1 마이그레이션 적용 확인
npx wrangler d1 migrations apply webapp-production --local

# 2. 테이블 존재 확인
npx wrangler d1 execute webapp-production --local --command="SELECT name FROM sqlite_master WHERE type='table'"

# 3. 알림 데이터 확인
npx wrangler d1 execute webapp-production --local --command="SELECT * FROM notifications"

# 4. 브라우저 콘솔 확인
# DevTools → Console → "[알림]" 검색
```

### 4.3 서버가 응답하지 않을 때

```bash
# 1. PM2 상태 확인
pm2 list

# 2. PM2 로그 확인
pm2 logs webapp --nostream --lines 50

# 3. 포트 사용 확인
fuser -k 3000/tcp

# 4. 재시작
pm2 restart webapp

# 5. 테스트
curl http://localhost:3000
```

### 4.4 D1 데이터베이스 문제

```bash
# 로컬 D1 초기화
rm -rf .wrangler/state/v3/d1
npx wrangler d1 migrations apply webapp-production --local

# 시드 데이터 재생성
npx wrangler d1 execute webapp-production --local --file=./seed.sql
```

---

## 5. 일상 운영 체크리스트 ✅

### 5.1 매일 확인 (1분)

```bash
# PM2 상태 확인
pm2 list

# 서버 응답 확인
curl -I http://localhost:3000

# 알림 동작 확인 (Manager 대시보드 로그인)
```

### 5.2 매주 확인 (5분)

```bash
# 통합 테스트 실행
bash test-all-dashboards.sh

# D1 데이터베이스 백업
npx wrangler d1 export webapp-production --local --output=backup-$(date +%Y%m%d).sql

# Git 커밋 확인
git log --oneline -10
```

### 5.3 코드 배포 시 (매번)

```bash
# 1. 테스트
bash test-all-dashboards.sh

# 2. 빌드
npm run build

# 3. 재시작
pm2 restart webapp

# 4. 검증
curl http://localhost:3000
pm2 logs webapp --nostream --lines 20
```

---

## 6. 비상 연락처 & 리소스 📞

### 6.1 주요 파일 위치

```
/home/user/webapp/
├── src/
│   ├── index.tsx              # API 엔드포인트
│   ├── pages-manager.ts       # Manager 대시보드
│   ├── pages-director.ts      # Director 대시보드
│   └── pages-planner.ts       # Planner 대시보드
├── migrations/
│   ├── 0001_initial_schema.sql
│   ├── 0002_add_references.sql
│   └── 0003_create_notifications.sql
├── test-all-dashboards.sh     # 통합 테스트 스크립트
├── ecosystem.config.cjs       # PM2 설정
└── wrangler.jsonc             # Cloudflare 설정
```

### 6.2 유용한 명령어

```bash
# 서버 재시작
cd /home/user/webapp && npm run build && pm2 restart webapp

# 통합 테스트
cd /home/user/webapp && bash test-all-dashboards.sh

# D1 마이그레이션
cd /home/user/webapp && npx wrangler d1 migrations apply webapp-production --local

# 로그 확인
cd /home/user/webapp && pm2 logs webapp --nostream --lines 50

# Git 상태
cd /home/user/webapp && git status && git log --oneline -5
```

---

## 7. 알림 시스템 확장 계획 🚀

### 7.1 Director 대시보드 알림 추가 (다음 단계)

현재 Manager 대시보드에만 알림 UI가 있습니다.
Director 대시보드에도 동일한 알림 시스템을 추가할 예정입니다.

### 7.2 추가 알림 유형

- `feedback_updated`: 설계사가 피드백 제출 시
- `validation_needed`: Director 검증 필요 시
- `learning_flagged`: 학습 자료 등록 시

### 7.3 알림 설정 관리

- 알림 on/off 토글
- 폴링 주기 설정 (5초 / 10초 / 30초)
- 알림 소리 설정

---

## 8. 모니터링 & 성능 📊

### 8.1 성능 지표

- **페이지 로드 시간**: < 2초
- **API 응답 시간**: < 500ms
- **알림 폴링 주기**: 10초
- **자동 새로고침 주기**: 30초

### 8.2 리소스 사용량

```bash
# PM2 모니터링
pm2 monit

# 메모리 사용량
pm2 list | grep webapp
```

---

**마지막 업데이트**: 2026-04-27
**작성자**: AI Developer
**버전**: 1.0
