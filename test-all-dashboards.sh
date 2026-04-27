#!/bin/bash
# 북돋다 플랫폼 - 전체 대시보드 통합 테스트
# 실행: bash test-all-dashboards.sh

echo "🧪 북돋다 플랫폼 통합 테스트 시작..."
echo "========================================"

BASE_URL="http://localhost:3000"
FAILED=0

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 테스트 함수
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "Testing $name... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} ($response)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_code, Got: $response)"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# 1. 기본 페이지 테스트
echo ""
echo "📄 1. 기본 페이지 테스트"
echo "------------------------"
test_endpoint "메인 페이지" "$BASE_URL/"
test_endpoint "Director 대시보드" "$BASE_URL/director"
test_endpoint "Manager 대시보드" "$BASE_URL/manager"
test_endpoint "Planner 대시보드" "$BASE_URL/planner"

# 2. API 엔드포인트 테스트
echo ""
echo "🔌 2. API 엔드포인트 테스트"
echo "------------------------"

# 로그인 테스트 (Director)
echo -n "Testing Director 로그인... "
login_response=$(curl -s -X POST "$BASE_URL/api/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"director@bukdotda.com","password":"director123"}')

if echo "$login_response" | grep -q "director"; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# Manager API
test_endpoint "Manager 전체현황 API" "$BASE_URL/api/manager/overview"
test_endpoint "Manager 세션목록 API" "$BASE_URL/api/manager/sessions"
test_endpoint "Manager 설계사목록 API" "$BASE_URL/api/manager/planners"

# Director API
test_endpoint "Director 대시보드 API" "$BASE_URL/api/director/dashboard"
test_endpoint "Director 세션목록 API" "$BASE_URL/api/director/sessions"

# Common API
test_endpoint "설계사 목록 API" "$BASE_URL/api/planners"
test_endpoint "교육 프로그램 API" "$BASE_URL/api/training-programs"

# 3. JavaScript 함수 검증
echo ""
echo "🔍 3. JavaScript 전역 함수 검증"
echo "------------------------"

check_js_functions() {
    local page=$1
    local url=$2
    shift 2
    local functions=("$@")
    
    echo "Checking $page..."
    page_content=$(curl -s "$url")
    
    for func in "${functions[@]}"; do
        echo -n "  - window.$func... "
        if echo "$page_content" | grep -q "window.$func = $func"; then
            echo -e "${GREEN}✓ PASS${NC}"
        else
            echo -e "${RED}✗ FAIL${NC} (전역 등록 누락)"
            FAILED=$((FAILED + 1))
        fi
    done
}

check_js_functions "Manager" "$BASE_URL/manager" \
    "switchTab" "logout" "applyFilters" "openNoteModal" "closeNoteModal" \
    "generateManagerAdvice" "submitManagerAction" "openManagerAnalysis"

check_js_functions "Director" "$BASE_URL/director" \
    "switchTab" "logout" "applyFilters" "uploadKnowledge" \
    "switchInputMode" "openSessionDetail" "closeSessionModal"

check_js_functions "Planner" "$BASE_URL/planner" \
    "closeModal"

# 4. D1 데이터베이스 연결 테스트
echo ""
echo "💾 4. 데이터베이스 테스트"
echo "------------------------"

echo -n "Testing D1 연결... "
# 세션 API를 통해 간접적으로 D1 연결 확인
db_test=$(curl -s "$BASE_URL/api/manager/sessions")
if echo "$db_test" | grep -q "sessions"; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# 5. 서비스 상태 확인
echo ""
echo "🚀 5. PM2 서비스 상태"
echo "------------------------"
pm2 list | grep webapp

# 최종 결과
echo ""
echo "========================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 모든 테스트 통과!${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAILED 개 테스트 실패${NC}"
    exit 1
fi
