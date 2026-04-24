#!/bin/bash
# D1 데이터베이스 백업 스크립트
# 사용법: bash backup-d1.sh

echo "🔄 D1 데이터베이스 백업 시작..."

# 날짜 생성
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="d1-backup-${DATE}"

mkdir -p "$BACKUP_DIR"

# 모든 테이블 데이터 백업
echo "📊 Users 테이블 백업..."
npx wrangler d1 execute webapp-production --local \
  --command="SELECT * FROM users" \
  > "${BACKUP_DIR}/users.json"

echo "📊 Coaching Sessions 테이블 백업..."
npx wrangler d1 execute webapp-production --local \
  --command="SELECT * FROM coaching_sessions" \
  > "${BACKUP_DIR}/coaching_sessions.json"

echo "📊 Planner Profiles 테이블 백업..."
npx wrangler d1 execute webapp-production --local \
  --command="SELECT * FROM planner_profiles" \
  > "${BACKUP_DIR}/planner_profiles.json"

echo "📊 Knowledge Base 테이블 백업..."
npx wrangler d1 execute webapp-production --local \
  --command="SELECT * FROM knowledge_base" \
  > "${BACKUP_DIR}/knowledge_base.json"

echo "📊 External Links 테이블 백업..."
npx wrangler d1 execute webapp-production --local \
  --command="SELECT * FROM external_links" \
  > "${BACKUP_DIR}/external_links.json"

echo "✅ 백업 완료: ${BACKUP_DIR}/"
echo "📦 압축 중..."

tar -czf "${BACKUP_DIR}.tar.gz" "$BACKUP_DIR"
rm -rf "$BACKUP_DIR"

echo "✅ 백업 파일: ${BACKUP_DIR}.tar.gz"
echo "💾 크기: $(du -h ${BACKUP_DIR}.tar.gz | cut -f1)"
