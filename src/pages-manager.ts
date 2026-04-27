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
    <script>
        // 전역 변수
        let currentUser = null
        let allSessions = []
        let allPlanners = []
        let notifications = []
        let notificationCheckInterval = null
        
        // 초기화
        async function init() {
            console.log('[Manager] init 시작')
            const userData = localStorage.getItem('user')
            if (!userData) {
                console.log('[Manager] 사용자 정보 없음, 로그인 페이지로 이동')
                window.location.href = '/'
                return
            }
            
            currentUser = JSON.parse(userData)
            console.log('[Manager] 현재 사용자:', currentUser)
            if (currentUser.role !== 'manager') {
                alert('관리자 권한이 필요합니다.')
                window.location.href = '/'
                return
            }
            
            document.getElementById('managerName').textContent = currentUser.name
            
            console.log('[Manager] 데이터 로딩 시작...')
            await loadOverview()
            await loadSessions()
            await loadPlanners()
            
            // 알림 시스템 시작
            startNotificationCheck()
            
            console.log('[Manager] init 완료')
        }
        
        // 전체 현황 로드
        async function loadOverview() {
            try {
                console.log('[Manager] loadOverview 시작')
                const res = await axios.get('/api/manager/overview')
                console.log('[Manager] API 응답:', res.data)
                const data = res.data
                
                console.log('[Manager] 통계 업데이트 중...')
                document.getElementById('stat-totalPlanners').textContent = data.totalPlanners || 0
                document.getElementById('stat-totalSessions').textContent = data.totalSessions || 0
                document.getElementById('stat-totalNotes').textContent = data.totalNotes || 0
                
                console.log('[Manager] 최근 세션 표시:', data.recentSessions?.length)
                displayRecentSessions(data.recentSessions || [])
                console.log('[Manager] 주의 설계사 표시:', data.attentionPlanners?.length)
                displayAttentionPlanners(data.attentionPlanners || [])
                console.log('[Manager] loadOverview 완료')
            } catch (error) {
                console.error('[Manager] 전체 현황 로드 실패:', error)
            }
        }
        
        // 최근 세션 표시
        function displayRecentSessions(sessions) {
            const container = document.getElementById('recentSessions')
            
            if (sessions.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center py-8">최근 코칭 활동이 없습니다.</p>'
                return
            }
            
            container.innerHTML = sessions.map(s => \`
                <div class="border-l-4 border-blue-500 bg-blue-50 p-4 rounded hover:shadow-md transition">
                    <div class="flex justify-between items-start gap-4">
                        <div class="flex-1">
                            <p class="font-bold text-gray-800">\${s.plannerName}</p>
                            <p class="text-sm text-gray-600 mt-1">\${s.context.substring(0, 80)}...</p>
                            <p class="text-xs text-gray-500 mt-2">
                                <i class="fas fa-clock mr-1"></i>\${new Date(s.sessionDate).toLocaleString('ko-KR')}
                            </p>
                        </div>
                        <div class="flex flex-col gap-2 items-end">
                            <span class="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded whitespace-nowrap">\${s.situationType}</span>
                            <button onclick="openManagerAnalysis(\${s.id})" class="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-lg hover:from-orange-600 hover:to-red-600 transition shadow-md whitespace-nowrap">
                                <i class="fas fa-user-cog mr-1"></i>Manager 역할 분석
                            </button>
                        </div>
                    </div>
                </div>
            \`).join('')
        }
        
        // Manager 역할 분석 바로가기 (전체현황에서 호출)
        function openManagerAnalysis(sessionId) {
            // 1. 코칭 세션 관리 탭으로 전환
            switchTab('sessions')
            
            // 2. 잠시 후 해당 세션의 Manager 역할 분석 모달 열기
            setTimeout(() => {
                openNoteModal(sessionId)
            }, 100)
        }
        
        // 주의 필요 설계사 표시
        function displayAttentionPlanners(planners) {
            const container = document.getElementById('attentionPlanners')
            
            if (planners.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center py-8">주의가 필요한 설계사가 없습니다.</p>'
                return
            }
            
            container.innerHTML = planners.map(p => \`
                <div class="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-gray-800">\${p.name}</p>
                            <p class="text-sm text-gray-600 mt-1">\${p.reason}</p>
                        </div>
                        <button onclick="viewPlannerDetail(\${p.id})" class="text-orange-600 hover:text-orange-800 text-sm font-semibold">
                            상세보기 →
                        </button>
                    </div>
                </div>
            \`).join('')
        }
        
        // 세션 목록 로드
        async function loadSessions() {
            console.log('[Manager] loadSessions 시작')
            try {
                const res = await axios.get('/api/manager/sessions')
                console.log('[Manager] API 응답:', res.data)
                allSessions = res.data.sessions
                allPlanners = res.data.planners
                console.log('[Manager] 세션 수:', allSessions.length, '설계사 수:', allPlanners.length)
                
                // 필터 옵션 설정
                const plannerSelect = document.getElementById('filter-planner')
                plannerSelect.innerHTML = '<option value="all">전체</option>' + 
                    allPlanners.map(p => \`<option value="\${p.id}">\${p.name}</option>\`).join('')
                
                console.log('[Manager] displaySessions 호출 전')
                displaySessions(allSessions)
                console.log('[Manager] displaySessions 호출 후')
            } catch (error) {
                console.error('[Manager] 세션 로드 실패:', error)
            }
        }
        
        // 세션 표시
        function displaySessions(sessions) {
            console.log('[Manager] displaySessions 시작, 세션 수:', sessions.length)
            const container = document.getElementById('sessionsList')
            console.log('[Manager] sessionsList container:', container)
            
            if (sessions.length === 0) {
                console.log('[Manager] 세션이 없습니다')
                container.innerHTML = '<div class="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">조건에 맞는 세션이 없습니다.</div>'
                return
            }
            
            console.log('[Manager] 세션 렌더링 시작...')
            
            container.innerHTML = sessions.map(session => {
                const planner = allPlanners.find(p => p.id === session.plannerId)
                const plannerName = planner ? planner.name : '알 수 없음'
                const hasManagerAction = (session.managerAIAdvice && session.managerAIAdvice.length > 0) || (session.managerNote && session.managerNote.length > 0)
                    
                return \`
                    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <p class="text-sm text-gray-500 mb-1">\${new Date(session.sessionDate).toLocaleDateString('ko-KR')} \${new Date(session.sessionDate).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</p>
                                <h4 class="text-lg font-bold text-gray-800 mb-2">
                                    <i class="fas fa-user-circle mr-2 text-blue-600"></i>\${plannerName}
                                </h4>
                                <div class="flex gap-2">
                                    <span class="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">\${session.situationType}</span>
                                    \${hasManagerAction ? '<span class="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full"><i class="fas fa-user-cog mr-1"></i>Manager 역할 분석됨</span>' : ''}
                                </div>
                            </div>
                            <div class="text-right">
                                \${session.effectivenessRating ? \`<p class="text-sm text-gray-600">설계사 평가: <span class="font-bold text-yellow-600">${'⭐'.repeat(1)}\${session.effectivenessRating}</span></p>\` : ''}
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <p class="text-sm font-semibold text-gray-700 mb-2"><i class="fas fa-question-circle mr-2 text-blue-600"></i>설계사의 질문</p>
                            <p class="text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-500">\${session.context}</p>
                        </div>
                        
                        <div class="mb-4">
                            <p class="text-sm font-semibold text-gray-700 mb-2"><i class="fas fa-comments mr-2 text-green-600"></i>AI 코칭 내용</p>
                            <p class="text-gray-700 bg-green-50 p-3 rounded border-l-4 border-green-500 whitespace-pre-wrap">\${session.coachingAdvice ? session.coachingAdvice.substring(0, 200) + '...' : '코칭 내용 없음'}</p>
                        </div>
                        
                        \${session.managerRequest ? \`
                        <div class="mb-4">
                            <p class="text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-hand-point-right mr-2 text-purple-600"></i>매니저 요청 사항
                            </p>
                            <p class="text-gray-700 bg-purple-50 p-3 rounded border-l-4 border-purple-500">\${session.managerRequest}</p>
                        </div>
                        \` : ''}
                        
                        \${session.managerAIAdvice ? \`
                        <div class="mb-4">
                            <p class="text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-user-cog mr-2 text-orange-600"></i>Manager 추가 역할 (AI 분석)
                            </p>
                            <p class="text-gray-700 bg-orange-50 p-3 rounded border-l-4 border-orange-500 whitespace-pre-wrap">\${(session.managerAIAdvice || '').substring(0, 200)}...</p>
                        </div>
                        \` : ''}
                        
                        \${session.managerNote ? \`
                        <div class="mb-4">
                            <p class="text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-lock mr-2 text-gray-600"></i>추가 메모
                            </p>
                            <p class="text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-gray-500">\${session.managerNote}</p>
                        </div>
                        \` : ''}
                        
                        <div class="flex gap-3 mt-4">
                            <button onclick="openNoteModal(\${session.id})" class="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition font-semibold shadow-lg">
                                <i class="fas fa-\${hasManagerAction ? 'edit' : 'plus-circle'} mr-2"></i>\${hasManagerAction ? 'Manager 역할 수정' : 'Manager 역할 분석'}
                            </button>
                        </div>
                    </div>
                \`
            }).join('')
        }
        
        // 필터 적용
        function applyFilters() {
            const plannerId = document.getElementById('filter-planner').value
            const situationType = document.getElementById('filter-situation').value
            
            let filtered = [...allSessions]
            
            if (plannerId !== 'all') {
                filtered = filtered.filter(s => s.plannerId === parseInt(plannerId))
            }
            
            if (situationType !== 'all') {
                filtered = filtered.filter(s => s.situationType === situationType)
            }
            
            displaySessions(filtered)
        }
        
        // 설계사 목록 로드
        async function loadPlanners() {
            try {
                const res = await axios.get('/api/manager/planners')
                const planners = res.data.planners
                displayPlanners(planners)
            } catch (error) {
                console.error('설계사 목록 로드 실패:', error)
            }
        }
        
        // 설계사 목록 표시
        function displayPlanners(planners) {
            const container = document.getElementById('plannersList')
            
            if (planners.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-2">설계사가 없습니다.</p>'
                return
            }
            
            container.innerHTML = planners.map(p => \`
                <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h4 class="text-xl font-bold text-gray-800 mb-2">\${p.name}</h4>
                            <p class="text-sm text-gray-600 mb-1"><i class="fas fa-envelope mr-2"></i>\${p.email}</p>
                            <p class="text-sm text-gray-600"><i class="fas fa-phone mr-2"></i>\${p.phone || '없음'}</p>
                        </div>
                    </div>
                    
                    <div class="border-t pt-4 mb-4">
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p class="text-gray-500">성향</p>
                                <p class="font-bold text-gray-800">\${p.personalityType}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">영업 스타일</p>
                                <p class="font-bold text-gray-800">\${p.salesStyle}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">경력</p>
                                <p class="font-bold text-gray-800">\${p.experienceYears}년</p>
                            </div>
                            <div>
                                <p class="text-gray-500">전문 분야</p>
                                <p class="font-bold text-gray-800">\${p.specialization}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="border-t pt-4">
                        <div class="grid grid-cols-2 gap-3 text-center">
                            <div class="bg-blue-50 rounded-lg p-3">
                                <p class="text-2xl font-bold text-blue-600">\${p.totalCoachingSessions}</p>
                                <p class="text-xs text-gray-600">코칭 세션</p>
                            </div>
                            <div class="bg-green-50 rounded-lg p-3">
                                <p class="text-2xl font-bold text-green-600">\${p.totalTrainingCompleted}</p>
                                <p class="text-xs text-gray-600">교육 이수</p>
                            </div>
                        </div>
                    </div>
                    
                    <button onclick="viewPlannerDetail(\${p.userId})" class="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                        <i class="fas fa-chart-line mr-2"></i>상세 정보
                    </button>
                </div>
            \`).join('')
        }
        
        // 설계사 상세 보기
        function viewPlannerDetail(userId) {
            // 설계사별 세션 필터링
            document.getElementById('filter-planner').value = userId
            switchTab('sessions')
            applyFilters()
        }
        
        // Manager 역할 모달 열기
        function openNoteModal(sessionId) {
            const session = allSessions.find(s => s.id === sessionId)
            if (!session) return
            
            const planner = allPlanners.find(p => p.id === session.plannerId)
            
            document.getElementById('modal-sessionId').value = sessionId
            document.getElementById('modal-plannerName').textContent = planner ? planner.name : '알 수 없음'
            document.getElementById('modal-sessionDate').textContent = new Date(session.sessionDate).toLocaleString('ko-KR')
            document.getElementById('modal-situationType').textContent = session.situationType
            document.getElementById('modal-context').textContent = session.context
            document.getElementById('modal-coachingAdvice').textContent = session.coachingAdvice
            
            // AI 생성 결과 표시
            const aiAdviceEl = document.getElementById('modal-managerAIAdvice')
            if (session.managerAIAdvice) {
                // whitespace-pre-wrap 제거하고 명시적으로 줄바꿈 처리
                const lines = session.managerAIAdvice.split('\\n')
                const formattedHTML = lines.map(line => {
                    if (line.trim() === '') return '<br>'
                    if (line.trim() === '---') return '<hr class="my-4 border-gray-300">'
                    // 이모지로 시작하는 섹션 헤더는 굵게
                    if (/^[💪📊🎯📚🗣️📝🤝⭐]/.test(line.trim())) {
                        return '<p class="font-bold text-lg mt-4 mb-2 text-orange-700">' + line + '</p>'
                    }
                    // 숫자로 시작하는 리스트 항목
                    if (/^\\d+\\./.test(line.trim())) {
                        return '<p class="ml-4 mb-2 text-gray-800">' + line + '</p>'
                    }
                    return '<p class="mb-2 text-gray-800">' + line + '</p>'
                }).join('')
                aiAdviceEl.innerHTML = '<div class="space-y-1">' + formattedHTML + '</div>'
            } else {
                aiAdviceEl.innerHTML = '<p class="text-gray-500 italic text-center py-12"><i class="fas fa-lightbulb text-5xl text-orange-400 mb-6 block"></i><span class="text-lg">👆 <span class="font-bold">\\'AI 분석 시작\\'</span> 버튼을 클릭하면,<br><br>이 코칭 케이스에서 Manager가 추가로 수행해야 할 역할을<br><span class="text-orange-600 font-bold text-xl">자존감 향상</span>과 <span class="text-orange-600 font-bold text-xl">구체적 실행</span> 중심으로<br>AI가 분석해드립니다.</span></p>'
            }
            
            document.getElementById('modal-managerNote').value = session.managerNote || ''
            
            document.getElementById('noteModal').classList.remove('hidden')
        }
        
        // Manager 역할 모달 닫기
        function closeNoteModal() {
            document.getElementById('noteModal').classList.add('hidden')
        }
        
        // AI Manager 역할 분석 생성
        async function generateManagerAdvice() {
            const sessionId = parseInt(document.getElementById('modal-sessionId').value)
            const btn = document.getElementById('generate-advice-btn')
            const adviceEl = document.getElementById('modal-managerAIAdvice')
            
            console.log('[Manager AI] 세션 ID:', sessionId)
            console.log('[Manager AI] API 호출 준비...')
            
            // 버튼 비활성화 및 로딩 표시
            btn.disabled = true
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>AI 분석 중...'
            adviceEl.innerHTML = '<p class="text-gray-500 italic"><i class="fas fa-spinner fa-spin mr-2"></i>Manager 추가 역할을 분석하고 있습니다. 잠시만 기다려주세요...</p>'
            
            try {
                const apiUrl = '/api/manager/advice/' + sessionId
                console.log('[Manager AI] API URL:', apiUrl)
                
                const response = await axios.post(apiUrl, {}, {
                    timeout: 120000 // 2분 타임아웃
                })
                
                console.log('[Manager AI] 응답 성공:', response.data)
                
                const advice = response.data.advice
                
                // 포맷팅: 이모지 섹션 헤더 강조, 리스트 들여쓰기
                const lines = advice.split('\\n')
                const formattedHTML = lines.map(line => {
                    if (line.trim() === '') return '<br>'
                    if (line.trim() === '---') return '<hr class="my-4 border-gray-300">'
                    // 이모지로 시작하는 섹션 헤더는 굵게
                    if (/^[💪📊🎯📚🗣️📝🤝⭐]/.test(line.trim())) {
                        return '<p class="font-bold text-lg mt-4 mb-2 text-orange-700">' + line + '</p>'
                    }
                    // 숫자로 시작하는 리스트 항목
                    if (/^\\d+\\./.test(line.trim())) {
                        return '<p class="ml-4 mb-2 text-gray-800">' + line + '</p>'
                    }
                    return '<p class="mb-2 text-gray-800">' + line + '</p>'
                }).join('')
                
                adviceEl.innerHTML = '<div class="space-y-1">' + formattedHTML + '</div>'
                
                // 버튼 복구
                btn.disabled = false
                btn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>재분석'
                
                // 세션 데이터 업데이트
                const session = allSessions.find(s => s.id === sessionId)
                if (session) {
                    session.managerAIAdvice = advice
                }
                
            } catch (error) {
                console.error('[Manager AI] 전체 에러 객체:', error)
                console.error('[Manager AI] 에러 응답:', error.response)
                console.error('[Manager AI] 에러 데이터:', error.response?.data)
                console.error('[Manager AI] 에러 상태:', error.response?.status)
                
                let errorMsg = 'AI 분석에 실패했습니다. 다시 시도해주세요.'
                if (error.response?.data?.error) {
                    errorMsg = error.response.data.error
                }
                
                adviceEl.innerHTML = '<p class="text-red-600"><i class="fas fa-exclamation-circle mr-2"></i>' + errorMsg + '</p>'
                btn.disabled = false
                btn.innerHTML = '<i class="fas fa-wand-magic-sparkles mr-2"></i>AI 분석 시작'
            }
        }
        
        // Manager 역할 저장 (AI 분석 + 추가 메모)
        async function submitManagerAction() {
            const sessionId = parseInt(document.getElementById('modal-sessionId').value)
            const note = document.getElementById('modal-managerNote').value.trim()
            const aiAdviceEl = document.getElementById('modal-managerAIAdvice')
            const aiAdviceText = aiAdviceEl.innerText
            
            // AI 분석이 아직 안 되었으면 경고
            if (aiAdviceText.includes('AI 분석 시작')) {
                const confirmSave = confirm('AI 분석을 아직 하지 않았습니다. 그래도 저장하시겠습니까?')
                if (!confirmSave) return
            }
            
            try {
                // 현재 세션에서 managerAIAdvice 가져오기
                const session = allSessions.find(s => s.id === sessionId)
                const managerAIAdvice = session?.managerAIAdvice || null
                
                await axios.post('/api/manager/action', {
                    sessionId,
                    managerAIAdvice,
                    managerNote: note || null
                })
                
                alert('Manager 추가 역할이 성공적으로 저장되었습니다!')
                closeNoteModal()
                await loadSessions()
                await loadOverview()
            } catch (error) {
                console.error('저장 실패:', error)
                alert('저장에 실패했습니다.')
            }
        }
        
        // 탭 전환
        function switchTab(tab) {
            // 모든 탭 버튼 초기화
            document.querySelectorAll('[id^="tab-"]').forEach(btn => {
                btn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600')
                btn.classList.add('text-gray-500')
            })
            
            // 모든 탭 콘텐츠 숨김
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden')
            })
            
            // 선택된 탭 활성화
            document.getElementById(\`tab-\${tab}\`).classList.remove('text-gray-500')
            document.getElementById(\`tab-\${tab}\`).classList.add('text-blue-600', 'border-b-2', 'border-blue-600')
            document.getElementById(\`content-\${tab}\`).classList.remove('hidden')
        }
        
        // ===== 알림 시스템 =====
        
        // 알림 조회
        async function loadNotifications() {
            if (!currentUser) return
            
            try {
                const res = await axios.get('/api/notifications/' + currentUser.id)
                notifications = res.data.notifications || []
                const unreadCount = res.data.unreadCount || 0
                
                // 배지 업데이트
                const badge = document.getElementById('notificationBadge')
                if (unreadCount > 0) {
                    badge.textContent = unreadCount > 9 ? '9+' : unreadCount
                    badge.classList.remove('hidden')
                } else {
                    badge.classList.add('hidden')
                }
                
                // 알림 목록 렌더링
                displayNotifications()
            } catch (error) {
                console.error('[알림] 조회 실패:', error)
            }
        }
        
        // 알림 목록 표시
        function displayNotifications() {
            const container = document.getElementById('notificationList')
            
            if (notifications.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center py-8 text-sm">새로운 알림이 없습니다</p>'
                return
            }
            
            container.innerHTML = notifications.map(n => \`
                <div class="p-4 hover:bg-gray-50 cursor-pointer transition" onclick="handleNotificationClick(\${n.id}, \${n.session_id})">
                    <div class="flex items-start gap-3">
                        <div class="flex-shrink-0">
                            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-bell text-blue-600"></i>
                            </div>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-800 text-sm">\${n.title}</h4>
                            <p class="text-gray-600 text-xs mt-1">\${n.message}</p>
                            <p class="text-gray-400 text-xs mt-2">\${new Date(n.created_at).toLocaleString('ko-KR')}</p>
                        </div>
                    </div>
                </div>
            \`).join('')
        }
        
        // 알림 패널 토글
        function toggleNotifications() {
            const panel = document.getElementById('notificationPanel')
            panel.classList.toggle('hidden')
            
            if (!panel.classList.contains('hidden')) {
                loadNotifications()
            }
        }
        
        // 알림 클릭 처리
        async function handleNotificationClick(notificationId, sessionId) {
            // 읽음 처리
            try {
                await axios.post('/api/notifications/' + notificationId + '/read')
            } catch (error) {
                console.error('[알림] 읽음 처리 실패:', error)
            }
            
            // 알림 패널 닫기
            document.getElementById('notificationPanel').classList.add('hidden')
            
            // 해당 세션으로 이동
            if (sessionId) {
                openManagerAnalysis(sessionId)
            }
            
            // 알림 다시 로드
            await loadNotifications()
        }
        
        // 모두 읽음 처리
        async function markAllAsRead() {
            if (!currentUser) return
            
            try {
                await axios.post('/api/notifications/read-all/' + currentUser.id)
                await loadNotifications()
            } catch (error) {
                console.error('[알림] 전체 읽음 처리 실패:', error)
            }
        }
        
        // 알림 주기적 체크 (10초마다)
        function startNotificationCheck() {
            loadNotifications() // 즉시 한번 로드
            notificationCheckInterval = setInterval(() => {
                loadNotifications()
            }, 10000) // 10초마다
        }
        
        function stopNotificationCheck() {
            if (notificationCheckInterval) {
                clearInterval(notificationCheckInterval)
                notificationCheckInterval = null
            }
        }
        
        // 로그아웃
        function logout() {
            stopNotificationCheck()
            localStorage.removeItem('user')
            window.location.href = '/'
        }
        
        // 전역 함수 등록
        window.switchTab = switchTab
        window.logout = logout
        window.applyFilters = applyFilters
        window.openNoteModal = openNoteModal
        window.closeNoteModal = closeNoteModal
        window.generateManagerAdvice = generateManagerAdvice
        window.submitManagerAction = submitManagerAction
        window.viewPlannerDetail = viewPlannerDetail
        window.openManagerAnalysis = openManagerAnalysis
        window.toggleNotifications = toggleNotifications
        window.handleNotificationClick = handleNotificationClick
        window.markAllAsRead = markAllAsRead
        
        // 자동 새로고침 (30초마다)
        let autoRefreshInterval = null
        
        function startAutoRefresh() {
            autoRefreshInterval = setInterval(async () => {
                console.log('[Manager] 자동 새로고침 중...')
                await loadOverview()
                await loadSessions()
                await loadPlanners()
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
        
        // 페이지 종료 시 자동 새로고침 중지
        window.onbeforeunload = () => {
            stopAutoRefresh()
        }
    </script>
</body>
</html>
  `)
}
