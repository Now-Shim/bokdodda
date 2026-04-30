#!/bin/bash
# 북돋다 샌드박스 Keepalive 스크립트
# 매 5분마다 헬스체크를 수행하여 샌드박스가 중지되지 않도록 유지

LOG_FILE="/home/user/webapp/logs/keepalive.log"
mkdir -p /home/user/webapp/logs

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # PM2 상태 확인
    PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "error")
    
    if [ "$PM2_STATUS" != "online" ]; then
        echo "[$TIMESTAMP] ⚠️  PM2 not online (status: $PM2_STATUS), restarting..." | tee -a "$LOG_FILE"
        cd /home/user/webapp && pm2 restart webapp 2>&1 | tee -a "$LOG_FILE"
    fi
    
    # 헬스체크 (서버 응답 확인)
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" != "200" ]; then
        echo "[$TIMESTAMP] ⚠️  Server not responding (HTTP $HTTP_CODE), restarting..." | tee -a "$LOG_FILE"
        cd /home/user/webapp && pm2 restart webapp 2>&1 | tee -a "$LOG_FILE"
    else
        echo "[$TIMESTAMP] ✅ Server healthy (HTTP $HTTP_CODE, PM2 $PM2_STATUS)" >> "$LOG_FILE"
    fi
    
    # 5분 대기
    sleep 300
done
