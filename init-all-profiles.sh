#!/bin/bash
# 모든 설계사 프로필 초기화

echo "=== 전체 설계사 프로필 초기화 시작 ==="

for i in {1..10}; do
    echo "User ID $i 프로필 초기화 중..."
    curl -X POST http://localhost:3000/api/admin/init-profile/$i \
        -H "Content-Type: application/json" \
        -s | jq -r '.message // .error'
    sleep 0.5
done

echo ""
echo "=== 완료! ==="
