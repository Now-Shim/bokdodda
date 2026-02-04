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
                <div class="text-right">
                    <p class="text-sm text-gray-600">환영합니다, <span id="managerName" class="font-bold text-blue-600">관리자님</span></p>
                    <button onclick="logout()" class="mt-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition">
                        <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
                    </button>
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
                            <p class="text-orange-100 text-sm">내부 노트</p>
                            <h3 id="stat-totalNotes" class="text-4xl font-bold mt-2">0</h3>
                        </div>
                        <i class="fas fa-sticky-note text-3xl text-orange-300"></i>
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

    <!-- 내부 노트 모달 -->
    <div id="noteModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-bold">
                        <i class="fas fa-sticky-note mr-2"></i>내부 노트 작성
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
                
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-lock mr-2 text-orange-600"></i>내부 노트 (설계사에게 비공개)
                    </label>
                    <textarea id="modal-managerNote" rows="6" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="설계사의 특징, 개선 필요 사항, 교육 추천 등을 작성하세요.&#10;&#10;예시:&#10;- 이영수 설계사는 분석적 성향이 강해 첫 만남에서 너무 많은 정보를 제공하는 경향&#10;- 감성적 접근 교육 필요&#10;- 클로징 기법 보강 추천"></textarea>
                </div>
                
                <div class="flex gap-4">
                    <button onclick="submitNote()" class="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-lg">
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
        
        // 초기화
        async function init() {
            const userData = localStorage.getItem('user')
            if (!userData) {
                window.location.href = '/'
                return
            }
            
            currentUser = JSON.parse(userData)
            if (currentUser.role !== 'manager') {
                alert('관리자 권한이 필요합니다.')
                window.location.href = '/'
                return
            }
            
            document.getElementById('managerName').textContent = currentUser.name
            
            await loadOverview()
            await loadSessions()
            await loadPlanners()
        }
        
        // 전체 현황 로드
        async function loadOverview() {
            try {
                const res = await axios.get('/api/manager/overview')
                const data = res.data
                
                document.getElementById('stat-totalPlanners').textContent = data.totalPlanners || 0
                document.getElementById('stat-totalSessions').textContent = data.totalSessions || 0
                document.getElementById('stat-totalNotes').textContent = data.totalNotes || 0
                
                displayRecentSessions(data.recentSessions || [])
                displayAttentionPlanners(data.attentionPlanners || [])
            } catch (error) {
                console.error('전체 현황 로드 실패:', error)
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
                <div class="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <p class="font-bold text-gray-800">\${s.plannerName}</p>
                            <p class="text-sm text-gray-600 mt-1">\${s.context.substring(0, 80)}...</p>
                            <p class="text-xs text-gray-500 mt-2">\${new Date(s.sessionDate).toLocaleString('ko-KR')}</p>
                        </div>
                        <span class="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded">\${s.situationType}</span>
                    </div>
                </div>
            \`).join('')
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
            try {
                const res = await axios.get('/api/manager/sessions')
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
                const hasNote = session.managerNote && session.managerNote.length > 0
                    
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
                                    \${hasNote ? '<span class="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full"><i class="fas fa-sticky-note mr-1"></i>노트 있음</span>' : ''}
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
                            <p class="text-gray-700 bg-green-50 p-3 rounded border-l-4 border-green-500 whitespace-pre-wrap">\${session.coachingAdvice.substring(0, 200)}...</p>
                        </div>
                        
                        \${hasNote ? \`
                        <div class="mb-4">
                            <p class="text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-lock mr-2 text-orange-600"></i>내부 노트 (비공개)
                            </p>
                            <p class="text-gray-700 bg-orange-50 p-3 rounded border-l-4 border-orange-500">\${session.managerNote}</p>
                        </div>
                        \` : ''}
                        
                        <div class="flex gap-3 mt-4">
                            <button onclick="openNoteModal(\${session.id})" class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-lg">
                                <i class="fas fa-\${hasNote ? 'edit' : 'plus-circle'} mr-2"></i>\${hasNote ? '노트 수정' : '노트 작성'}
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
        
        // 노트 모달 열기
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
            document.getElementById('modal-managerNote').value = session.managerNote || ''
            
            document.getElementById('noteModal').classList.remove('hidden')
        }
        
        // 노트 모달 닫기
        function closeNoteModal() {
            document.getElementById('noteModal').classList.add('hidden')
        }
        
        // 노트 제출
        async function submitNote() {
            const sessionId = parseInt(document.getElementById('modal-sessionId').value)
            const note = document.getElementById('modal-managerNote').value.trim()
            
            if (!note) {
                alert('내부 노트 내용을 입력해주세요.')
                return
            }
            
            try {
                await axios.post('/api/manager/note', {
                    sessionId,
                    managerNote: note
                })
                
                alert('내부 노트가 성공적으로 저장되었습니다!')
                closeNoteModal()
                await loadSessions()
                await loadOverview()
            } catch (error) {
                console.error('노트 저장 실패:', error)
                alert('노트 저장에 실패했습니다.')
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
