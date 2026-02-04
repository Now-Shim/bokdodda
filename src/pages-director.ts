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
                    <label class="block text-sm font-semibold text-gray-700 mb-2">내용 (마크다운 지원)</label>
                    <textarea id="upload-content" rows="12" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm" placeholder="## 신규 고객 첫 만남 전략&#10;&#10;### 핵심 원칙&#10;1. 첫 만남에서는 절대 보험 이야기를 하지 마세요&#10;2. 고객의 현재 고민을 경청하세요&#10;3. 3번째 만남 이후 자연스럽게 솔루션 제시&#10;&#10;### 30년 노하우&#10;- 급하게 계약하려는 마음이 고객에게 전달되면 신뢰가 무너집니다.&#10;- 진정한 관심을 보이고 천천히 접근하세요."></textarea>
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
    </div>

    <!-- 피드백 모달 -->
    <div id="feedbackModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
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
                        <i class="fas fa-pen-fancy text-purple-600 mr-2"></i>Director 피드백 (30년 노하우 반영)
                    </label>
                    <textarea id="modal-directorFeedback" rows="6" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="이 코칭 세션에 대한 센터장님의 의견을 작성해주세요.&#10;&#10;예시:&#10;- 우수 사례. ESTJ 성향에게는 '체계적으로 천천히'가 핵심입니다.&#10;- 이 케이스를 신규 설계사 교육에 활용 가능합니다.&#10;- 다만, 클로징 단계에서 추가 교육이 필요해 보입니다."></textarea>
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

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script>
        // 전역 변수
        let currentUser = null
        let allSessions = []
        let allPlanners = []
        let knowledgeBase = []
        
        // 초기화
        async function init() {
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
            }
        }
        
        // 차트 그리기
        function drawCharts(stats) {
            // 설계사별 세션 수 차트
            if (stats.sessionsByPlanner && stats.sessionsByPlanner.length > 0) {
                const ctx1 = document.getElementById('chartSessions').getContext('2d')
                new Chart(ctx1, {
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
            new Chart(ctx2, {
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
            
            document.getElementById('feedbackModal').classList.remove('hidden')
        }
        
        // 피드백 모달 닫기
        function closeFeedbackModal() {
            document.getElementById('feedbackModal').classList.add('hidden')
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
            const useForLearning = document.getElementById('modal-useForLearning').checked
            
            if (!feedback) {
                alert('피드백 내용을 입력해주세요.')
                return
            }
            
            try {
                await axios.post('/api/director/feedback', {
                    sessionId,
                    directorFeedback: feedback,
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
        
        // 자료 업로드
        async function uploadKnowledge() {
            const title = document.getElementById('upload-title').value.trim()
            const category = document.getElementById('upload-category').value
            const content = document.getElementById('upload-content').value.trim()
            const priority = document.getElementById('upload-priority').checked
            
            if (!title || !content) {
                alert('제목과 내용을 입력해주세요.')
                return
            }
            
            try {
                await axios.post('/api/director/knowledge', {
                    title,
                    category,
                    content,
                    priority
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
        }
        
        // 업로드된 자료 로드
        async function loadKnowledge() {
            try {
                const res = await axios.get('/api/director/knowledge')
                knowledgeBase = res.data.knowledge || []
                displayKnowledge()
            } catch (error) {
                console.error('자료 로드 실패:', error)
            }
        }
        
        // 자료 목록 표시
        function displayKnowledge() {
            const container = document.getElementById('uploadedKnowledge')
            
            if (knowledgeBase.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center py-4">아직 업로드된 자료가 없습니다.</p>'
                return
            }
            
            container.innerHTML = knowledgeBase.map((k, index) => \`
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h5 class="font-bold text-gray-800 mb-1">
                                \${k.priority ? '<i class="fas fa-star text-yellow-500 mr-2"></i>' : ''}\${k.title}
                            </h5>
                            <p class="text-xs text-gray-500 mb-2">
                                <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded">\${k.category}</span>
                                <span class="ml-2">\${new Date(k.uploadedAt).toLocaleDateString('ko-KR')}</span>
                            </p>
                            <p class="text-sm text-gray-700 line-clamp-2">\${k.content.substring(0, 150)}...</p>
                        </div>
                        <button onclick="deleteKnowledge(\${index})" class="ml-4 text-red-600 hover:text-red-800 transition">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            \`).join('')
        }
        
        // 자료 삭제
        async function deleteKnowledge(index) {
            if (!confirm('이 자료를 삭제하시겠습니까?')) return
            
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
        
        // 페이지 로드 시 초기화
        window.onload = init
    </script>
</body>
</html>
  `)
}
