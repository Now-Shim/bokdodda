import type { Context } from 'hono'

export function renderManagerPage(c: Context) {
  return c.html(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>북돋다 - 관리자 대시보드</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
    <div class="container mx-auto px-4 py-6">
        <!-- 헤더 -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-users-cog text-white text-2xl"></i>
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            북돋다 관리자 대시보드
                        </h1>
                        <p class="text-gray-600 text-sm mt-1">설계사 코칭 모니터링 및 지원 시스템</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <!-- 알림 버튼 -->
                    <div class="relative">
                        <button onclick="toggleNotifications()" class="relative px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
                            <i class="fas fa-bell text-lg"></i>
                            <span id="notificationBadge" class="hidden absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"></span>
                        </button>
                        
                        <!-- 알림 드롭다운 -->
                        <div id="notificationPanel" class="hidden absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                            <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 class="font-bold text-gray-800">알림</h3>
                                <button onclick="markAllAsRead()" class="text-xs text-blue-600 hover:text-blue-800">모두 읽음</button>
                            </div>
                            <div id="notificationList" class="divide-y divide-gray-100">
                                <!-- 알림 목록이 여기에 표시됩니다 -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-right">
                        <p class="text-sm text-gray-600">환영합니다, <span id="managerName" class="font-bold text-blue-600">관리자님</span></p>
                        <button onclick="logout()" class="mt-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition">
                            <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 탭 메뉴 -->
        <div class="bg-white rounded-xl shadow-lg mb-6">
            <div class="flex border-b">
                <button onclick="switchTab('overview')" id="tab-overview" class="flex-1 py-4 px-6 font-semibold text-blue-600 border-b-2 border-blue-600 transition">
                    <i class="fas fa-chart-bar mr-2"></i>전체 현황
                </button>
                <button onclick="switchTab('sessions')" id="tab-sessions" class="flex-1 py-4 px-6 font-semibold text-gray-500 hover:text-blue-600 transition">
                    <i class="fas fa-comments mr-2"></i>코칭 세션 관리
                </button>
                <button onclick="switchTab('planners')" id="tab-planners" class="flex-1 py-4 px-6 font-semibold text-gray-500 hover:text-blue-600 transition">
                    <i class="fas fa-user-friends mr-2"></i>설계사 관리
                </button>
                <button onclick="switchTab('myPersonality')" id="tab-myPersonality" class="flex-1 py-4 px-6 font-semibold text-gray-500 hover:text-blue-600 transition">
                    <i class="fas fa-user-check mr-2"></i>내 성향 분석
                </button>
            </div>
        </div>

        <!-- 전체 현황 탭 -->
        <div id="content-overview" class="tab-content">
            <!-- 요약 통계 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-blue-100 text-sm">전체 설계사</p>
                            <h3 id="stat-totalPlanners" class="text-4xl font-bold mt-2">0</h3>
                        </div>
                        <i class="fas fa-users text-3xl text-blue-300"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-green-100 text-sm">총 코칭 세션</p>
                            <h3 id="stat-totalSessions" class="text-4xl font-bold mt-2">0</h3>
                        </div>
                        <i class="fas fa-comments text-3xl text-green-300"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-orange-100 text-sm">Manager 역할 분석</p>
                            <h3 id="stat-totalNotes" class="text-4xl font-bold mt-2">0</h3>
                        </div>
                        <i class="fas fa-user-cog text-3xl text-orange-300"></i>
                    </div>
                </div>
            </div>

            <!-- 최근 활동 -->
            <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 class="text-lg font-bold text-gray-800 mb-4">
                    <i class="fas fa-clock mr-2 text-blue-600"></i>최근 코칭 활동
                </h3>
                <div id="recentSessions" class="space-y-3">
                    <p class="text-gray-500 text-center py-8">로딩 중...</p>
                </div>
            </div>

            <!-- 주의가 필요한 설계사 -->
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="text-lg font-bold text-gray-800 mb-4">
                    <i class="fas fa-exclamation-triangle mr-2 text-orange-600"></i>주의가 필요한 설계사
                </h3>
                <div id="attentionPlanners" class="space-y-3">
                    <p class="text-gray-500 text-center py-8">로딩 중...</p>
                </div>
            </div>
        </div>

        <!-- 코칭 세션 관리 탭 -->
        <div id="content-sessions" class="tab-content hidden">
            <!-- 필터 -->
            <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">설계사</label>
                        <select id="filter-planner" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="all">전체</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">상황 유형</label>
                        <select id="filter-situation" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="all">전체</option>
                            <option value="신규고객">신규고객</option>
                            <option value="기존고객">기존고객</option>
                            <option value="클로징">클로징</option>
                            <option value="거절대응">거절대응</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="applyFilters()" class="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            <i class="fas fa-filter mr-2"></i>필터 적용
                        </button>
                    </div>
                </div>
            </div>

            <!-- 세션 목록 -->
            <div id="sessionsList" class="space-y-4">
                <p class="text-gray-500 text-center py-8">로딩 중...</p>
            </div>
        </div>

        <!-- 설계사 관리 탭 -->
        <div id="content-planners" class="tab-content hidden">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="plannersList">
                <p class="text-gray-500 text-center py-8 col-span-2">로딩 중...</p>
            </div>
        </div>

        <!-- 내 성향 분석 탭 -->
        <div id="content-myPersonality" class="tab-content hidden">
            <div class="max-w-4xl mx-auto">
                <!-- 성향 분석 상태 -->
                <div class="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div class="text-center mb-6">
                        <i class="fas fa-user-tie text-6xl text-blue-600 mb-4"></i>
                        <h2 class="text-3xl font-bold text-gray-800 mb-2">매니저 성향 분석</h2>
                        <p class="text-gray-600">관리자로서의 성향을 분석하여 효과적인 팀 관리 방향을 제시합니다.</p>
                    </div>

                    <!-- 성향 분석 상태 카드 -->
                    <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 text-center cursor-pointer hover:shadow-lg transition" onclick="openManagerPersonalityTest()">
                        <div class="mb-4">
                            <i class="fas fa-clipboard-check text-5xl text-blue-600"></i>
                        </div>
                        <h3 id="managerPersonalityStatus" class="text-2xl font-bold text-gray-800 mb-2">성향 분석 시작하기</h3>
                        <p class="text-gray-600 mb-4">클릭하여 매니저 성향 테스트를 시작하세요</p>
                        <div class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">
                            <i class="fas fa-arrow-right mr-2"></i>테스트 시작
                        </div>
                    </div>

                    <!-- 성향 분석 결과 표시 영역 (초기에는 숨김) -->
                    <div id="managerPersonalityResult" class="hidden mt-6">
                        <div class="border-t-2 border-gray-200 pt-6">
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="text-xl font-bold text-gray-800">
                                    <i class="fas fa-chart-bar mr-2 text-purple-600"></i>내 성향 분석 결과
                                </h4>
                                <button onclick="viewManagerPersonalityReport()" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold">
                                    <i class="fas fa-eye mr-2"></i>상세 보기
                                </button>
                            </div>
                            <div id="managerPersonalitySummary" class="bg-gray-50 rounded-lg p-6">
                                <!-- 요약 정보가 여기에 표시됩니다 -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 안내 사항 -->
                <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                    <div class="flex">
                        <i class="fas fa-info-circle text-2xl text-blue-600 mr-4 mt-1"></i>
                        <div>
                            <h4 class="text-lg font-bold text-gray-800 mb-2">매니저 성향 분석이란?</h4>
                            <p class="text-gray-700 mb-2">
                                관리자로서의 리더십 스타일, 팀원과의 소통 방식, 의사결정 패턴 등을 분석하여
                                효과적인 팀 관리 전략을 제시합니다.
                            </p>
                            <ul class="list-disc list-inside text-gray-700 space-y-1">
                                <li>관리자로서의 강점과 개선 영역 파악</li>
                                <li>팀원별 맞춤 관리 전략 수립</li>
                                <li>조직 내 커뮤니케이션 효율 향상</li>
                                <li>스트레스 관리 및 자기 개발 방향 제시</li>
                            </ul>
                            <p class="text-sm text-gray-600 mt-3">
                                <i class="fas fa-clock mr-1"></i>소요 시간: 약 5분 | 
                                <i class="fas fa-redo ml-3 mr-1"></i>언제든지 재검사 가능
                            </p>
                        </div>
                    </div>
                </div>

                <!-- 준비 중 메시지 -->
                <div class="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6 mt-6">
                    <div class="flex">
                        <i class="fas fa-construction text-2xl text-yellow-600 mr-4 mt-1"></i>
                        <div>
                            <h4 class="text-lg font-bold text-gray-800 mb-2">준비 중</h4>
                            <p class="text-gray-700">
                                매니저 성향 분석 질문지는 현재 개발 중입니다. 
                                곧 디렉터가 설정한 전문 질문지를 통해 심층적인 분석을 제공할 예정입니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 매니저 성향 분석 테스트 모달 -->
    <div id="managerPersonalityTestModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold">
                        <i class="fas fa-user-tie mr-2"></i>매니저 성향 분석 테스트
                    </h3>
                    <button onclick="closeManagerPersonalityTest()" class="text-white hover:text-gray-200 transition">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-6">
                <div class="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-6">
                    <div class="flex">
                        <i class="fas fa-info-circle text-2xl text-yellow-600 mr-3 mt-1"></i>
                        <div>
                            <h4 class="text-lg font-bold text-gray-800 mb-2">준비 중</h4>
                            <p class="text-gray-700">
                                매니저 성향 분석 질문지는 현재 디렉터가 설정 중입니다.<br>
                                질문 항목이 추가되면 여기에서 테스트를 진행할 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- 질문지가 추가되면 여기에 표시됩니다 -->
                <div id="managerTestQuestions" class="space-y-6">
                    <p class="text-center text-gray-500 py-12">
                        <i class="fas fa-hourglass-half text-5xl text-gray-400 mb-4 block"></i>
                        질문지 준비 중...
                    </p>
                </div>

                <div class="flex gap-4 mt-6">
                    <button onclick="submitManagerPersonalityTest()" class="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-semibold shadow-lg disabled:opacity-50" disabled>
                        <i class="fas fa-check mr-2"></i>분석 완료
                    </button>
                    <button onclick="closeManagerPersonalityTest()" class="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                        <i class="fas fa-times mr-2"></i>취소
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 매니저 성향 분석 결과 모달 -->
    <div id="managerPersonalityReportModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold">
                        <i class="fas fa-chart-bar mr-2"></i>내 성향 분석 결과
                    </h3>
                    <button onclick="closeManagerPersonalityReport()" class="text-white hover:text-gray-200 transition">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-6">
                <div id="managerPersonalityReportContent">
                    <p class="text-gray-500 text-center py-12">로딩 중...</p>
                </div>

                <div class="flex justify-center pt-6 border-t-2 border-gray-200 mt-6">
                    <button onclick="closeManagerPersonalityReport()" class="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                        <i class="fas fa-times mr-2"></i>닫기
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 설계사 상세 정보 모달 -->
    <div id="plannerDetailModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold">
                        <i class="fas fa-user-circle mr-2"></i><span id="detail-plannerName">설계사</span> 상세 정보
                    </h3>
                    <button onclick="closePlannerDetailModal()" class="text-white hover:text-gray-200 transition">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-6">
                <!-- 탭 메뉴 -->
                <div class="flex border-b mb-6">
                    <button onclick="switchDetailTab('profile')" id="detail-tab-profile" class="px-6 py-3 font-semibold text-blue-600 border-b-2 border-blue-600">
                        <i class="fas fa-user mr-2"></i>기본 정보 & 성향 분석
                    </button>
                    <button onclick="switchDetailTab('coaching')" id="detail-tab-coaching" class="px-6 py-3 font-semibold text-gray-500 hover:text-blue-600">
                        <i class="fas fa-comments mr-2"></i>코칭 이력
                    </button>
                </div>

                <!-- 기본 정보 & 성향 분석 탭 -->
                <div id="detail-content-profile" class="detail-tab-content">
                    <!-- 기본 정보 -->
                    <div class="bg-gray-50 rounded-xl p-6 mb-6">
                        <h4 class="text-lg font-bold text-gray-800 mb-4">
                            <i class="fas fa-id-card mr-2 text-blue-600"></i>기본 정보
                        </h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-500">이메일</p>
                                <p id="detail-email" class="font-semibold text-gray-800"></p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">전화번호</p>
                                <p id="detail-phone" class="font-semibold text-gray-800"></p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">경력</p>
                                <p id="detail-experience" class="font-semibold text-gray-800"></p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">전문 분야</p>
                                <p id="detail-specialization" class="font-semibold text-gray-800"></p>
                            </div>
                        </div>
                    </div>

                    <!-- 성향 분석 Report -->
                    <div id="detail-personality-section" class="bg-white rounded-xl border-2 border-blue-200 p-6 mb-6">
                        <h4 class="text-xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-brain mr-2 text-purple-600"></i>성향 분석 Report
                        </h4>
                        <div id="detail-personality-content">
                            <p class="text-gray-500 text-center py-8">로딩 중...</p>
                        </div>
                    </div>

                    <!-- 매니저의 의견 -->
                    <div class="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-300 p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="text-xl font-bold text-gray-800">
                                <i class="fas fa-user-tie mr-2 text-orange-600"></i>매니저의 의견
                            </h4>
                            <div class="flex gap-2">
                                <button onclick="openManagerOpinionTest()" id="start-manager-test-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg">
                                    <i class="fas fa-clipboard-check mr-2"></i>매니저 의견 입력
                                </button>
                                <button onclick="generateManagerOpinionComparison()" id="generate-comparison-btn" class="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-semibold shadow-lg hidden">
                                    <i class="fas fa-wand-magic-sparkles mr-2"></i>AI 비교 분석
                                </button>
                            </div>
                        </div>
                        <div class="bg-white rounded-lg p-4 mb-3 text-sm text-gray-600">
                            <i class="fas fa-info-circle mr-2 text-blue-500"></i>
                            매니저가 직접 설계사의 성향을 평가하고, AI가 설계사의 자가 평가와 비교 분석합니다. 매니저와 설계사의 인식 차이를 발견하고 관리 포인트를 제시합니다.
                        </div>
                        <div id="detail-manager-opinion" class="bg-white rounded-lg p-6 min-h-[300px]">
                            <p class="text-gray-500 italic text-center py-12">
                                <i class="fas fa-lightbulb text-5xl text-orange-400 mb-4 block"></i>
                                <span class="text-lg">'매니저 의견 입력' 버튼을 클릭하여 설계사 성향을 평가하세요.</span>
                            </p>
                        </div>
                    </div>
                </div>

                <!-- 코칭 이력 탭 -->
                <div id="detail-content-coaching" class="detail-tab-content hidden">
                    <!-- 필터 -->
                    <div class="bg-gray-50 rounded-xl p-4 mb-4">
                        <div class="flex gap-4">
                            <select id="detail-filter-situation" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="all">전체 상황</option>
                                <option value="신규고객">신규고객</option>
                                <option value="기존고객">기존고객</option>
                                <option value="계약거절">계약거절</option>
                                <option value="상품설명">상품설명</option>
                            </select>
                            <button onclick="applyDetailFilters()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                <i class="fas fa-filter mr-2"></i>필터 적용
                            </button>
                        </div>
                    </div>

                    <!-- 코칭 세션 목록 -->
                    <div id="detail-coaching-list" class="space-y-4">
                        <p class="text-gray-500 text-center py-8">로딩 중...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 매니저 의견 입력 모달 -->
    <div id="managerOpinionTestModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-2xl">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold">
                        <i class="fas fa-user-tie mr-2"></i>매니저 의견 - 설계사 성향 평가
                    </h3>
                    <button onclick="closeManagerOpinionTest()" class="text-white hover:text-gray-200 transition">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-6">
                <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
                    <p class="text-sm text-gray-700">
                        <i class="fas fa-info-circle mr-2 text-blue-600"></i>
                        <strong>매니저 시점에서</strong> 이 설계사의 성향을 평가해주세요. 설계사의 자가 평가와 비교하여 인식 차이를 분석합니다.
                    </p>
                </div>

                <div class="space-y-6">
                    <!-- 질문 1: 에너지 방향 -->
                    <div class="bg-gray-50 rounded-lg p-6">
                        <h4 class="font-bold text-gray-800 mb-3">
                            <span class="bg-purple-600 text-white w-8 h-8 rounded-full inline-flex items-center justify-center mr-2">1</span>
                            에너지 방향
                        </h4>
                        <p class="text-sm text-gray-600 mb-4">이 설계사는 어디서 에너지를 얻나요?</p>
                        <div class="space-y-2">
                            <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-400 transition">
                                <input type="radio" name="manager_energyDirection" value="외향형 (E)" class="mr-3">
                                <span class="font-semibold">외향형 (E)</span> - 사람들과의 만남에서 활력을 얻고, 적극적으로 소통함
                            </label>
                            <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-400 transition">
                                <input type="radio" name="manager_energyDirection" value="내향형 (I)" class="mr-3">
                                <span class="font-semibold">내향형 (I)</span> - 혼자 생각하는 시간에서 에너지를 얻고, 신중하게 접근함
                            </label>
                        </div>
                    </div>

                    <!-- 질문 2: 정보 인식 -->
                    <div class="bg-gray-50 rounded-lg p-6">
                        <h4 class="font-bold text-gray-800 mb-3">
                            <span class="bg-blue-600 text-white w-8 h-8 rounded-full inline-flex items-center justify-center mr-2">2</span>
                            정보 인식 방식
                        </h4>
                        <p class="text-sm text-gray-600 mb-4">이 설계사는 고객 정보를 어떻게 파악하나요?</p>
                        <div class="space-y-2">
                            <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition">
                                <input type="radio" name="manager_informationProcessing" value="감각형 (S)" class="mr-3">
                                <span class="font-semibold">감각형 (S)</span> - 구체적 사실과 현재 상황에 집중함
                            </label>
                            <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition">
                                <input type="radio" name="manager_informationProcessing" value="직관형 (N)" class="mr-3">
                                <span class="font-semibold">직관형 (N)</span> - 패턴과 가능성, 미래 전망에 주목함
                            </label>
                        </div>
                    </div>

                    <!-- 질문 3: 의사 결정 -->
                    <div class="bg-gray-50 rounded-lg p-6">
                        <h4 class="font-bold text-gray-800 mb-3">
                            <span class="bg-green-600 text-white w-8 h-8 rounded-full inline-flex items-center justify-center mr-2">3</span>
                            의사 결정 방식
                        </h4>
                        <p class="text-sm text-gray-600 mb-4">이 설계사는 어떻게 결정을 내리나요?</p>
                        <div class="space-y-2">
                            <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-400 transition">
                                <input type="radio" name="manager_decisionMaking" value="사고형 (T)" class="mr-3">
                                <span class="font-semibold">사고형 (T)</span> - 논리와 객관적 분석을 우선시함
                            </label>
                            <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-400 transition">
                                <input type="radio" name="manager_decisionMaking" value="감정형 (F)" class="mr-3">
                                <span class="font-semibold">감정형 (F)</span> - 사람과 감정, 관계를 중요하게 고려함
                            </label>
                        </div>
                    </div>

                    <!-- 질문 4: 성취 동기 -->
                    <div class="bg-gray-50 rounded-lg p-6">
                        <h4 class="font-bold text-gray-800 mb-3">
                            <span class="bg-orange-600 text-white w-8 h-8 rounded-full inline-flex items-center justify-center mr-2">4</span>
                            성취 동기
                        </h4>
                        <p class="text-sm text-gray-600 mb-4">이 설계사의 주된 동기는 무엇인가요?</p>
                        <div class="space-y-2">
                            <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-400 transition">
                                <input type="radio" name="manager_achievementMotivation" value="숫자 지향" class="mr-3">
                                <span class="font-semibold">숫자 지향</span> - 실적, 수치, 목표 달성에 집중
                            </label>
                            <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-400 transition">
                                <input type="radio" name="manager_achievementMotivation" value="관계 지향" class="mr-3">
                                <span class="font-semibold">관계 지향</span> - 고객과의 신뢰, 장기 관계 구축 중시
                            </label>
                        </div>
                    </div>

                    <!-- 질문 5: 스트레스 회복 -->
                    <div class="bg-gray-50 rounded-lg p-6">
                        <h4 class="font-bold text-gray-800 mb-3">
                            <span class="bg-pink-600 text-white w-8 h-8 rounded-full inline-flex items-center justify-center mr-2">5</span>
                            스트레스 회복 방식
                        </h4>
                        <p class="text-sm text-gray-600 mb-4">이 설계사는 힘든 상황을 어떻게 극복하나요?</p>
                        <div class="space-y-2">
                            <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-pink-400 transition">
                                <input type="radio" name="manager_stressRecovery" value="적극 해결형" class="mr-3">
                                <span class="font-semibold">적극 해결형</span> - 즉시 행동하고 적극적으로 문제 해결
                            </label>
                            <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-pink-400 transition">
                                <input type="radio" name="manager_stressRecovery" value="성찰 회복형" class="mr-3">
                                <span class="font-semibold">성찰 회복형</span> - 시간을 두고 생각하며 회복
                            </label>
                        </div>
                    </div>

                    <!-- 질문 6: 전문성 선호 -->
                    <div class="bg-gray-50 rounded-lg p-6">
                        <h4 class="font-bold text-gray-800 mb-3">
                            <span class="bg-indigo-600 text-white w-8 h-8 rounded-full inline-flex items-center justify-center mr-2">6</span>
                            전문성 선호
                        </h4>
                        <p class="text-sm text-gray-600 mb-4">이 설계사가 선호하는 업무 스타일은?</p>
                        <div class="space-y-2">
                            <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-400 transition">
                                <input type="radio" name="manager_professionalPreference" value="전문가형" class="mr-3">
                                <span class="font-semibold">전문가형</span> - 한 분야 깊이 있는 전문성 추구
                            </label>
                            <label class="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-400 transition">
                                <input type="radio" name="manager_professionalPreference" value="제너럴리스트형" class="mr-3">
                                <span class="font-semibold">제너럴리스트형</span> - 다양한 상품과 고객층 대응
                            </label>
                        </div>
                    </div>
                </div>

                <div class="flex gap-4 mt-6">
                    <button onclick="submitManagerOpinionTest()" class="flex-1 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition font-semibold shadow-lg">
                        <i class="fas fa-check mr-2"></i>평가 완료
                    </button>
                    <button onclick="closeManagerOpinionTest()" class="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                        <i class="fas fa-times mr-2"></i>취소
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Manager 추가 역할 모달 -->
    <div id="noteModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-2xl">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold">
                        <i class="fas fa-user-cog mr-2"></i>Manager 추가 역할 분석
                    </h3>
                    <button onclick="closeNoteModal()" class="text-white hover:text-gray-200 transition">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-6">
                <input type="hidden" id="modal-sessionId">
                
                <!-- 세션 정보 -->
                <div class="bg-gray-50 rounded-lg p-4 mb-6">
                    <p class="text-sm text-gray-600 mb-2"><i class="fas fa-user mr-2"></i>설계사: <span id="modal-plannerName" class="font-bold"></span></p>
                    <p class="text-sm text-gray-600 mb-2"><i class="fas fa-calendar mr-2"></i>일시: <span id="modal-sessionDate"></span></p>
                    <p class="text-sm text-gray-600"><i class="fas fa-tag mr-2"></i>상황: <span id="modal-situationType"></span></p>
                </div>
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">설계사의 질문</label>
                    <div id="modal-context" class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-gray-800"></div>
                </div>
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">AI 코칭 내용</label>
                    <div id="modal-coachingAdvice" class="bg-green-50 border-l-4 border-green-500 p-4 rounded text-gray-800 whitespace-pre-wrap"></div>
                </div>
                
                <!-- AI 생성된 Manager 추가 역할 (확대) -->
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-3">
                        <label class="block text-lg font-bold text-gray-800">
                            <i class="fas fa-robot mr-2 text-orange-600"></i>💡 AI 추천: Manager가 해야 할 추가 역할
                        </label>
                        <button onclick="generateManagerAdvice()" id="generate-advice-btn" class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-bold shadow-lg">
                            <i class="fas fa-wand-magic-sparkles mr-2"></i>AI 분석 시작
                        </button>
                    </div>
                    <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-2 mb-2">
                        <div class="bg-white rounded-lg p-3 text-sm text-gray-600">
                            <i class="fas fa-info-circle mr-2 text-blue-500"></i>
                            <span class="font-semibold">디렉터 업로드 자료(매니저용/공용)</span>와 <span class="font-semibold">외부 링크</span>를 참고하여, 설계사의 <span class="text-orange-600 font-bold">자존감 향상</span>과 <span class="text-orange-600 font-bold">구체적 실행</span>에 초점을 맞춘 코칭을 제공합니다.
                        </div>
                    </div>
                    <div id="modal-managerAIAdvice" class="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-400 p-6 rounded-xl text-gray-800 min-h-[500px] max-h-[700px] overflow-y-auto shadow-inner text-base leading-relaxed">
                        <p class="text-gray-500 italic text-center py-12">
                            <i class="fas fa-lightbulb text-5xl text-orange-400 mb-6 block"></i>
                            <span class="text-lg">👆 <span class="font-bold">'AI 분석 시작'</span> 버튼을 클릭하면,<br><br>
                            이 코칭 케이스에서 Manager가 추가로 수행해야 할 역할을<br>
                            <span class="text-orange-600 font-bold text-xl">자존감 향상</span>과 <span class="text-orange-600 font-bold text-xl">구체적 실행</span> 중심으로<br>
                            AI가 분석해드립니다.</span>
                        </p>
                    </div>
                </div>
                
                <!-- AI 코칭 피드백 (용도 변경) -->
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-comments mr-2 text-blue-600"></i>AI 코칭 피드백 (선택사항)
                    </label>
                    <p class="text-xs text-gray-500 mb-2">
                        💬 위 AI 추천 내용에 대한 피드백을 작성해주세요. 향후 AI 코칭 개선에 반영됩니다.
                    </p>
                    <textarea id="modal-managerNote" rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="예: 'AI 추천이 매우 구체적이고 도움이 되었습니다' 또는 '좀 더 ~한 내용이 추가되면 좋겠습니다' 등"></textarea>
                </div>
                
                <div class="flex gap-4">
                    <button onclick="submitManagerAction()" class="flex-1 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition font-semibold shadow-lg">
                        <i class="fas fa-save mr-2"></i>저장
                    </button>
                    <button onclick="closeNoteModal()" class="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                        <i class="fas fa-times mr-2"></i>취소
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/manager-dashboard.js"></script>
</body>
</html>
  `)
}
