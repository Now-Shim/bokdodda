#!/bin/bash

API_KEY="AIzaSyCsLcOnSVnCQsk0KSxFuAbz2qCsL9p5tXw"

echo "📊 Gemini API 할당량 확인 중..."
echo ""

# gemini-2.0-flash-001 테스트
echo "1️⃣ gemini-2.0-flash-001 테스트:"
curl -s "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"테스트"}]}]}' | jq -r '
    if .error then
      "❌ 에러: " + (.error.message // "알 수 없음") + " (status: " + (.error.status // "N/A") + ")"
    else
      "✅ 성공: " + (.candidates[0].content.parts[0].text[:50] // "응답 있음")
    end
  '

echo ""

# gemini-2.5-flash 테스트
echo "2️⃣ gemini-2.5-flash 테스트:"
curl -s "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"테스트"}]}]}' | jq -r '
    if .error then
      "❌ 에러: " + (.error.message // "알 수 없음") + " (status: " + (.error.status // "N/A") + ")"
    else
      "✅ 성공: " + (.candidates[0].content.parts[0].text[:50] // "응답 있음")
    end
  '

