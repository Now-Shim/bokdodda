# 북돋다 플랫폼 안정성 분석 및 개선안

## 🔴 오늘 발생한 주요 문제

### 1. **샌드박스 완전 멈춤 (Freeze)**
**증상:**
- 모든 명령이 타임아웃 (npm run build, pm2 delete 등)
- 기본 명령어(ls, cd)조차 응답 없음
- ResetSandbox 필요

**원인:**
- 메모리 누수 또는 CPU 과부하
- PM2 프로세스가 좀비 상태로 남아있음
- Wrangler dev server의 메모리 누적

**영향도:** ⚠️ **심각** - 완전 복구 필요

---

### 2. **Director 대시보드 JavaScript 오류**
**증상:**
- "openSessionDetail is not defined"
- "submitDirectorFeedback is not defined"
- "addExternalLink is not defined"

**원인:**
- 전역 함수 등록 불일치
- HTML에서 호출하는 함수와 실제 정의된 함수 불일치
- 26개 함수 중 5개가 미등록 또는 존재하지 않는 함수 등록

**영향도:** 🟡 **중간** - 대시보드 기능 불능

---

### 3. **외부 링크 크롤링 실패 (반복)**
**증상:**
- "DNS lookup failed: api.genspark.ai"
- "링크 크롤링 실패"

**원인:**
- Cloudflare Workers의 DNS 해석 문제 (로컬 개발 환경)
- GenSpark API 크롤링이 wrangler dev에서 불안정

**영향도:** 🟢 **낮음** - 코칭 기능 정상 작동, 품질만 약간 저하

---

## 🎯 **크레딧 문제가 아닌 이유**

1. **API 호출 실패 패턴이 다름**
   - 크레딧 부족: "402 Payment Required" 또는 "Quota exceeded"
   - 실제 에러: "DNS lookup failed", "timeout"

2. **모든 서비스가 일관되게 실패**
   - 크레딧 문제면 일부 API만 실패
   - 샌드박스 전체가 멈춘 것은 리소스 문제

3. **리셋 후 즉시 정상 작동**
   - 크레딧 문제면 리셋해도 해결 안됨
   - 메모리/프로세스 문제는 리셋으로 해결됨

---

## 🛡️ **근본 대책 (5단계)**

### **Phase 1: 즉시 적용 (오늘)**

#### 1.1 자동 헬스체크 및 재시작
```bash
# /home/user/webapp/health-check.sh
#!/bin/bash
# 30초마다 서비스 상태 확인, 3회 실패시 자동 재시작

FAIL_COUNT=0
MAX_FAILS=3

while true; do
  if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo "[$(date)] Health check failed ($FAIL_COUNT/$MAX_FAILS)"
    
    if [ $FAIL_COUNT -ge $MAX_FAILS ]; then
      echo "[$(date)] Restarting service..."
      fuser -k 3000/tcp 2>/dev/null || true
      pm2 restart webapp
      FAIL_COUNT=0
    fi
  else
    FAIL_COUNT=0
  fi
  
  sleep 30
done
```

#### 1.2 PM2 메모리 제한 설정
```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'webapp',
    script: 'npx',
    args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
    max_memory_restart: '200M',  // 200MB 초과시 자동 재시작
    kill_timeout: 5000,
    restart_delay: 3000,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
```

#### 1.3 외부 링크 크롤링 에러 무시 (Graceful Degradation)
```typescript
// src/index.tsx - 크롤링 실패해도 코칭 계속 진행
try {
  const crawlResult = await fetch(...)
  if (crawlResult.ok) {
    externalLinkData += content
  }
} catch (error) {
  console.warn('크롤링 실패 (무시하고 계속):', error.message)
  // 실패해도 에러 던지지 않음
}
```

---

### **Phase 2: 단기 개선 (내일)**

#### 2.1 타임아웃 설정 추가
```typescript
// 모든 외부 API 호출에 타임아웃
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 10000) // 10초

try {
  const response = await fetch(url, { 
    signal: controller.signal,
    headers: { ... }
  })
} catch (error) {
  if (error.name === 'AbortError') {
    console.warn('요청 타임아웃 (무시)')
  }
}
```

#### 2.2 로그 파일 크기 제한
```javascript
// ecosystem.config.cjs
{
  error_file: '/home/user/.pm2/logs/webapp-error.log',
  out_file: '/home/user/.pm2/logs/webapp-out.log',
  log_date_format: 'YYYY-MM-DD HH:mm:ss',
  merge_logs: true,
  max_size: '10M',  // 로그 파일 최대 10MB
  retain: 5         // 최근 5개만 보관
}
```

#### 2.3 전역 함수 검증 스크립트
```bash
# validate-functions.sh
# 빌드 전 자동 검증
grep -o "onclick=\"[^\"]*\"" src/pages-*.ts | \
  sed 's/.*onclick="\([^(]*\).*/\1/' | \
  sort -u > /tmp/used_functions.txt

grep "window\." src/pages-*.ts | \
  sed 's/.*window\.\([^ =]*\).*/\1/' | \
  sort -u > /tmp/registered_functions.txt

diff /tmp/used_functions.txt /tmp/registered_functions.txt
```

---

### **Phase 3: 중기 개선 (이번 주)**

#### 3.1 에러 모니터링 대시보드
- PM2 메트릭 수집
- 메모리 사용량 그래프
- 에러 발생 빈도 추적

#### 3.2 외부 API 호출 최소화
- GenSpark 크롤링을 선택적으로만 실행
- 캐싱 레이어 추가 (KV 스토리지)

#### 3.3 빌드 최적화
- 불필요한 의존성 제거
- Tree shaking 활성화

---

### **Phase 4: 장기 개선 (다음 주)**

#### 4.1 Production 환경으로 전환
- Cloudflare Pages에 실제 배포
- wrangler dev 대신 실제 Workers 환경

#### 4.2 분리된 서비스 아키텍처
- 크롤링 서비스 분리 (별도 Worker)
- AI 분석 서비스 분리
- 대시보드만 메인 앱에서 처리

---

### **Phase 5: 운영 안정화 (지속)**

#### 5.1 정기 점검
```bash
# Daily: 새벽 3시 자동 재시작
0 3 * * * cd /home/user/webapp && pm2 restart webapp
```

#### 5.2 백업 자동화
```bash
# Weekly: 일요일 밤 D1 백업
0 0 * * 0 cd /home/user/webapp && bash backup-d1.sh
```

---

## 📊 **즉시 적용 우선순위**

| 순위 | 작업 | 효과 | 소요시간 |
|------|------|------|----------|
| 🔴 1 | PM2 메모리 제한 설정 | 샌드박스 멈춤 방지 | 5분 |
| 🔴 2 | 외부 링크 에러 무시 | 크롤링 실패 무시 | 10분 |
| 🟡 3 | 헬스체크 스크립트 | 자동 복구 | 15분 |
| 🟡 4 | 전역 함수 검증 | JS 에러 사전 방지 | 20분 |
| 🟢 5 | 로그 크기 제한 | 디스크 공간 확보 | 5분 |

**총 소요시간: 약 1시간**

---

## 🎯 **결론**

**오늘 문제의 근본 원인:**
1. ❌ 크레딧 문제 아님
2. ✅ 샌드박스 메모리/프로세스 누적
3. ✅ JavaScript 전역 함수 불일치
4. ✅ 외부 API 크롤링 타임아웃

**즉시 적용할 핵심 대책:**
- PM2 메모리 제한으로 자동 재시작
- 크롤링 실패를 치명적 에러로 처리하지 않음
- 헬스체크로 자동 복구

이렇게 하면 **내일 아침에도 정상 작동**할 것입니다! 🚀
