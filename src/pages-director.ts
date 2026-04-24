import type { Context } from 'hono'

export function renderDirectorPage(c: Context) {
  return c.html(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>북돋다 - Director 대시보드</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
        // PDF.js worker 설정
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
    </script>

</head>
<body class="bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
    <div class="container mx-auto px-4 py-6">
        <!-- 헤더 -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-book text-white text-2xl"></i>
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            북돋다 Director 대시보드
                        </h1>
                        <p class="text-gray-600 text-sm mt-1">Book | Jar | All - 센터장 통합 관리 시스템</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-600">환영합니다, <span id="directorName" class="font-bold text-purple-600">센터장님</span></p>
                    <button onclick="logout()" class="mt-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition">
                        <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
                    </button>
                </div>
            </div>
        </div>

        <!-- 탭 메뉴 -->
        <div class="bg-white rounded-xl shadow-lg mb-6">
            <div class="flex border-b">
                <button onclick="switchTab('dashboard')" id="tab-dashboard" class="flex-1 py-4 px-6 font-semibold text-purple-600 border-b-2 border-purple-600 transition">
                    <i class="fas fa-chart-line mr-2"></i>통계 대시보드
                </button>
                <button onclick="switchTab('sessions')" id="tab-sessions" class="flex-1 py-4 px-6 font-semibold text-gray-500 hover:text-purple-600 transition">
                    <i class="fas fa-comments mr-2"></i>코칭 세션 검토
                </button>
                <button onclick="switchTab('upload')" id="tab-upload" class="flex-1 py-4 px-6 font-semibold text-gray-500 hover:text-purple-600 transition">
                    <i class="fas fa-upload mr-2"></i>자료 업로드
                </button>
                <button onclick="switchTab('links')" id="tab-links" class="flex-1 py-4 px-6 font-semibold text-gray-500 hover:text-purple-600 transition">
                    <i class="fas fa-link mr-2"></i>외부 링크 관리
                </button>
            </div>
        </div>

        <!-- 통계 대시보드 탭 -->
        <div id="content-dashboard" class="tab-content">
            <!-- 주요 통계 카드 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-purple-100 text-sm">전체 설계사</p>
                            <h3 id="stat-totalPlanners" class="text-4xl font-bold mt-2">0</h3>
                        </div>
                        <i class="fas fa-users text-3xl text-purple-300"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-blue-100 text-sm">전체 코칭 세션</p>
                            <h3 id="stat-totalSessions" class="text-4xl font-bold mt-2">0</h3>
                        </div>
                        <i class="fas fa-comments text-3xl text-blue-300"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-green-100 text-sm">검증 완료</p>
                            <h3 id="stat-validatedSessions" class="text-4xl font-bold mt-2">0</h3>
                        </div>
                        <i class="fas fa-check-circle text-3xl text-green-300"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-orange-100 text-sm">재학습 데이터</p>
                            <h3 id="stat-learningData" class="text-4xl font-bold mt-2">0</h3>
                        </div>
                        <i class="fas fa-brain text-3xl text-orange-300"></i>
                    </div>
                </div>
            </div>

            <!-- 차트 영역 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-chart-bar mr-2 text-purple-600"></i>설계사별 코칭 세션 수
                    </h3>
                    <canvas id="chartSessions"></canvas>
                </div>
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-chart-pie mr-2 text-blue-600"></i>코칭 효과성 분포
                    </h3>
                    <canvas id="chartEffectiveness"></canvas>
                </div>
            </div>

            <!-- 최근 우수 사례 -->
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="text-lg font-bold text-gray-800 mb-4">
                    <i class="fas fa-star mr-2 text-yellow-500"></i>최근 우수 사례 (재학습 데이터)
                </h3>
                <div id="excellentCases" class="space-y-3">
                    <p class="text-gray-500 text-center py-8">로딩 중...</p>
                </div>
            </div>
        </div>

        <!-- 코칭 세션 검토 탭 -->
        <div id="content-sessions" class="tab-content hidden">
            <!-- 필터 -->
            <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">검증 상태</label>
                        <select id="filter-validated" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                            <option value="all">전체</option>
                            <option value="pending">미검증</option>
                            <option value="validated">검증완료</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">설계사</label>
                        <select id="filter-planner" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                            <option value="all">전체</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">효과성</label>
                        <select id="filter-effectiveness" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                            <option value="all">전체</option>
                            <option value="5">★★★★★ (5점)</option>
                            <option value="4">★★★★ (4점)</option>
                            <option value="3">★★★ (3점 이하)</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="applyFilters()" class="w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
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

        <!-- 자료 업로드 탭 -->
        <div id="content-upload" class="tab-content hidden">
            <div class="bg-white rounded-xl shadow-lg p-8">
                <h3 class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-book-medical mr-3 text-purple-600"></i>교육 자료 및 노하우 업로드
                </h3>
                <p class="text-gray-600 mb-6">30년 현장 경험과 노하우를 축적하여 AI 코칭에 반영합니다.</p>
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">자료 제목</label>
                    <input type="text" id="upload-title" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="예: 신규 고객 첫 만남 전략">
                </div>
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">카테고리</label>
                    <select id="upload-category" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="영업기법">영업기법</option>
                        <option value="고객관리">고객관리</option>
                        <option value="상품지식">상품지식</option>
                        <option value="클로징">클로징</option>
                        <option value="관계구축">관계구축</option>
                        <option value="기타">기타</option>
                    </select>
                </div>
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">대상</label>
                    <select id="upload-target" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="both">👥 공용 (설계사 + 관리자 모두)</option>
                        <option value="planner">👤 설계사 전용</option>
                        <option value="manager">👔 관리자 전용</option>
                    </select>
                </div>
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        내용 입력 방식
                    </label>
                    <div class="flex gap-4 mb-4">
                        <button type="button" id="input-mode-text" onclick="switchInputMode('text')" class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                            <i class="fas fa-keyboard mr-2"></i>직접 입력
                        </button>
                        <button type="button" id="input-mode-file" onclick="switchInputMode('file')" class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                            <i class="fas fa-file-upload mr-2"></i>파일 업로드 (.txt, .pdf)
                        </button>
                    </div>
                </div>
                
                <!-- 직접 입력 모드 -->
                <div id="input-text-mode" class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">내용 (마크다운 지원)</label>
                    <textarea id="upload-content" rows="12" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm" placeholder="## 신규 고객 첫 만남 전략&#10;&#10;### 핵심 원칙&#10;1. 첫 만남에서는 절대 보험 이야기를 하지 마세요&#10;2. 고객의 현재 고민을 경청하세요&#10;3. 3번째 만남 이후 자연스럽게 솔루션 제시&#10;&#10;### 30년 노하우&#10;- 급하게 계약하려는 마음이 고객에게 전달되면 신뢰가 무너집니다.&#10;- 진정한 관심을 보이고 천천히 접근하세요."></textarea>
                </div>
                
                <!-- 파일 업로드 모드 -->
                <div id="input-file-mode" class="mb-6 hidden">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">텍스트 파일 선택 (.txt)</label>
                    <div class="flex items-center gap-4">
                        <label class="flex-1 cursor-pointer">
                            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition">
                                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                                <p class="text-gray-600">클릭하여 파일을 선택하세요</p>
                                <p class="text-sm text-gray-400 mt-1">지원 형식: .txt (UTF-8), .pdf (최대 20MB)</p>
                            </div>
                            <input type="file" id="file-input" accept=".txt,.pdf" class="hidden" onchange="handleFileUpload(event)">
                        </label>
                    </div>
                    <div id="file-preview" class="hidden mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                            <div>
                                <i class="fas fa-file-alt text-blue-600 mr-2"></i>
                                <span id="file-name" class="font-semibold text-gray-800"></span>
                            </div>
                            <span id="file-size" class="text-sm text-gray-600"></span>
                        </div>
                        <div class="mt-2 p-3 bg-white rounded border border-gray-200 max-h-48 overflow-y-auto">
                            <pre id="file-content-preview" class="text-sm text-gray-700 whitespace-pre-wrap"></pre>
                        </div>
                    </div>
                </div>
                
                <div class="mb-6">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" id="upload-priority" class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500">
                        <span class="text-sm font-semibold text-gray-700">고우선순위 자료 (AI가 우선 참조)</span>
                    </label>
                </div>
                
                <div class="flex gap-4">
                    <button onclick="uploadKnowledge()" class="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-semibold text-lg shadow-lg">
                        <i class="fas fa-cloud-upload-alt mr-2"></i>업로드
                    </button>
                    <button onclick="clearUploadForm()" class="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                        <i class="fas fa-times mr-2"></i>초기화
                    </button>
                </div>
                
                <div class="mt-8 pt-8 border-t">
                    <h4 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-database mr-2 text-blue-600"></i>업로드된 자료 목록
                    </h4>
                    <div id="uploadedKnowledge" class="space-y-3">
                        <p class="text-gray-500 text-center py-4">아직 업로드된 자료가 없습니다.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 외부 링크 관리 탭 -->
        <div id="content-links" class="tab-content hidden">
            <div class="bg-white rounded-xl shadow-lg p-8 mb-6">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">
                            <i class="fas fa-link mr-3 text-purple-600"></i>외부 링크 관리
                        </h3>
                        <p class="text-gray-600 mt-2">코칭 시 참고할 외부 웹사이트를 등록하고 관리합니다.</p>
                    </div>
                    <button onclick="openAddLinkModal()" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-lg">
                        <i class="fas fa-plus mr-2"></i>링크 추가
                    </button>
                </div>

                <!-- 링크 목록 -->
                <div id="linksList" class="space-y-4">
                    <p class="text-gray-500 text-center py-8">로딩 중...</p>
                </div>
            </div>
        </div>
    </div>

    <!-- 피드백 모달 -->
    <div id="feedbackModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style="display: none;">
        <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold">
                        <i class="fas fa-comment-dots mr-2"></i>Director 피드백 작성
                    </h3>
                    <button onclick="closeFeedbackModal()" class="text-white hover:text-gray-200 transition">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-6">
                <input type="hidden" id="modal-sessionId">
                
                <!-- 세션 정보 요약 -->
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
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">설계사 피드백</label>
                    <div id="modal-plannerFeedback" class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded text-gray-800"></div>
                </div>
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-star text-yellow-500 mr-2"></i>Director 평가 (1-5점)
                    </label>
                    <div class="flex gap-2">
                        <button onclick="setRating(1)" data-rating="1" class="rating-btn flex-1 py-3 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">⭐</button>
                        <button onclick="setRating(2)" data-rating="2" class="rating-btn flex-1 py-3 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">⭐⭐</button>
                        <button onclick="setRating(3)" data-rating="3" class="rating-btn flex-1 py-3 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">⭐⭐⭐</button>
                        <button onclick="setRating(4)" data-rating="4" class="rating-btn flex-1 py-3 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">⭐⭐⭐⭐</button>
                        <button onclick="setRating(5)" data-rating="5" class="rating-btn flex-1 py-3 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">⭐⭐⭐⭐⭐</button>
                    </div>
                    <input type="hidden" id="modal-rating" value="5">
                </div>
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-pen-fancy text-purple-600 mr-2"></i>Director 피드백 (일반 의견)
                    </label>
                    <textarea id="modal-directorFeedback" rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="이 코칭 세션에 대한 센터장님의 의견을 작성해주세요.&#10;&#10;예시:&#10;- 우수 사례. ESTJ 성향에게는 '체계적으로 천천히'가 핵심입니다.&#10;- 이 케이스를 신규 설계사 교육에 활용 가능합니다.&#10;- 다만, 클로징 단계에서 추가 교육이 필요해 보입니다."></textarea>
                </div>
                
                <div class="mb-6 bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                    <label class="block text-sm font-semibold text-amber-900 mb-2">
                        <i class="fas fa-medal text-amber-600 mr-2"></i>30년 노하우 추가 (Relearning용)
                    </label>
                    <p class="text-xs text-amber-700 mb-3">
                        <i class="fas fa-info-circle mr-1"></i>
                        이 내용은 AI 코칭 재학습에 사용되어, 향후 유사한 상황에서 더욱 정확한 코칭을 제공합니다.
                    </p>
                    <textarea id="modal-director30YearsKnowledge" rows="5" class="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white" placeholder="30년 경험을 바탕으로 한 추가 노하우를 작성해주세요.&#10;&#10;예시:&#10;- 이런 유형의 고객은 '○○ 접근법'이 효과적입니다.&#10;- △△ 상황에서는 반드시 '◇◇ 화법'을 사용하세요.&#10;- 실제 성공 사례: [구체적 케이스 설명]&#10;- 주의사항: [피해야 할 접근법]"></textarea>
                </div>
                
                <div class="mb-6">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" id="modal-useForLearning" class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" checked>
                        <span class="text-sm font-semibold text-gray-700">
                            <i class="fas fa-brain text-orange-600 mr-2"></i>재학습 데이터로 사용 (AI 학습에 반영)
                        </span>
                    </label>
                    <p class="text-xs text-gray-500 mt-2 ml-7">체크 시 이 세션은 향후 AI 코칭 품질 향상에 활용됩니다.</p>
                </div>
                
                <div class="flex gap-4">
                    <button onclick="submitFeedback()" class="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-semibold shadow-lg">
                        <i class="fas fa-check mr-2"></i>피드백 제출
                    </button>
                    <button onclick="closeFeedbackModal()" class="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                        <i class="fas fa-times mr-2"></i>취소
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 자료 보기 모달 -->
    <div id="viewKnowledgeModal" class="hidden fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold">
                        <i class="fas fa-file-alt mr-2"></i>자료 상세보기
                    </h3>
                    <button onclick="closeViewModal()" class="text-white hover:text-gray-200 transition">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-6">
                <div class="mb-6 pb-6 border-b">
                    <h4 id="view-title" class="text-2xl font-bold text-gray-800 mb-3"></h4>
                    <div class="flex gap-4 text-sm text-gray-600">
                        <span><i class="fas fa-tag mr-2"></i><span id="view-category"></span></span>
                        <span id="view-priority"></span>
                        <span><i class="fas fa-calendar mr-2"></i><span id="view-uploadedAt"></span></span>
                        <span><i class="fas fa-file mr-2"></i><span id="view-fileName"></span></span>
                    </div>
                </div>
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">내용</label>
                    <div id="view-content" class="bg-gray-50 p-4 rounded-lg text-gray-800 whitespace-pre-wrap" style="max-height: 400px; overflow-y: auto;"></div>
                </div>
                
                <div class="flex gap-4">
                    <button onclick="editKnowledge(parseInt(document.getElementById('view-title').dataset.id))" class="flex-1 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        <i class="fas fa-edit mr-2"></i>수정하기
                    </button>
                    <button onclick="closeViewModal()" class="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                        <i class="fas fa-times mr-2"></i>닫기
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 자료 수정 모달 -->
    <div id="editKnowledgeModal" class="hidden fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold">
                        <i class="fas fa-edit mr-2"></i>자료 수정
                    </h3>
                    <button onclick="closeEditModal()" class="text-white hover:text-gray-200 transition">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-6">
                <input type="hidden" id="edit-id">
                
                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">제목</label>
                    <input type="text" id="edit-title" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">카테고리</label>
                    <select id="edit-category" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        <option value="영업기법">영업기법</option>
                        <option value="상품지식">상품지식</option>
                        <option value="고객관리">고객관리</option>
                        <option value="클레임처리">클레임처리</option>
                        <option value="기타">기타</option>
                    </select>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">내용</label>
                    <textarea id="edit-content" rows="12" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="자료 내용을 입력하세요..."></textarea>
                </div>
                
                <div class="mb-6">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="edit-priority" class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500">
                        <span class="ml-3 text-sm font-semibold text-gray-700">
                            <i class="fas fa-star text-yellow-500 mr-2"></i>최우선 검토 (AI 코칭 시 우선 반영)
                        </span>
                    </label>
                </div>
                
                <div class="flex gap-4">
                    <button onclick="saveKnowledgeEdit()" class="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-lg">
                        <i class="fas fa-save mr-2"></i>저장
                    </button>
                    <button onclick="closeEditModal()" class="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                        <i class="fas fa-times mr-2"></i>취소
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 링크 추가/수정 모달 -->
    <div id="linkModal" class="hidden fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
                <div class="flex justify-between items-center">
                    <h3 id="linkModalTitle" class="text-2xl font-bold">
                        <i class="fas fa-link mr-2"></i>외부 링크 추가
                    </h3>
                    <button onclick="closeLinkModal()" class="text-white hover:text-gray-200 transition">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-6">
                <input type="hidden" id="link-id" value="">
                
                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-heading text-purple-600 mr-2"></i>링크 이름
                    </label>
                    <input type="text" id="link-name" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="예: 금융감독원 보험공시">
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-globe text-purple-600 mr-2"></i>URL
                    </label>
                    <input type="url" id="link-url" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="https://example.com">
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-align-left text-purple-600 mr-2"></i>설명
                    </label>
                    <textarea id="link-description" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="이 링크에 대한 간단한 설명을 입력하세요..."></textarea>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-tag text-purple-600 mr-2"></i>카테고리
                    </label>
                    <select id="link-category" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="규제">규제</option>
                        <option value="통계">통계</option>
                        <option value="상품정보">상품정보</option>
                        <option value="뉴스">뉴스</option>
                        <option value="업계동향">업계동향</option>
                        <option value="기타">기타</option>
                    </select>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-users text-purple-600 mr-2"></i>대상
                    </label>
                    <select id="link-target" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="both">👥 공용 (설계사 + 관리자 모두)</option>
                        <option value="planner">👤 설계사 전용</option>
                        <option value="manager">👔 관리자 전용</option>
                    </select>
                </div>
                
                <div class="mb-4">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="link-authRequired" class="w-5 h-5 text-orange-600 rounded focus:ring-orange-500" onchange="toggleAuthFields()">
                        <span class="ml-3 text-sm font-semibold text-gray-700">
                            <i class="fas fa-lock text-orange-500 mr-2"></i>로그인 필요 (아이디/비밀번호 필요한 사이트)
                        </span>
                    </label>
                </div>
                
                <!-- 인증 정보 입력 필드 (로그인 필요 시만 표시) -->
                <div id="authFieldsContainer" class="hidden mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p class="text-sm text-orange-700 mb-3">
                        <i class="fas fa-info-circle mr-1"></i>
                        로그인이 필요한 사이트의 인증 정보를 입력하세요. (예: 메가넷, 업계 전용 사이트)
                    </p>
                    
                    <div class="mb-3">
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            <i class="fas fa-user text-orange-600 mr-2"></i>아이디
                        </label>
                        <input type="text" id="link-username" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="로그인 아이디">
                    </div>
                    
                    <div class="mb-3">
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            <i class="fas fa-key text-orange-600 mr-2"></i>비밀번호
                        </label>
                        <input type="password" id="link-password" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="로그인 비밀번호">
                    </div>
                    
                    <div class="mb-3">
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            <i class="fas fa-sign-in-alt text-orange-600 mr-2"></i>로그인 페이지 URL (선택사항)
                        </label>
                        <input type="url" id="link-loginUrl" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="메인 URL과 다를 경우 입력">
                        <p class="text-xs text-gray-500 mt-1">입력하지 않으면 메인 URL을 로그인 페이지로 사용합니다.</p>
                    </div>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        <strong>보안 주의:</strong> 로그인 정보는 암호화되지 않은 상태로 저장됩니다. 
                        중요한 개인 계정보다는 업무용 공용 계정 사용을 권장합니다.
                    </div>
                </div>
                
                <div class="mb-6">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" id="link-isActive" class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500" checked>
                        <span class="ml-3 text-sm font-semibold text-gray-700">
                            <i class="fas fa-check-circle text-green-500 mr-2"></i>활성화 (코칭 시 참조)
                        </span>
                    </label>
                </div>
                
                <div class="flex gap-4">
                    <button onclick="saveLink()" class="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-semibold shadow-lg">
                        <i class="fas fa-save mr-2"></i>저장
                    </button>
                    <button onclick="closeLinkModal()" class="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                        <i class="fas fa-times mr-2"></i>취소
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script>
        // 전역 변수
        let currentUser = null
        let allSessions = []
        let allPlanners = []
        let knowledgeBase = []
        let externalLinks = []
        
        // 초기화
        async function init() {
            try {
                const userData = localStorage.getItem('user')
                if (!userData) {
                    window.location.href = '/'
                    return
                }
                
                currentUser = JSON.parse(userData)
                if (currentUser.role !== 'director') {
                    alert('Director 권한이 필요합니다.')
                    window.location.href = '/'
                    return
                }
                
                document.getElementById('directorName').textContent = currentUser.name
                
                await loadDashboard()
                await loadSessions()
                await loadKnowledge()
                await loadLinks()
            } catch (error) {
                console.error('초기화 오류:', error)
                alert('페이지 초기화 중 오류가 발생했습니다: ' + error.message)
            }
        }
        
        // 대시보드 데이터 로드
        async function loadDashboard() {
            try {
                const res = await axios.get('/api/director/dashboard')
                const stats = res.data
                
                document.getElementById('stat-totalPlanners').textContent = stats.totalPlanners
                document.getElementById('stat-totalSessions').textContent = stats.totalSessions
                document.getElementById('stat-validatedSessions').textContent = stats.validatedSessions
                document.getElementById('stat-learningData').textContent = stats.learningData
                
                // 차트 그리기
                drawCharts(stats)
                
                // 우수 사례 표시
                displayExcellentCases(stats.excellentCases || [])
            } catch (error) {
                console.error('대시보드 로드 실패:', error)
                alert('대시보드 데이터를 불러오는데 실패했습니다: ' + error.message)
            }
        }
        
        // 차트 인스턴스 저장용 전역 변수
        let chartInstances = { sessions: null, effectiveness: null }
        
        // 차트 그리기
        function drawCharts(stats) {
            // 기존 차트 인스턴스 파괴
            if (chartInstances.sessions) {
                chartInstances.sessions.destroy()
            }
            if (chartInstances.effectiveness) {
                chartInstances.effectiveness.destroy()
            }
            // 설계사별 세션 수 차트
            if (stats.sessionsByPlanner && stats.sessionsByPlanner.length > 0) {
                const ctx1 = document.getElementById('chartSessions').getContext('2d')
                chartInstances.sessions = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: stats.sessionsByPlanner.map(s => s.name),
                        datasets: [{
                            label: '코칭 세션 수',
                            data: stats.sessionsByPlanner.map(s => s.count),
                            backgroundColor: 'rgba(147, 51, 234, 0.7)',
                            borderColor: 'rgba(147, 51, 234, 1)',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                })
            }
            
            // 효과성 분포 차트
            const ctx2 = document.getElementById('chartEffectiveness').getContext('2d')
            chartInstances.effectiveness = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: ['5점 (우수)', '4점 (좋음)', '3점 이하'],
                    datasets: [{
                        data: [
                            stats.effectiveness5 || 0,
                            stats.effectiveness4 || 0,
                            stats.effectiveness3 || 0
                        ],
                        backgroundColor: [
                            'rgba(34, 197, 94, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(249, 115, 22, 0.8)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            })
        }
        
        // 우수 사례 표시
        function displayExcellentCases(cases) {
            const container = document.getElementById('excellentCases')
            
            if (cases.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center py-8">재학습 데이터로 지정된 우수 사례가 없습니다.</p>'
                return
            }
            
            container.innerHTML = cases.map(c => \`
                <div class="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
                    <div class="flex justify-between items-start mb-2">
                        <p class="font-bold text-gray-800">\${c.plannerName} 설계사</p>
                        <span class="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">\${c.situationType}</span>
                    </div>
                    <p class="text-sm text-gray-700 mb-2">\${c.context.substring(0, 100)}...</p>
                    <p class="text-xs text-gray-600">Director 평가: ${'⭐'.repeat(c.directorRating || 5)}</p>
                </div>
            \`).join('')
        }
        
        // 세션 목록 로드
        async function loadSessions() {
            try {
                const res = await axios.get('/api/director/sessions')
                allSessions = res.data.sessions
                allPlanners = res.data.planners
                
                // 필터 옵션 설정
                const plannerSelect = document.getElementById('filter-planner')
                plannerSelect.innerHTML = '<option value="all">전체</option>' + 
                    allPlanners.map(p => \`<option value="\${p.id}">\${p.name}</option>\`).join('')
                
                displaySessions(allSessions)
            } catch (error) {
                console.error('세션 로드 실패:', error)
            }
        }
        
        // 세션 표시
        function displaySessions(sessions) {
            const container = document.getElementById('sessionsList')
            
            if (sessions.length === 0) {
                container.innerHTML = '<div class="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">조건에 맞는 세션이 없습니다.</div>'
                return
            }
            
            container.innerHTML = sessions.map(session => {
                const planner = allPlanners.find(p => p.id === session.plannerId)
                const plannerName = planner ? planner.name : '알 수 없음'
                const statusBadge = session.isValidated 
                    ? '<span class="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full"><i class="fas fa-check-circle mr-1"></i>검증완료</span>'
                    : '<span class="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full"><i class="fas fa-clock mr-1"></i>미검증</span>'
                const learningBadge = session.useForLearning
                    ? '<span class="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full"><i class="fas fa-brain mr-1"></i>재학습 데이터</span>'
                    : ''
                    
                return \`
                    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <p class="text-sm text-gray-500 mb-1">\${new Date(session.sessionDate).toLocaleDateString('ko-KR')} \${new Date(session.sessionDate).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</p>
                                <h4 class="text-lg font-bold text-gray-800 mb-2">
                                    <i class="fas fa-user-circle mr-2 text-purple-600"></i>\${plannerName} 설계사
                                </h4>
                                <div class="flex gap-2">
                                    \${statusBadge}
                                    \${learningBadge}
                                    <span class="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">\${session.situationType}</span>
                                </div>
                            </div>
                            <div class="text-right">
                                \${session.effectivenessRating ? \`<p class="text-sm text-gray-600">설계사 평가: <span class="font-bold text-yellow-600">${'⭐'.repeat(1)}\${session.effectivenessRating}</span></p>\` : ''}
                                \${session.directorRating ? \`<p class="text-sm text-gray-600 mt-1">Director 평가: <span class="font-bold text-purple-600">${'⭐'.repeat(1)}\${session.directorRating}</span></p>\` : ''}
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <p class="text-sm font-semibold text-gray-700 mb-2"><i class="fas fa-question-circle mr-2 text-blue-600"></i>설계사의 질문</p>
                            <p class="text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-500">\${session.context}</p>
                        </div>
                        
                        <div class="mb-4">
                            <p class="text-sm font-semibold text-gray-700 mb-2"><i class="fas fa-comments mr-2 text-green-600"></i>AI 코칭 내용</p>
                            <p class="text-gray-700 bg-green-50 p-3 rounded border-l-4 border-green-500 whitespace-pre-wrap">\${session.coachingAdvice}</p>
                        </div>
                        
                        \${session.plannerFeedback ? \`
                        <div class="mb-4">
                            <p class="text-sm font-semibold text-gray-700 mb-2"><i class="fas fa-comment-dots mr-2 text-yellow-600"></i>설계사 피드백</p>
                            <p class="text-gray-700 bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">\${session.plannerFeedback}</p>
                        </div>
                        \` : ''}
                        
                        \${session.directorFeedback ? \`
                        <div class="mb-4">
                            <p class="text-sm font-semibold text-gray-700 mb-2"><i class="fas fa-pen-fancy mr-2 text-purple-600"></i>Director 피드백</p>
                            <p class="text-gray-700 bg-purple-50 p-3 rounded border-l-4 border-purple-500">\${session.directorFeedback}</p>
                        </div>
                        \` : ''}
                        
                        <div class="flex gap-3 mt-4">
                            <button onclick="openFeedbackModal(\${session.id})" class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-semibold shadow-lg">
                                <i class="fas fa-\${session.isValidated ? 'edit' : 'plus-circle'} mr-2"></i>\${session.isValidated ? '피드백 수정' : '피드백 작성'}
                            </button>
                        </div>
                    </div>
                \`
            }).join('')
        }
        
        // 필터 적용
        function applyFilters() {
            const validated = document.getElementById('filter-validated').value
            const plannerId = document.getElementById('filter-planner').value
            const effectiveness = document.getElementById('filter-effectiveness').value
            
            let filtered = [...allSessions]
            
            if (validated !== 'all') {
                filtered = filtered.filter(s => {
                    if (validated === 'validated') return s.isValidated
                    if (validated === 'pending') return !s.isValidated
                })
            }
            
            if (plannerId !== 'all') {
                filtered = filtered.filter(s => s.plannerId === parseInt(plannerId))
            }
            
            if (effectiveness !== 'all') {
                const rating = parseInt(effectiveness)
                filtered = filtered.filter(s => {
                    if (!s.effectivenessRating) return false
                    if (rating === 5) return s.effectivenessRating === 5
                    if (rating === 4) return s.effectivenessRating === 4
                    if (rating === 3) return s.effectivenessRating <= 3
                })
            }
            
            displaySessions(filtered)
        }
        
        // 피드백 모달 열기
        function openFeedbackModal(sessionId) {
            const session = allSessions.find(s => s.id === sessionId)
            if (!session) return
            
            const planner = allPlanners.find(p => p.id === session.plannerId)
            
            document.getElementById('modal-sessionId').value = sessionId
            document.getElementById('modal-plannerName').textContent = planner ? planner.name : '알 수 없음'
            document.getElementById('modal-sessionDate').textContent = new Date(session.sessionDate).toLocaleString('ko-KR')
            document.getElementById('modal-situationType').textContent = session.situationType
            document.getElementById('modal-context').textContent = session.context
            document.getElementById('modal-coachingAdvice').textContent = session.coachingAdvice
            document.getElementById('modal-plannerFeedback').textContent = session.plannerFeedback || '아직 피드백이 없습니다.'
            document.getElementById('modal-rating').value = session.directorRating || 5
            document.getElementById('modal-directorFeedback').value = session.directorFeedback || ''
            document.getElementById('modal-useForLearning').checked = session.useForLearning || false
            
            // 평가 버튼 하이라이트
            setRating(session.directorRating || 5)
            
            document.getElementById('feedbackModal').style.display = 'flex'
        }
        
        // 피드백 모달 닫기
        function closeFeedbackModal() {
            document.getElementById('feedbackModal').style.display = 'none'
        }
        
        // 평가 점수 설정
        function setRating(rating) {
            document.getElementById('modal-rating').value = rating
            document.querySelectorAll('.rating-btn').forEach(btn => {
                const btnRating = parseInt(btn.dataset.rating)
                if (btnRating <= rating) {
                    btn.classList.add('border-purple-600', 'bg-purple-100')
                    btn.classList.remove('border-gray-300')
                } else {
                    btn.classList.remove('border-purple-600', 'bg-purple-100')
                    btn.classList.add('border-gray-300')
                }
            })
        }
        
        // 피드백 제출
        async function submitFeedback() {
            const sessionId = parseInt(document.getElementById('modal-sessionId').value)
            const rating = parseInt(document.getElementById('modal-rating').value)
            const feedback = document.getElementById('modal-directorFeedback').value.trim()
            const director30YearsKnowledge = document.getElementById('modal-director30YearsKnowledge').value.trim()
            const useForLearning = document.getElementById('modal-useForLearning').checked
            
            if (!feedback) {
                alert('피드백 내용을 입력해주세요.')
                return
            }
            
            try {
                await axios.post('/api/director/feedback', {
                    sessionId,
                    directorFeedback: feedback,
                    director30YearsKnowledge, // 30년 노하우 추가
                    directorRating: rating,
                    useForLearning
                })
                
                alert('피드백이 성공적으로 저장되었습니다!')
                closeFeedbackModal()
                await loadSessions()
                await loadDashboard()
            } catch (error) {
                console.error('피드백 저장 실패:', error)
                alert('피드백 저장에 실패했습니다.')
            }
        }
        
        // 입력 모드 전환
        let currentInputMode = 'text' // 'text' 또는 'file'
        let uploadedFileContent = ''
        let uploadedFileName = ''
        let uploadedFileSize = 0
        
        function switchInputMode(mode) {
            currentInputMode = mode
            
            const textBtn = document.getElementById('input-mode-text')
            const fileBtn = document.getElementById('input-mode-file')
            const textMode = document.getElementById('input-text-mode')
            const fileMode = document.getElementById('input-file-mode')
            
            if (mode === 'text') {
                textBtn.classList.add('bg-purple-600', 'text-white')
                textBtn.classList.remove('bg-gray-200', 'text-gray-700')
                fileBtn.classList.remove('bg-purple-600', 'text-white')
                fileBtn.classList.add('bg-gray-200', 'text-gray-700')
                textMode.classList.remove('hidden')
                fileMode.classList.add('hidden')
            } else {
                fileBtn.classList.add('bg-purple-600', 'text-white')
                fileBtn.classList.remove('bg-gray-200', 'text-gray-700')
                textBtn.classList.remove('bg-purple-600', 'text-white')
                textBtn.classList.add('bg-gray-200', 'text-gray-700')
                fileMode.classList.remove('hidden')
                textMode.classList.add('hidden')
            }
        }
        
        // 파일 업로드 처리
        function handleFileUpload(event) {
            const file = event.target.files[0]
            if (!file) return
            
            // 파일 타입 확인 (.txt, .pdf 허용)
            const allowedExtensions = ['.txt', '.pdf']
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
            
            if (!allowedExtensions.includes(fileExtension)) {
                alert('텍스트 파일(.txt) 또는 PDF 파일(.pdf)만 업로드 가능합니다.')
                event.target.value = ''
                return
            }
            
            // 파일 크기 확인 (20MB 제한 - PDF용)
            if (file.size > 20 * 1024 * 1024) {
                alert('파일 크기는 20MB를 초과할 수 없습니다.')
                event.target.value = ''
                return
            }
            
            uploadedFileName = file.name
            uploadedFileSize = file.size
            
            // PDF 파일인 경우 텍스트 추출
            if (fileExtension === '.pdf') {
                extractTextFromPDF(file)
            } else {
                // 텍스트 파일인 경우 기존 방식
                readTextFile(file)
            }
        }
        
        // 텍스트 파일 읽기
        function readTextFile(file) {
            // 파일 읽기 - 단순 UTF-8 방식
            const reader = new FileReader()
            reader.onload = function(e) {
                uploadedFileContent = e.target.result
                
                // 미리보기 표시
                document.getElementById('file-name').textContent = file.name + ' (텍스트)'
                document.getElementById('file-size').textContent = formatFileSize(file.size)
                document.getElementById('file-content-preview').textContent = uploadedFileContent.substring(0, 500) + (uploadedFileContent.length > 500 ? '...' : '')
                document.getElementById('file-preview').classList.remove('hidden')
            }
            reader.readAsText(file, 'UTF-8')
        }
        
        // PDF 파일에서 텍스트 추출
        async function extractTextFromPDF(file) {
            try {
                // PDF.js 라이브러리 확인
                if (typeof pdfjsLib === 'undefined') {
                    alert('PDF 처리 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
                    return
                }
                
                // 파일을 ArrayBuffer로 읽기
                const arrayBuffer = await file.arrayBuffer()
                
                // PDF 문서 로드
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
                const pdf = await loadingTask.promise
                
                console.log('PDF 로드 성공. 총 페이지 수:', pdf.numPages)
                
                let fullText = ''
                
                // 모든 페이지에서 텍스트 추출
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum)
                    const textContent = await page.getTextContent()
                    
                    // 텍스트 아이템들을 문자열로 변환
                    const pageText = textContent.items
                        .map(item => item.str)
                        .join(' ')
                    
                    fullText += pageText + '\\n\\n'
                }
                
                uploadedFileContent = fullText.trim()
                
                // 미리보기 표시
                document.getElementById('file-name').textContent = file.name + ' (PDF, ' + pdf.numPages + '페이지)'
                document.getElementById('file-size').textContent = formatFileSize(file.size)
                document.getElementById('file-content-preview').textContent = uploadedFileContent.substring(0, 500) + (uploadedFileContent.length > 500 ? '...' : '')
                document.getElementById('file-preview').classList.remove('hidden')
                
                console.log('PDF 텍스트 추출 완료. 총 문자 수:', uploadedFileContent.length)
            } catch (error) {
                console.error('PDF 텍스트 추출 실패:', error)
                alert('PDF 파일 처리 중 오류가 발생했습니다: ' + error.message)
            }
        }
        
        // 파일 크기 포맷팅
        function formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' B'
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
        }
        
        // 자료 업로드
        async function uploadKnowledge() {
            const title = document.getElementById('upload-title').value.trim()
            const category = document.getElementById('upload-category').value
            const targetAudience = document.getElementById('upload-target').value
            const priority = document.getElementById('upload-priority').checked
            
            let content = ''
            let fileType = currentInputMode
            let fileName = null
            let fileSize = null
            
            if (currentInputMode === 'text') {
                content = document.getElementById('upload-content').value.trim()
            } else {
                content = uploadedFileContent
                fileName = uploadedFileName
                fileSize = uploadedFileSize
            }
            
            if (!title || !content) {
                alert('제목과 내용을 입력해주세요.')
                return
            }
            
            try {
                await axios.post('/api/director/knowledge', {
                    title,
                    category,
                    content,
                    priority,
                    targetAudience,
                    fileType,
                    fileName,
                    fileSize
                })
                
                alert('자료가 성공적으로 업로드되었습니다!')
                clearUploadForm()
                await loadKnowledge()
            } catch (error) {
                console.error('자료 업로드 실패:', error)
                alert('자료 업로드에 실패했습니다.')
            }
        }
        
        // 업로드 폼 초기화
        function clearUploadForm() {
            document.getElementById('upload-title').value = ''
            document.getElementById('upload-category').value = '영업기법'
            document.getElementById('upload-content').value = ''
            document.getElementById('upload-priority').checked = false
            
            // 파일 업로드 초기화
            document.getElementById('file-input').value = ''
            document.getElementById('file-preview').classList.add('hidden')
            uploadedFileContent = ''
            uploadedFileName = ''
            uploadedFileSize = 0
            
            // 직접 입력 모드로 전환
            switchInputMode('text')
        }
        
        // 업로드된 자료 로드
        async function loadKnowledge() {
            try {
                const res = await axios.get('/api/director/knowledge')
                knowledgeBase = res.data.knowledge || []
                displayKnowledge()
            } catch (error) {
                console.error('자료 로드 실패:', error)
                alert('자료 목록을 불러오는데 실패했습니다: ' + error.message)
            }
        }
        
        // 자료 목록 표시
        function displayKnowledge() {
            const container = document.getElementById('uploadedKnowledge')
            
            if (knowledgeBase.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center py-4">아직 업로드된 자료가 없습니다.</p>'
                return
            }
            
            // 우선순위별로 정렬 (최우선 검토 먼저)
            const sortedKnowledge = [...knowledgeBase].sort((a, b) => {
                if (a.priority && !b.priority) return -1
                if (!a.priority && b.priority) return 1
                return new Date(b.uploadedAt) - new Date(a.uploadedAt)
            })
            
            container.innerHTML = sortedKnowledge.map(k => \`
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" onclick="viewKnowledge(\${k.id})">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h5 class="font-bold text-gray-800 mb-1">
                                \${k.priority ? '<i class="fas fa-star text-yellow-500 mr-2" title="최우선 검토"></i>' : ''}
                                \${k.title}
                                \${k.fileType === 'file' ? '<i class="fas fa-file-alt text-blue-500 ml-2" title="파일 업로드"></i>' : ''}
                            </h5>
                            <p class="text-xs text-gray-500 mb-2">
                                <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded">\${k.category}</span>
                                <span class="ml-2">\${new Date(k.uploadedAt).toLocaleDateString('ko-KR')}</span>
                                \${k.fileName ? \`<span class="ml-2 text-gray-400">📄 \${k.fileName} (\${formatFileSize(k.fileSize || 0)})</span>\` : ''}
                            </p>
                            <p class="text-sm text-gray-700 line-clamp-2">\${k.content.substring(0, 150)}...</p>
                        </div>
                        <div class="flex gap-2 ml-4">
                            <button onclick="event.stopPropagation(); editKnowledge(\${k.id})" class="text-blue-600 hover:text-blue-800 transition" title="수정">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="event.stopPropagation(); deleteKnowledge(\${k.id})" class="text-red-600 hover:text-red-800 transition" title="삭제">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            \`).join('')
        }
        
        // 자료 삭제
        async function deleteKnowledge(id) {
            if (!confirm('이 자료를 삭제하시겠습니까?')) return
            
            try {
                await axios.delete(\`/api/director/knowledge/\${id}\`)
                alert('자료가 삭제되었습니다.')
                await loadKnowledge()
            } catch (error) {
                console.error('자료 삭제 실패:', error)
                alert('자료 삭제에 실패했습니다.')
            }
        }
        
        // 자료 보기
        function viewKnowledge(id) {
            const knowledge = knowledgeBase.find(k => k.id === id)
            if (!knowledge) return
            
            const modal = document.getElementById('viewKnowledgeModal')
            const titleElement = document.getElementById('view-title')
            titleElement.textContent = knowledge.title
            titleElement.dataset.id = knowledge.id
            
            document.getElementById('view-category').textContent = knowledge.category
            document.getElementById('view-priority').innerHTML = knowledge.priority 
                ? '<i class="fas fa-star text-yellow-500"></i> 최우선 검토' 
                : '<i class="fas fa-star-o text-gray-400"></i> 일반'
            document.getElementById('view-uploadedAt').textContent = new Date(knowledge.uploadedAt).toLocaleString('ko-KR')
            document.getElementById('view-fileName').textContent = knowledge.fileName || '직접 작성'
            document.getElementById('view-content').textContent = knowledge.content
            
            modal.classList.remove('hidden')
            modal.classList.add('flex')
        }
        
        // 자료 수정 모달 열기
        function editKnowledge(id) {
            const knowledge = knowledgeBase.find(k => k.id === id)
            if (!knowledge) return
            
            const modal = document.getElementById('editKnowledgeModal')
            document.getElementById('edit-id').value = knowledge.id
            document.getElementById('edit-title').value = knowledge.title
            document.getElementById('edit-category').value = knowledge.category
            document.getElementById('edit-content').value = knowledge.content
            document.getElementById('edit-priority').checked = knowledge.priority
            
            // 먼저 상세보기 모달 닫기
            closeViewModal()
            
            modal.classList.remove('hidden')
            modal.classList.add('flex')
        }
        
        // 자료 수정 저장
        async function saveKnowledgeEdit() {
            const id = document.getElementById('edit-id').value
            const title = document.getElementById('edit-title').value.trim()
            const category = document.getElementById('edit-category').value
            const content = document.getElementById('edit-content').value.trim()
            const priority = document.getElementById('edit-priority').checked
            
            if (!title || !content) {
                alert('제목과 내용을 입력해주세요.')
                return
            }
            
            try {
                await axios.put(\`/api/director/knowledge/\${id}\`, {
                    title,
                    category,
                    content,
                    priority
                })
                
                alert('자료가 수정되었습니다!')
                closeEditModal()
                await loadKnowledge()
            } catch (error) {
                console.error('자료 수정 실패:', error)
                alert('자료 수정에 실패했습니다.')
            }
        }
        
        // 모달 닫기
        function closeViewModal() {
            const modal = document.getElementById('viewKnowledgeModal')
            modal.classList.remove('flex')
            modal.classList.add('hidden')
        }
        
        function closeEditModal() {
            const modal = document.getElementById('editKnowledgeModal')
            modal.classList.remove('flex')
            modal.classList.add('hidden')
        }
        
        // 자료 삭제
        async function deleteKnowledge(index) {
            if (!confirm('정말로 이 자료를 삭제하시겠습니까?')) {
                return
            }
            
            try {
                await axios.delete(\`/api/director/knowledge/\${index}\`)
                alert('자료가 삭제되었습니다.')
                await loadKnowledge()
            } catch (error) {
                console.error('자료 삭제 실패:', error)
                alert('자료 삭제에 실패했습니다.')
            }
        }
        
        // 탭 전환
        // ============== 외부 링크 관리 ==============
        
        // 링크 목록 로드
        async function loadLinks() {
            try {
                const res = await axios.get('/api/director/links')
                externalLinks = res.data.links || []
                
                const linksList = document.getElementById('linksList')
                if (externalLinks.length === 0) {
                    linksList.innerHTML = '<p class="text-gray-500 text-center py-8">등록된 링크가 없습니다.</p>'
                    return
                }
                
                linksList.innerHTML = externalLinks.map(link => \`
                    <div class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <h4 class="text-xl font-bold text-gray-800">\${link.name}</h4>
                                    \${link.isActive 
                                        ? '<span class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">활성</span>' 
                                        : '<span class="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">비활성</span>'
                                    }
                                    \${link.category ? \`<span class="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">\${link.category}</span>\` : ''}
                                    \${link.authRequired ? '<span class="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"><i class="fas fa-lock mr-1"></i>로그인 필요</span>' : ''}
                                </div>
                                <a href="\${link.url}" target="_blank" class="text-sm text-blue-600 hover:underline mb-2 block">
                                    <i class="fas fa-external-link-alt mr-1"></i>\${link.url}
                                </a>
                                \${link.description ? \`<p class="text-sm text-gray-600">\${link.description}</p>\` : ''}
                            </div>
                            <div class="flex gap-2 ml-4">
                                <button onclick="toggleLinkStatus(\${link.id})" class="px-4 py-2 \${link.isActive ? 'bg-gray-200 hover:bg-gray-300' : 'bg-green-100 hover:bg-green-200'} rounded-lg transition text-sm">
                                    <i class="fas fa-\${link.isActive ? 'pause' : 'play'} mr-1"></i>\${link.isActive ? '비활성화' : '활성화'}
                                </button>
                                <button onclick="editLink(\${link.id})" class="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition text-sm">
                                    <i class="fas fa-edit mr-1"></i>수정
                                </button>
                                <button onclick="deleteLink(\${link.id})" class="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg transition text-sm">
                                    <i class="fas fa-trash mr-1"></i>삭제
                                </button>
                            </div>
                        </div>
                        \${link.lastCrawledAt ? \`<p class="text-xs text-gray-500"><i class="fas fa-clock mr-1"></i>마지막 수집: \${new Date(link.lastCrawledAt).toLocaleString('ko-KR')}</p>\` : ''}
                    </div>
                \`).join('')
            } catch (error) {
                console.error('링크 로드 실패:', error)
                document.getElementById('linksList').innerHTML = '<p class="text-red-500 text-center py-8">링크를 불러오는데 실패했습니다.</p>'
            }
        }
        
        // 링크 추가 모달 열기
        // 인증 필드 표시/숨김 토글
        function toggleAuthFields() {
            const authRequired = document.getElementById('link-authRequired').checked
            const container = document.getElementById('authFieldsContainer')
            
            if (authRequired) {
                container.classList.remove('hidden')
            } else {
                container.classList.add('hidden')
                // 체크 해제 시 인증 정보 초기화
                document.getElementById('link-username').value = ''
                document.getElementById('link-password').value = ''
                document.getElementById('link-loginUrl').value = ''
            }
        }
        
        function openAddLinkModal() {
            document.getElementById('linkModalTitle').innerHTML = '<i class="fas fa-link mr-2"></i>외부 링크 추가'
            document.getElementById('link-id').value = ''
            document.getElementById('link-name').value = ''
            document.getElementById('link-url').value = ''
            document.getElementById('link-description').value = ''
            document.getElementById('link-category').value = '규제'
            document.getElementById('link-isActive').checked = true
            document.getElementById('link-authRequired').checked = false
            document.getElementById('link-username').value = ''
            document.getElementById('link-password').value = ''
            document.getElementById('link-loginUrl').value = ''
            document.getElementById('authFieldsContainer').classList.add('hidden')
            document.getElementById('linkModal').classList.remove('hidden')
            document.getElementById('linkModal').classList.add('flex')
        }
        
        // 링크 수정 모달 열기
        function editLink(id) {
            const link = externalLinks.find(l => l.id === id)
            if (!link) return
            
            document.getElementById('linkModalTitle').innerHTML = '<i class="fas fa-edit mr-2"></i>외부 링크 수정'
            document.getElementById('link-id').value = link.id
            document.getElementById('link-name').value = link.name
            document.getElementById('link-url').value = link.url
            document.getElementById('link-description').value = link.description || ''
            document.getElementById('link-category').value = link.category || '규제'
            document.getElementById('link-isActive').checked = link.isActive
            
            // 인증 정보 처리
            const authRequired = link.authRequired || false
            document.getElementById('link-authRequired').checked = authRequired
            document.getElementById('link-username').value = link.username || ''
            document.getElementById('link-password').value = link.password || ''
            document.getElementById('link-loginUrl').value = link.loginUrl || ''
            
            if (authRequired) {
                document.getElementById('authFieldsContainer').classList.remove('hidden')
            } else {
                document.getElementById('authFieldsContainer').classList.add('hidden')
            }
            
            document.getElementById('linkModal').classList.remove('hidden')
            document.getElementById('linkModal').classList.add('flex')
        }
        
        // 링크 모달 닫기
        function closeLinkModal() {
            document.getElementById('linkModal').classList.add('hidden')
            document.getElementById('linkModal').classList.remove('flex')
        }
        
        // 링크 저장
        async function saveLink() {
            const id = document.getElementById('link-id').value
            const name = document.getElementById('link-name').value.trim()
            const url = document.getElementById('link-url').value.trim()
            const description = document.getElementById('link-description').value.trim()
            const category = document.getElementById('link-category').value
            const targetAudience = document.getElementById('link-target').value
            const isActive = document.getElementById('link-isActive').checked
            
            // 인증 정보
            const authRequired = document.getElementById('link-authRequired').checked
            const username = document.getElementById('link-username').value.trim()
            const password = document.getElementById('link-password').value.trim()
            const loginUrl = document.getElementById('link-loginUrl').value.trim()
            
            if (!name || !url) {
                alert('링크 이름과 URL은 필수입니다.')
                return
            }
            
            if (authRequired && (!username || !password)) {
                alert('로그인 필요 시 아이디와 비밀번호는 필수입니다.')
                return
            }
            
            try {
                const payload = {
                    name, url, description, category, targetAudience, isActive,
                    authRequired, username, password, loginUrl
                }
                
                if (id) {
                    // 수정
                    await axios.put(\`/api/director/links/\${id}\`, payload)
                    alert('링크가 수정되었습니다.')
                } else {
                    // 추가
                    await axios.post('/api/director/links', payload)
                    alert('링크가 추가되었습니다.')
                }
                
                closeLinkModal()
                await loadLinks()
            } catch (error) {
                console.error('링크 저장 실패:', error)
                alert('링크 저장에 실패했습니다.')
            }
        }
        
        // 링크 활성화/비활성화 토글
        async function toggleLinkStatus(id) {
            try {
                const res = await axios.patch(\`/api/director/links/\${id}/toggle\`)
                const newStatus = res.data.isActive ? '활성화' : '비활성화'
                alert(\`링크가 \${newStatus}되었습니다.\`)
                await loadLinks()
            } catch (error) {
                console.error('링크 상태 변경 실패:', error)
                alert('링크 상태 변경에 실패했습니다.')
            }
        }
        
        // 링크 삭제
        async function deleteLink(id) {
            if (!confirm('정말로 이 링크를 삭제하시겠습니까?')) return
            
            try {
                await axios.delete(\`/api/director/links/\${id}\`)
                alert('링크가 삭제되었습니다.')
                await loadLinks()
            } catch (error) {
                console.error('링크 삭제 실패:', error)
                alert('링크 삭제에 실패했습니다.')
            }
        }
        
        function switchTab(tab) {
            // 모든 탭 버튼 초기화
            document.querySelectorAll('[id^="tab-"]').forEach(btn => {
                btn.classList.remove('text-purple-600', 'border-b-2', 'border-purple-600')
                btn.classList.add('text-gray-500')
            })
            
            // 모든 탭 콘텐츠 숨김
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden')
            })
            
            // 선택된 탭 활성화
            document.getElementById(\`tab-\${tab}\`).classList.remove('text-gray-500')
            document.getElementById(\`tab-\${tab}\`).classList.add('text-purple-600', 'border-b-2', 'border-purple-600')
            document.getElementById(\`content-\${tab}\`).classList.remove('hidden')
        }
        
        // 로그아웃
        function logout() {
            localStorage.removeItem('user')
            window.location.href = '/'
        }
        
        // 세션 목록 자동 갱신 (30초마다)
        let autoRefreshInterval = null
        
        function startAutoRefresh() {
            // 기존 인터벌 제거
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval)
            }
            
            // 30초마다 세션 목록 갱신
            autoRefreshInterval = setInterval(async () => {
                console.log('[Auto Refresh] 세션 목록 갱신 중...')
                await loadSessions()
                console.log('[Auto Refresh] 세션 목록 갱신 완료')
            }, 30000) // 30초
        }
        
        function stopAutoRefresh() {
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval)
                autoRefreshInterval = null
            }
        }
        
        // 페이지 로드 시 초기화
        window.onload = () => {
            init()
            startAutoRefresh()
        }
        
        // 페이지 언로드 시 자동 갱신 중지
        window.onbeforeunload = () => {
            stopAutoRefresh()
        }
    </script>
</body>
</html>
  `)
}
