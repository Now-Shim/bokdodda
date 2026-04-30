#!/bin/bash
# 북돋다 시작 전 안정성 체크 스크립트
# PM2 재시작 시 DB 초기화 및 연결 확인

echo "🔍 [Startup Check] 시작..."

# 1. D1 Database 연결 확인
echo "📊 [DB Check] D1 Database 연결 확인 중..."
DB_CHECK=$(cd /home/user/webapp && npx wrangler d1 execute webapp-production --local --command="SELECT 1" 2>&1)

if echo "$DB_CHECK" | grep -q "success"; then
    echo "✅ [DB Check] D1 Database 정상"
else
    echo "⚠️  [DB Check] D1 Database 초기화 필요"
    cd /home/user/webapp && npx wrangler d1 migrations apply webapp-production --local
fi

# 2. 포트 3000 확인 및 정리
echo "🔌 [Port Check] 포트 3000 확인 중..."
if lsof -i:3000 -t >/dev/null 2>&1; then
    echo "⚠️  [Port Check] 포트 3000 사용 중, 정리합니다..."
    fuser -k 3000/tcp 2>/dev/null || true
    sleep 2
fi
echo "✅ [Port Check] 포트 3000 사용 가능"

# 3. PM2 상태 확인
echo "🔄 [PM2 Check] PM2 프로세스 확인 중..."
PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "stopped")

if [ "$PM2_STATUS" != "online" ]; then
    echo "⚠️  [PM2 Check] PM2가 중지됨, 시작합니다..."
    cd /home/user/webapp && pm2 start ecosystem.config.cjs
    sleep 5
fi

# 4. 서버 응답 확인 (최대 30초 대기)
echo "🌐 [Server Check] 서버 응답 확인 중..."
for i in {1..10}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ [Server Check] 서버 정상 응답 (HTTP 200)"
        echo "🎉 [Startup Check] 모든 체크 완료! 북돋다가 준비되었습니다."
        exit 0
    fi
    echo "⏳ [Server Check] 대기 중... (시도 $i/10)"
    sleep 3
done

echo "❌ [Server Check] 서버 응답 없음, 재시작이 필요할 수 있습니다."
exit 1
