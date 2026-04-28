#!/bin/bash
# 북돋다 플랫폼 헬스체크 및 자동 복구 스크립트
# 30초마다 서비스 상태 확인, 3회 연속 실패시 자동 재시작

FAIL_COUNT=0
MAX_FAILS=3
CHECK_INTERVAL=30

echo "[$(date)] 헬스체크 시작 (간격: ${CHECK_INTERVAL}초, 최대 실패: ${MAX_FAILS}회)"

while true; do
  # HTTP 200 응답 확인
  if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    if [ $FAIL_COUNT -gt 0 ]; then
      echo "[$(date)] ✅ 서비스 복구됨 (이전 실패: $FAIL_COUNT회)"
    fi
    FAIL_COUNT=0
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo "[$(date)] ❌ 헬스체크 실패 ($FAIL_COUNT/$MAX_FAILS)"
    
    if [ $FAIL_COUNT -ge $MAX_FAILS ]; then
      echo "[$(date)] 🔄 자동 재시작 시작..."
      
      # 포트 정리
      fuser -k 3000/tcp 2>/dev/null || true
      sleep 2
      
      # PM2 재시작
      pm2 restart webapp
      sleep 5
      
      # 재시작 확인
      if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
        echo "[$(date)] ✅ 재시작 성공"
        FAIL_COUNT=0
      else
        echo "[$(date)] ⚠️ 재시작 후에도 서비스 응답 없음"
      fi
    fi
  fi
  
  sleep $CHECK_INTERVAL
done
