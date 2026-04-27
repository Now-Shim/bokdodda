# 북돋다 플랫폼 운영 가이드

## 📋 **목차**
1. [안정적 운영 체계](#안정적-운영-체계)
2. [실시간 알림 시스템](#실시간-알림-시스템)
3. [통합 테스트](#통합-테스트)
4. [문제 해결 가이드](#문제-해결-가이드)
5. [일일 점검 체크리스트](#일일-점검-체크리스트)

---

## 🛡️ **안정적 운영 체계**

### **1. 전체 대시보드 전역 함수 검증 완료**

모든 대시보드(Director/Manager/Planner)의 JavaScript 함수가 전역 스코프에 등록되어 있습니다.

#### **Manager 대시보드 전역 함수**
```javascript
window.switchTab = switchTab
window.logout = logout
window.applyFilters = applyFilters
window.openNoteModal = openNoteModal
window.closeNoteModal = closeNoteModal
window.generateManagerAdvice = generateManagerAdvice
window.submitManagerAction = submitManagerAction
window.viewPlannerDetail = viewPlannerDetail
window.openManagerAnalysis = openManagerAnalysis
window.toggleNotifications = toggleNotifications
window.handleNotificationClick = handleNotificationClick
window.markAllAsRead = markAllAsRead
```

#### **Director 대시보드 전역 함수**
```javascript
window.switchTab = switchTab
window.logout = logout
window.applyFilters = applyFilters
window.uploadKnowledge = uploadKnowledge
window.clearUploadForm = clearUploadForm
window.switchInputMode = switchInputMode
window.openSessionDetail = openSessionDetail
window.closeSessionModal = closeSessionModal
window.submitDirectorFeedback = submitDirectorFeedback
window.addExternalLink = addExternalLink
window.toggleLinkStatus = toggleLinkStatus
window.deleteLink = deleteLink
window.deleteKnowledge = deleteKnowledge
window.editKnowledge = editKnowledge
window.cancelEdit = cancelEdit
window.saveEdit = saveEdit
```

#### **Planner 대시보드 전역 함수**
```javascript
window.closeModal = closeModal
```

---

## 🔔 **실시간 알림 시스템**

### **개요**
- 설계사가 코칭 요청 시 자동으로 Manager와 Director에게 실시간 알림
- 10초마다 자동으로 새 알림 체크 (폴링 방식)
- 알림 클릭 시 해당 세션으로 바로 이동

### **알림 발생 조건**

1. **새 코칭 요청** (`new_session`)
   - 설계사가 코칭 의뢰 시
   - Manager와 Director 모두에게 알림

2. **피드백 업데이트** (향후 추가 예정)
   - 설계사가 피드백 제출 시
   - Manager에게 알림

3. **검증 필요** (향후 추가 예정)
   - Director 검증이 필요한 세션
   - Director에게 알림

### **알림 UI 구성**

#### **Manager 대시보드**
- 위치: 헤더 우측 (로그아웃 버튼 왼쪽)
- 알림 벨 아이콘 + 빨간색 배지 (읽지 않은 개수)
- 드롭다운 패널: 최대 10개 최신 알림 표시
- 자동 갱신: 10초마다 + 30초 자동 새로고침 시

#### **알림 동작 흐름**
```
설계사 코칭 요청
    ↓
API: POST /api/coaching-sessions
    ↓
D1 notifications 테이블에 알림 저장
    ↓
Manager/Director 대시보드: 10초마다 폴링
    ↓
GET /api/notifications/:userId
    ↓
알림 배지 업데이트 (빨간색 숫자)
    ↓
사용자 알림 클릭
    ↓
POST /api/notifications/:id/read (읽음 처리)
    ↓
해당 세션으로 자동 이동
```

### **알림 API 엔드포인트**

```typescript
// 읽지 않은 알림 조회
GET /api/notifications/:userId
Response: {
  notifications: Array,
  unreadCount: number
}

// 알림 읽음 처리
POST /api/notifications/:id/read
Response: { success: true }

// 모두 읽음 처리
POST /api/notifications/read-all/:userId
Response: { success: true }
```

### **D1 데이터베이스 스키마**

```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  user_role TEXT NOT NULL, -- 'manager', 'director'
  type TEXT NOT NULL, -- 'new_session', 'feedback_updated', 'validation_needed'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  session_id INTEGER,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

---

## 🧪 **통합 테스트**

### **자동 테스트 스크립트 실행**

```bash
cd /home/user/webapp
bash test-all-dashboards.sh
```

### **테스트 항목**

#### **1. 기본 페이지 테스트**
- 메인 페이지 (200 OK)
- Director 대시보드 (200 OK)
- Manager 대시보드 (200 OK)
- Planner 대시보드 (200 OK)

#### **2. API 엔드포인트 테스트**
- Director 로그인
- Manager 전체현황 API
- Manager 세션목록 API
- Manager 설계사목록 API
- Director 대시보드 API
- Director 세션목록 API
- 설계사 목록 API
- 교육 프로그램 API

#### **3. JavaScript 전역 함수 검증**
- Manager: 11개 함수
- Director: 14개 함수
- Planner: 1개 함수

#### **4. 데이터베이스 테스트**
- D1 연결 확인
- 세션 데이터 조회

#### **5. PM2 서비스 상태**
- webapp 프로세스 online 확인

### **예상 결과**

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

💾 4. 데이터베이스 테스트
------------------------
Testing D1 연결... ✓ PASS

🚀 5. PM2 서비스 상태
------------------------
│ webapp    │ online    │

========================================
✅ 모든 테스트 통과!
```

---

## 🛠️ **문제 해결 가이드**

### **1. 대시보드가 작동하지 않을 때**

#### **증상**
- 버튼 클릭 시 아무 반응 없음
- Console 에러: "XXX is not defined"

#### **해결 방법**
```bash
# 1. 통합 테스트 실행
cd /home/user/webapp
bash test-all-dashboards.sh

# 2. JavaScript 전역 함수 확인
# 테스트 결과에서 FAIL이 있는 함수 확인

# 3. 해당 페이지 파일 확인
# pages-manager.ts, pages-director.ts, pages-planner.ts

# 4. 빌드 및 재시작
npm run build
pm2 restart webapp

# 5. 재테스트
bash test-all-dashboards.sh
```

### **2. 알림이 표시되지 않을 때**

#### **증상**
- 코칭 요청 후에도 알림 배지가 나타나지 않음

#### **해결 방법**
```bash
# 1. D1 알림 테이블 확인
npx wrangler d1 execute webapp-production --local \
  --command="SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5"

# 2. 알림 테이블이 없다면 생성
npx wrangler d1 execute webapp-production --local \
  --file=./migrations/0003_create_notifications.sql

# 3. 서버 재시작
pm2 restart webapp

# 4. 브라우저 강력 새로고침
# Ctrl+Shift+R (Chrome/Firefox)
```

### **3. PM2 프로세스가 죽었을 때**

#### **증상**
- 웹사이트 접속 불가
- PM2 list에서 webapp이 stopped 또는 errored

#### **해결 방법**
```bash
# 1. PM2 로그 확인
pm2 logs webapp --lines 50

# 2. 포트 정리
fuser -k 3000/tcp 2>/dev/null || true

# 3. 빌드 및 재시작
cd /home/user/webapp
npm run build
pm2 restart webapp

# 4. 상태 확인
pm2 list
```

### **4. D1 데이터베이스 문제**

#### **증상**
- API 에러: "D1 is not defined"
- 세션 저장/조회 실패

#### **해결 방법**
```bash
# 1. D1 마이그레이션 재실행
cd /home/user/webapp
npx wrangler d1 migrations apply webapp-production --local

# 2. 테이블 구조 확인
npx wrangler d1 execute webapp-production --local \
  --command="SELECT name FROM sqlite_master WHERE type='table'"

# 3. Seed 데이터 재입력
npx wrangler d1 execute webapp-production --local --file=./seed.sql

# 4. 서버 재시작
pm2 restart webapp
```

---

## ✅ **일일 점검 체크리스트**

### **매일 아침 체크 (5분)**

```bash
cd /home/user/webapp

# 1. 서비스 상태 확인
pm2 list
# → webapp이 online이어야 함

# 2. 통합 테스트 실행
bash test-all-dashboards.sh
# → 모든 테스트 통과 확인

# 3. 최근 에러 로그 확인
pm2 logs webapp --lines 20 --nostream | grep -i error
# → 에러가 없어야 함

# 4. 알림 시스템 확인
# Manager 대시보드 접속 → 알림 벨 아이콘 확인
```

### **매주 점검 (15분)**

```bash
# 1. D1 데이터베이스 백업
cd /home/user/webapp
npx wrangler d1 export webapp-production --local \
  --output=./backups/db-backup-$(date +%Y%m%d).sql

# 2. 전체 프로젝트 백업
tar -czf ~/backups/webapp-backup-$(date +%Y%m%d).tar.gz \
  /home/user/webapp \
  --exclude=node_modules \
  --exclude=.wrangler

# 3. Git 상태 확인
git status
git log --oneline -10

# 4. 디스크 사용량 확인
du -sh /home/user/webapp
df -h
```

### **문제 발생 시 긴급 대응**

```bash
# 1. 서비스 즉시 복구
cd /home/user/webapp
fuser -k 3000/tcp 2>/dev/null || true
pm2 delete all
npm run build
pm2 start ecosystem.config.cjs

# 2. 문제 로그 수집
pm2 logs webapp --lines 100 --nostream > ~/error-logs-$(date +%Y%m%d-%H%M).txt

# 3. 테스트 실행 및 결과 저장
bash test-all-dashboards.sh > ~/test-results-$(date +%Y%m%d-%H%M).txt
```

---

## 📊 **모니터링 대시보드**

### **주요 지표**

| 항목 | 정상 범위 | 확인 방법 |
|------|----------|----------|
| **PM2 상태** | online | `pm2 list` |
| **메모리 사용** | < 100MB | `pm2 list` |
| **응답 시간** | < 500ms | `curl -w "@%{time_total}s" http://localhost:3000` |
| **에러 로그** | 0개 | `pm2 logs webapp --lines 50 --nostream \| grep -i error` |
| **통합 테스트** | 100% PASS | `bash test-all-dashboards.sh` |

---

## 🚀 **향후 개선 계획**

### **Phase 1 (완료)** ✅
- 전체 대시보드 전역 함수 등록
- 통합 테스트 스크립트
- 실시간 알림 시스템 (Manager)

### **Phase 2 (진행 중)** 🚧
- Director 대시보드 알림 UI 추가
- 알림 타입 확장 (피드백, 검증 요청 등)

### **Phase 3 (계획)** 📋
- WebSocket 기반 실시간 알림 (Cloudflare Durable Objects)
- 알림 설정 (켜기/끄기, 알림 타입 선택)
- 이메일/SMS 알림 통합

### **Phase 4 (계획)** 📋
- 에러 자동 복구 시스템
- 성능 모니터링 대시보드
- 자동 백업 스케줄러

---

## 📞 **지원**

문제가 발생하거나 질문이 있으시면:
1. 이 운영 가이드의 "문제 해결 가이드" 참고
2. 통합 테스트 실행: `bash test-all-dashboards.sh`
3. 에러 로그 수집: `pm2 logs webapp --lines 100`

---

**최종 업데이트**: 2026-04-27
**작성자**: AI Assistant
**버전**: 1.0.0
