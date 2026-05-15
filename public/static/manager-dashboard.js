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
    
    container.innerHTML = sessions.map(s => `
        <div class="border-l-4 border-blue-500 bg-blue-50 p-4 rounded hover:shadow-md transition">
            <div class="flex justify-between items-start gap-4">
                <div class="flex-1">
                    <p class="font-bold text-gray-800">${s.plannerName}</p>
                    <p class="text-sm text-gray-600 mt-1">${s.context.substring(0, 80)}...</p>
                    <p class="text-xs text-gray-500 mt-2">
                        <i class="fas fa-clock mr-1"></i>${new Date(s.sessionDate).toLocaleString('ko-KR')}
                    </p>
                </div>
                <div class="flex flex-col gap-2 items-end">
                    <span class="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded whitespace-nowrap">${s.situationType}</span>
                    <button onclick="openManagerAnalysis(${s.id})" class="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-lg hover:from-orange-600 hover:to-red-600 transition shadow-md whitespace-nowrap">
                        <i class="fas fa-user-cog mr-1"></i>Manager 역할 분석
                    </button>
                </div>
            </div>
        </div>
    `).join('')
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
    
    container.innerHTML = planners.map(p => `
        <div class="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-bold text-gray-800">${p.name}</p>
                    <p class="text-sm text-gray-600 mt-1">${p.reason}</p>
                </div>
                <button onclick="viewPlannerDetail(${p.id})" class="text-orange-600 hover:text-orange-800 text-sm font-semibold">
                    상세보기 →
                </button>
            </div>
        </div>
    `).join('')
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
            allPlanners.map(p => '<option value="' + p.id + '">' + p.name + '</option>').join('')
        
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
            
        return `
            <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <p class="text-sm text-gray-500 mb-1">${new Date(session.sessionDate).toLocaleDateString('ko-KR')} ${new Date(session.sessionDate).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</p>
                        <h4 class="text-lg font-bold text-gray-800 mb-2">
                            <i class="fas fa-user-circle mr-2 text-blue-600"></i>${plannerName}
                        </h4>
                        <div class="flex gap-2">
                            <span class="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">${session.situationType}</span>
                            ${hasManagerAction ? '<span class="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full"><i class="fas fa-user-cog mr-1"></i>Manager 역할 분석됨</span>' : ''}
                        </div>
                    </div>
                    <div class="text-right">
                        ${session.effectivenessRating ? '<p class="text-sm text-gray-600">설계사 평가: <span class="font-bold text-yellow-600">' + '⭐'.repeat(session.effectivenessRating) + '</span></p>' : ''}
                    </div>
                </div>
                
                <div class="mb-4">
                    <p class="text-sm font-semibold text-gray-700 mb-2"><i class="fas fa-question-circle mr-2 text-blue-600"></i>설계사의 질문</p>
                    <p class="text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-500">${session.context}</p>
                </div>
                
                <div class="mb-4">
                    <p class="text-sm font-semibold text-gray-700 mb-2"><i class="fas fa-comments mr-2 text-green-600"></i>AI 코칭 내용</p>
                    <p class="text-gray-700 bg-green-50 p-3 rounded border-l-4 border-green-500 whitespace-pre-wrap">${session.coachingAdvice ? session.coachingAdvice.substring(0, 200) + '...' : '코칭 내용 없음'}</p>
                </div>
                
                ${session.managerRequest ? `
                <div class="mb-4">
                    <p class="text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-hand-point-right mr-2 text-purple-600"></i>매니저 요청 사항
                    </p>
                    <p class="text-gray-700 bg-purple-50 p-3 rounded border-l-4 border-purple-500">${session.managerRequest}</p>
                </div>
                ` : ''}
                
                ${session.managerAIAdvice ? `
                <div class="mb-4">
                    <p class="text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-user-cog mr-2 text-orange-600"></i>Manager 추가 역할 (AI 분석)
                    </p>
                    <p class="text-gray-700 bg-orange-50 p-3 rounded border-l-4 border-orange-500 whitespace-pre-wrap">${(session.managerAIAdvice || '').substring(0, 200)}...</p>
                </div>
                ` : ''}
                
                ${session.managerNote ? `
                <div class="mb-4">
                    <p class="text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-lock mr-2 text-gray-600"></i>추가 메모
                    </p>
                    <p class="text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-gray-500">${session.managerNote}</p>
                </div>
                ` : ''}
                
                <div class="flex gap-3 mt-4">
                    <button onclick="openNoteModal(${session.id})" class="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition font-semibold shadow-lg">
                        <i class="fas fa-${hasManagerAction ? 'edit' : 'plus-circle'} mr-2"></i>${hasManagerAction ? 'Manager 역할 수정' : 'Manager 역할 분석'}
                    </button>
                </div>
            </div>
        `
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
    
    container.innerHTML = planners.map(p => `
        <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h4 class="text-xl font-bold text-gray-800 mb-2">${p.name}</h4>
                    <p class="text-sm text-gray-600 mb-1"><i class="fas fa-envelope mr-2"></i>${p.email}</p>
                    <p class="text-sm text-gray-600"><i class="fas fa-phone mr-2"></i>${p.phone || '없음'}</p>
                </div>
            </div>
            
            <div class="border-t pt-4 mb-4">
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p class="text-gray-500">성향</p>
                        <p class="font-bold text-gray-800">${p.personalityType}</p>
                    </div>
                    <div>
                        <p class="text-gray-500">영업 스타일</p>
                        <p class="font-bold text-gray-800">${p.salesStyle}</p>
                    </div>
                    <div>
                        <p class="text-gray-500">경력</p>
                        <p class="font-bold text-gray-800">${p.experienceYears}년</p>
                    </div>
                    <div>
                        <p class="text-gray-500">전문 분야</p>
                        <p class="font-bold text-gray-800">${p.specialization}</p>
                    </div>
                </div>
            </div>
            
            <div class="border-t pt-4">
                <div class="grid grid-cols-2 gap-3 text-center">
                    <div class="bg-blue-50 rounded-lg p-3">
                        <p class="text-2xl font-bold text-blue-600">${p.totalCoachingSessions}</p>
                        <p class="text-xs text-gray-600">코칭 세션</p>
                    </div>
                    <div class="bg-green-50 rounded-lg p-3">
                        <p class="text-2xl font-bold text-green-600">${p.totalTrainingCompleted}</p>
                        <p class="text-xs text-gray-600">교육 이수</p>
                    </div>
                </div>
            </div>
            
            <button onclick="viewPlannerDetail(${p.userId})" class="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                <i class="fas fa-chart-line mr-2"></i>상세 정보
            </button>
        </div>
    `).join('')
}

// 설계사 상세 보기
let currentPlannerDetail = null
let currentPlannerSessions = []

async function viewPlannerDetail(userId) {
    try {
        // 설계사 정보 가져오기
        const plannerRes = await axios.get('/api/planner/' + userId)
        const { user, profile } = plannerRes.data
        
        currentPlannerDetail = { user, profile }
        
        // 모달 열기
        document.getElementById('plannerDetailModal').classList.remove('hidden')
        document.getElementById('plannerDetailModal').classList.add('flex')
        
        // 기본 정보 표시
        document.getElementById('detail-plannerName').textContent = user.name
        document.getElementById('detail-email').textContent = user.email
        document.getElementById('detail-phone').textContent = user.phone || '없음'
        
        // 경력 연수 자동 계산
        let experienceText = '미설정'
        if (profile.careerStartYear) {
            const currentYear = new Date().getFullYear()
            const experienceYears = currentYear - parseInt(profile.careerStartYear) + 1
            experienceText = experienceYears + '년 (' + profile.careerStartYear + '년 시작)'
        }
        document.getElementById('detail-experience').textContent = experienceText
        
        // 전문 분야 자동 판단
        let specializationText = '미설정'
        if (profile.productRatio) {
            const ratioMatch = profile.productRatio.match(/생보 (\d+)% \/ 손보 (\d+)%/)
            if (ratioMatch) {
                const lifeRatio = parseInt(ratioMatch[1])
                const nonLifeRatio = parseInt(ratioMatch[2])
                
                if (lifeRatio >= 70) {
                    specializationText = '생명보험 전문 (생보 ' + lifeRatio + '%)'
                } else if (nonLifeRatio >= 70) {
                    specializationText = '손해보험 전문 (손보 ' + nonLifeRatio + '%)'
                } else if (Math.abs(lifeRatio - nonLifeRatio) <= 20) {
                    specializationText = '통합형 (생보 ' + lifeRatio + '% / 손보 ' + nonLifeRatio + '%)'
                } else if (lifeRatio > nonLifeRatio) {
                    specializationText = '생보 중심 (생보 ' + lifeRatio + '%)'
                } else {
                    specializationText = '손보 중심 (손보 ' + nonLifeRatio + '%)'
                }
            }
        }
        document.getElementById('detail-specialization').textContent = specializationText
        
        // 성향 분석 표시
        displayPlannerPersonality(profile)
        
        // 코칭 이력 로드
        await loadPlannerCoachingHistory(userId)
        
        // 기본 탭 활성화
        switchDetailTab('profile')
    } catch (error) {
        console.error('설계사 상세 정보 로드 오류:', error)
        alert('설계사 정보를 불러오는데 실패했습니다.')
    }
}

// 설계사 성향 분석 표시
function displayPlannerPersonality(profile) {
    const container = document.getElementById('detail-personality-content')
    
    if (!profile.personalityType || profile.personalityType === '미분석' || !profile.energyDirection) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-circle text-5xl text-gray-400 mb-4"></i>
                <p class="text-gray-600 text-lg">아직 성향 분석을 완료하지 않았습니다.</p>
                <p class="text-gray-500 text-sm mt-2">설계사가 대시보드에서 성향 테스트를 완료하면 여기에 표시됩니다.</p>
            </div>
        `
        return
    }
    
    container.innerHTML = `
        <div class="space-y-6">
            <!-- 종합 성향 -->
            <div class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
                <h5 class="text-lg font-bold text-gray-800 mb-3">
                    <i class="fas fa-star mr-2 text-yellow-500"></i>종합 성향 타입
                </h5>
                <p class="text-3xl font-bold text-purple-600">${profile.personalityType}</p>
            </div>
            
            <!-- 세부 분석 -->
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-blue-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">에너지 방향</p>
                    <p class="text-lg font-bold text-blue-600">${profile.energyDirection}</p>
                </div>
                <div class="bg-green-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">정보 인식</p>
                    <p class="text-lg font-bold text-green-600">${profile.informationProcessing}</p>
                </div>
                <div class="bg-orange-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">의사 결정</p>
                    <p class="text-lg font-bold text-orange-600">${profile.decisionMaking}</p>
                </div>
                <div class="bg-purple-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">성취 동기</p>
                    <p class="text-lg font-bold text-purple-600">${profile.achievementMotivation}</p>
                </div>
                <div class="bg-pink-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">스트레스 회복</p>
                    <p class="text-lg font-bold text-pink-600">${profile.stressRecovery}</p>
                </div>
                <div class="bg-indigo-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">전문성 선호</p>
                    <p class="text-lg font-bold text-indigo-600">${profile.professionalPreference}</p>
                </div>
            </div>
            
            <!-- AI 분석 결과 -->
            ${profile.strengths ? `
            <div class="border-t-2 border-gray-200 pt-6">
                <div class="mb-6">
                    <h5 class="text-lg font-bold text-gray-800 mb-3">
                        <i class="fas fa-thumbs-up mr-2 text-green-600"></i>강점
                    </h5>
                    <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">${profile.strengths}</p>
                </div>
                
                <div class="mb-6">
                    <h5 class="text-lg font-bold text-gray-800 mb-3">
                        <i class="fas fa-chart-line mr-2 text-blue-600"></i>추천 영업 스타일
                    </h5>
                    <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">${profile.recommendedStyle}</p>
                </div>
                
                <div class="mb-6">
                    <h5 class="text-lg font-bold text-gray-800 mb-3">
                        <i class="fas fa-exclamation-triangle mr-2 text-orange-600"></i>주의할 점
                    </h5>
                    <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">${profile.cautions}</p>
                </div>
                
                <div>
                    <h5 class="text-lg font-bold text-gray-800 mb-3">
                        <i class="fas fa-rocket mr-2 text-purple-600"></i>성장 방향
                    </h5>
                    <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">${profile.growthDirection}</p>
                </div>
            </div>
            ` : '<p class="text-gray-500 text-center py-4">상세 분석 결과가 없습니다.</p>'}
        </div>
    `
}

// 설계사 코칭 이력 로드
async function loadPlannerCoachingHistory(userId) {
    try {
        const res = await axios.get('/api/manager/planner-sessions/' + userId)
        currentPlannerSessions = res.data.sessions || []
        displayPlannerCoachingSessions(currentPlannerSessions)
    } catch (error) {
        console.error('코칭 이력 로드 오류:', error)
        document.getElementById('detail-coaching-list').innerHTML = '<p class="text-red-500 text-center py-8">코칭 이력을 불러오는데 실패했습니다.</p>'
    }
}

// 설계사 코칭 세션 표시
function displayPlannerCoachingSessions(sessions) {
    const container = document.getElementById('detail-coaching-list')
    
    if (sessions.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">코칭 이력이 없습니다.</p>'
        return
    }
    
    container.innerHTML = sessions.map(session => `
        <div class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <p class="text-sm text-gray-500 mb-1">${new Date(session.sessionDate).toLocaleString('ko-KR')}</p>
                    <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${session.situationType}</span>
                </div>
                ${session.effectivenessRating ? '<p class="text-sm text-gray-600">평가: <span class="font-bold text-yellow-600">' + '⭐'.repeat(session.effectivenessRating) + '</span></p>' : ''}
            </div>
            
            <div class="mb-4">
                <p class="text-sm font-semibold text-gray-700 mb-2"><i class="fas fa-question-circle mr-2 text-blue-600"></i>질문</p>
                <p class="text-gray-700 bg-blue-50 p-3 rounded">${session.context}</p>
            </div>
            
            <div class="mb-4">
                <p class="text-sm font-semibold text-gray-700 mb-2"><i class="fas fa-comments mr-2 text-green-600"></i>AI 코칭</p>
                <p class="text-gray-700 bg-green-50 p-3 rounded whitespace-pre-wrap">${session.coachingAdvice}</p>
            </div>
            
            ${session.plannerFeedback ? `
            <div>
                <p class="text-sm font-semibold text-gray-700 mb-2"><i class="fas fa-comment-dots mr-2 text-yellow-600"></i>설계사 피드백</p>
                <p class="text-gray-700 bg-yellow-50 p-3 rounded">${session.plannerFeedback}</p>
            </div>
            ` : ''}
        </div>
    `).join('')
}

// 상세 탭 필터 적용
function applyDetailFilters() {
    const situation = document.getElementById('detail-filter-situation').value
    
    let filtered = [...currentPlannerSessions]
    if (situation !== 'all') {
        filtered = filtered.filter(s => s.situationType === situation)
    }
    
    displayPlannerCoachingSessions(filtered)
}

// 매니저 의견 테스트 열기
let managerOpinionAnswers = null

function openManagerOpinionTest() {
    if (!currentPlannerDetail) return
    
    const modal = document.getElementById('managerOpinionTestModal')
    modal.classList.remove('hidden')
    modal.classList.add('flex')
    
    // 기존 답변 초기화
    document.querySelectorAll('input[type="radio"][name^="manager_"]').forEach(input => {
        input.checked = false
    })
}

function closeManagerOpinionTest() {
    const modal = document.getElementById('managerOpinionTestModal')
    modal.classList.add('hidden')
    modal.classList.remove('flex')
}

// 매니저 의견 테스트 제출
function submitManagerOpinionTest() {
    // 모든 질문에 답변했는지 확인
    const energyDirection = document.querySelector('input[name="manager_energyDirection"]:checked')
    const informationProcessing = document.querySelector('input[name="manager_informationProcessing"]:checked')
    const decisionMaking = document.querySelector('input[name="manager_decisionMaking"]:checked')
    const achievementMotivation = document.querySelector('input[name="manager_achievementMotivation"]:checked')
    const stressRecovery = document.querySelector('input[name="manager_stressRecovery"]:checked')
    const professionalPreference = document.querySelector('input[name="manager_professionalPreference"]:checked')
    
    if (!energyDirection || !informationProcessing || !decisionMaking || 
        !achievementMotivation || !stressRecovery || !professionalPreference) {
        alert('모든 질문에 답변해주세요.')
        return
    }
    
    // 답변 저장
    managerOpinionAnswers = {
        energyDirection: energyDirection.value,
        informationProcessing: informationProcessing.value,
        decisionMaking: decisionMaking.value,
        achievementMotivation: achievementMotivation.value,
        stressRecovery: stressRecovery.value,
        professionalPreference: professionalPreference.value
    }
    
    // 모달 닫기
    closeManagerOpinionTest()
    
    // 매니저 의견 표시
    displayManagerOpinionAnswers()
    
    // AI 비교 분석 버튼 활성화
    document.getElementById('start-manager-test-btn').innerHTML = '<i class="fas fa-edit mr-2"></i>매니저 의견 수정'
    document.getElementById('generate-comparison-btn').classList.remove('hidden')
}

// 매니저 의견 답변 표시
function displayManagerOpinionAnswers() {
    if (!managerOpinionAnswers) return
    
    const container = document.getElementById('detail-manager-opinion')
    
    container.innerHTML = `
        <div class="space-y-4">
            <h5 class="text-lg font-bold text-gray-800 mb-4">
                <i class="fas fa-clipboard-check mr-2 text-orange-600"></i>매니저의 평가
            </h5>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-purple-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">에너지 방향</p>
                    <p class="text-lg font-bold text-purple-600">${managerOpinionAnswers.energyDirection}</p>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">정보 인식</p>
                    <p class="text-lg font-bold text-blue-600">${managerOpinionAnswers.informationProcessing}</p>
                </div>
                <div class="bg-green-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">의사 결정</p>
                    <p class="text-lg font-bold text-green-600">${managerOpinionAnswers.decisionMaking}</p>
                </div>
                <div class="bg-orange-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">성취 동기</p>
                    <p class="text-lg font-bold text-orange-600">${managerOpinionAnswers.achievementMotivation}</p>
                </div>
                <div class="bg-pink-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">스트레스 회복</p>
                    <p class="text-lg font-bold text-pink-600">${managerOpinionAnswers.stressRecovery}</p>
                </div>
                <div class="bg-indigo-50 rounded-lg p-4">
                    <p class="text-sm text-gray-600 mb-1">전문성 선호</p>
                    <p class="text-lg font-bold text-indigo-600">${managerOpinionAnswers.professionalPreference}</p>
                </div>
            </div>
            
            <div class="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mt-4">
                <p class="text-sm text-gray-700">
                    <i class="fas fa-lightbulb mr-2 text-yellow-600"></i>
                    <strong>'AI 비교 분석'</strong> 버튼을 클릭하여 설계사의 자가 평가와 비교하고 인식 차이를 분석하세요.
                </p>
            </div>
        </div>
    `
}

// 매니저 의견 비교 분석 (AI)
async function generateManagerOpinionComparison() {
    if (!currentPlannerDetail || !managerOpinionAnswers) return
    
    const btn = document.getElementById('generate-comparison-btn')
    const container = document.getElementById('detail-manager-opinion')
    
    btn.disabled = true
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>분석 중...'
    
    container.innerHTML = '<p class="text-gray-500 text-center py-12"><i class="fas fa-spinner fa-spin text-5xl text-blue-400 mb-4"></i><br>AI가 설계사와 매니저의 인식 차이를 비교 분석하고 있습니다...</p>'
    
    try {
        const { user, profile } = currentPlannerDetail
        
        const res = await axios.post('/api/manager/generate-opinion-comparison', {
            plannerId: user.id,
            plannerName: user.name,
            // 설계사 자가 평가
            plannerEvaluation: {
                energyDirection: profile.energyDirection,
                informationProcessing: profile.informationProcessing,
                decisionMaking: profile.decisionMaking,
                achievementMotivation: profile.achievementMotivation,
                stressRecovery: profile.stressRecovery,
                professionalPreference: profile.professionalPreference
            },
            // 매니저 평가
            managerEvaluation: managerOpinionAnswers
        })
        
        const analysis = res.data.analysis
        
        // 비교 결과 표시
        displayComparisonResult(analysis)
    } catch (error) {
        console.error('매니저 의견 비교 분석 오류:', error)
        container.innerHTML = '<p class="text-red-500 text-center py-8">비교 분석에 실패했습니다.</p>'
    } finally {
        btn.disabled = false
        btn.innerHTML = '<i class="fas fa-wand-magic-sparkles mr-2"></i>AI 비교 분석'
    }
}

// 비교 결과 표시
function displayComparisonResult(analysis) {
    if (!currentPlannerDetail || !managerOpinionAnswers) return
    
    const { profile } = currentPlannerDetail
    const container = document.getElementById('detail-manager-opinion')
    
    // 각 항목별 일치 여부 확인
    const dimensions = [
        { key: 'energyDirection', label: '에너지 방향', color: 'purple' },
        { key: 'informationProcessing', label: '정보 인식', color: 'blue' },
        { key: 'decisionMaking', label: '의사 결정', color: 'green' },
        { key: 'achievementMotivation', label: '성취 동기', color: 'orange' },
        { key: 'stressRecovery', label: '스트레스 회복', color: 'pink' },
        { key: 'professionalPreference', label: '전문성 선호', color: 'indigo' }
    ]
    
    let comparisonTableHTML = '<div class="overflow-x-auto"><table class="w-full border-collapse">'
    comparisonTableHTML += '<thead><tr class="bg-gray-100">'
    comparisonTableHTML += '<th class="border border-gray-300 px-4 py-3 text-left font-bold">차원</th>'
    comparisonTableHTML += '<th class="border border-gray-300 px-4 py-3 text-center font-bold">설계사 평가</th>'
    comparisonTableHTML += '<th class="border border-gray-300 px-4 py-3 text-center font-bold">매니저 평가</th>'
    comparisonTableHTML += '<th class="border border-gray-300 px-4 py-3 text-center font-bold">일치도</th>'
    comparisonTableHTML += '</tr></thead><tbody>'
    
    dimensions.forEach(dim => {
        const plannerValue = profile[dim.key] || '-'
        const managerValue = managerOpinionAnswers[dim.key] || '-'
        const isMatch = plannerValue === managerValue
        
        comparisonTableHTML += '<tr class="hover:bg-gray-50">'
        comparisonTableHTML += '<td class="border border-gray-300 px-4 py-3 font-semibold">' + dim.label + '</td>'
        comparisonTableHTML += '<td class="border border-gray-300 px-4 py-3 text-center bg-blue-50">' + plannerValue + '</td>'
        comparisonTableHTML += '<td class="border border-gray-300 px-4 py-3 text-center bg-orange-50">' + managerValue + '</td>'
        comparisonTableHTML += '<td class="border border-gray-300 px-4 py-3 text-center">'
        
        if (isMatch) {
            comparisonTableHTML += '<span class="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">'
            comparisonTableHTML += '<i class="fas fa-check-circle mr-2"></i>일치'
            comparisonTableHTML += '</span>'
        } else {
            comparisonTableHTML += '<span class="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 font-semibold">'
            comparisonTableHTML += '<i class="fas fa-times-circle mr-2"></i>불일치'
            comparisonTableHTML += '</span>'
        }
        
        comparisonTableHTML += '</td></tr>'
    })
    
    comparisonTableHTML += '</tbody></table></div>'
    
    // AI 분석 멘트 포맷팅
    const lines = analysis.split('\n')
    const formattedHTML = lines.map(line => {
        if (line.trim() === '') return '<br>'
        if (line.trim() === '---') return '<hr class="my-4 border-gray-300">'
        if (/^[💼📊🎯📝🔍⚠️💪🌟🔎⚡]/.test(line.trim())) {
            return '<p class="font-bold text-lg mt-4 mb-2 text-orange-700">' + line + '</p>'
        }
        if (/^\d+\./.test(line.trim())) {
            return '<p class="ml-4 mb-2 text-gray-800">' + line + '</p>'
        }
        return '<p class="mb-2 text-gray-700 leading-relaxed">' + line + '</p>'
    }).join('')
    
    container.innerHTML = `
        <div class="space-y-6">
            <h5 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-balance-scale mr-2 text-orange-600"></i>설계사 vs 매니저 평가 비교
            </h5>
            
            ${comparisonTableHTML}
            
            <div class="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl p-6 mt-6">
                <h5 class="text-lg font-bold text-gray-800 mb-4">
                    <i class="fas fa-lightbulb mr-2 text-orange-600"></i>AI 차이 분석 및 관리 포인트
                </h5>
                <div class="space-y-2">
                    ${formattedHTML}
                </div>
            </div>
        </div>
    `
}

// 상세 탭 전환
function switchDetailTab(tab) {
    // 탭 버튼 스타일 변경
    document.querySelectorAll('[id^="detail-tab-"]').forEach(btn => {
        btn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600')
        btn.classList.add('text-gray-500')
    })
    document.getElementById('detail-tab-' + tab).classList.remove('text-gray-500')
    document.getElementById('detail-tab-' + tab).classList.add('text-blue-600', 'border-b-2', 'border-blue-600')
    
    // 탭 콘텐츠 표시/숨김
    document.querySelectorAll('.detail-tab-content').forEach(content => {
        content.classList.add('hidden')
    })
    document.getElementById('detail-content-' + tab).classList.remove('hidden')
}

// 모달 닫기
function closePlannerDetailModal() {
    document.getElementById('plannerDetailModal').classList.add('hidden')
    document.getElementById('plannerDetailModal').classList.remove('flex')
    currentPlannerDetail = null
    currentPlannerSessions = []
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
        const lines = session.managerAIAdvice.split('\n')
        const formattedHTML = lines.map(line => {
            if (line.trim() === '') return '<br>'
            if (line.trim() === '---') return '<hr class="my-4 border-gray-300">'
            // 이모지로 시작하는 섹션 헤더는 굵게
            if (/^[💪📊🎯📚🗣️📝🤝⭐]/.test(line.trim())) {
                return '<p class="font-bold text-lg mt-4 mb-2 text-orange-700">' + line + '</p>'
            }
            // 숫자로 시작하는 리스트 항목
            if (/^\d+\./.test(line.trim())) {
                return '<p class="ml-4 mb-2 text-gray-800">' + line + '</p>'
            }
            return '<p class="mb-2 text-gray-800">' + line + '</p>'
        }).join('')
        aiAdviceEl.innerHTML = '<div class="space-y-1">' + formattedHTML + '</div>'
    } else {
        aiAdviceEl.innerHTML = '<p class="text-gray-500 italic text-center py-12"><i class="fas fa-lightbulb text-5xl text-orange-400 mb-6 block"></i><span class="text-lg">👆 <span class="font-bold">\'AI 분석 시작\'</span> 버튼을 클릭하면,<br><br>이 코칭 케이스에서 Manager가 추가로 수행해야 할 역할을<br><span class="text-orange-600 font-bold text-xl">자존감 향상</span>과 <span class="text-orange-600 font-bold text-xl">구체적 실행</span> 중심으로<br>AI가 분석해드립니다.</span></p>'
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
        const lines = advice.split('\n')
        const formattedHTML = lines.map(line => {
            if (line.trim() === '') return '<br>'
            if (line.trim() === '---') return '<hr class="my-4 border-gray-300">'
            // 이모지로 시작하는 섹션 헤더는 굵게
            if (/^[💪📊🎯📚🗣️📝🤝⭐]/.test(line.trim())) {
                return '<p class="font-bold text-lg mt-4 mb-2 text-orange-700">' + line + '</p>'
            }
            // 숫자로 시작하는 리스트 항목
            if (/^\d+\./.test(line.trim())) {
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
    document.getElementById('tab-' + tab).classList.remove('text-gray-500')
    document.getElementById('tab-' + tab).classList.add('text-blue-600', 'border-b-2', 'border-blue-600')
    document.getElementById('content-' + tab).classList.remove('hidden')
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
    
    container.innerHTML = notifications.map(n => `
        <div class="p-4 hover:bg-gray-50 cursor-pointer transition" onclick="handleNotificationClick(${n.id}, ${n.session_id})">
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-bell text-blue-600"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800 text-sm">${n.title}</h4>
                    <p class="text-gray-600 text-xs mt-1">${n.message}</p>
                    <p class="text-gray-400 text-xs mt-2">${new Date(n.created_at).toLocaleString('ko-KR')}</p>
                </div>
            </div>
        </div>
    `).join('')
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
window.closePlannerDetailModal = closePlannerDetailModal
window.switchDetailTab = switchDetailTab
window.applyDetailFilters = applyDetailFilters
window.openManagerOpinionTest = openManagerOpinionTest
window.closeManagerOpinionTest = closeManagerOpinionTest
window.submitManagerOpinionTest = submitManagerOpinionTest
window.generateManagerOpinionComparison = generateManagerOpinionComparison
window.openManagerPersonalityTest = openManagerPersonalityTest
window.closeManagerPersonalityTest = closeManagerPersonalityTest
window.submitManagerPersonalityTest = submitManagerPersonalityTest
window.viewManagerPersonalityReport = viewManagerPersonalityReport
window.closeManagerPersonalityReport = closeManagerPersonalityReport
window.openManagerAnalysis = openManagerAnalysis
window.toggleNotifications = toggleNotifications
window.handleNotificationClick = handleNotificationClick
window.markAllAsRead = markAllAsRead

// 매니저 성향 분석 관련 함수
function openManagerPersonalityTest() {
    document.getElementById('managerPersonalityTestModal').classList.remove('hidden')
    document.getElementById('managerPersonalityTestModal').classList.add('flex')
}

function closeManagerPersonalityTest() {
    document.getElementById('managerPersonalityTestModal').classList.add('hidden')
    document.getElementById('managerPersonalityTestModal').classList.remove('flex')
}

function submitManagerPersonalityTest() {
    alert('매니저 성향 분석 질문지는 현재 준비 중입니다. 디렉터가 질문 항목을 설정하면 사용 가능합니다.')
}

function viewManagerPersonalityReport() {
    document.getElementById('managerPersonalityReportModal').classList.remove('hidden')
    document.getElementById('managerPersonalityReportModal').classList.add('flex')
    
    // TODO: 매니저 성향 분석 결과 로드
    document.getElementById('managerPersonalityReportContent').innerHTML = `
        <div class="text-center py-12">
            <i class="fas fa-hourglass-half text-5xl text-gray-400 mb-4"></i>
            <p class="text-gray-600 text-lg">매니저 성향 분석 결과가 아직 없습니다.</p>
            <p class="text-gray-500 text-sm mt-2">성향 테스트를 완료하면 여기에 표시됩니다.</p>
        </div>
    `
}

function closeManagerPersonalityReport() {
    document.getElementById('managerPersonalityReportModal').classList.add('hidden')
    document.getElementById('managerPersonalityReportModal').classList.remove('flex')
}

// 자동 새로고침 (30초마다)
let autoRefreshInterval = null

function startAutoRefresh() {
    autoRefreshInterval = setInterval(async () => {
        console.log('[Manager] 자동 새로고침 중...')
        await loadOverview()
        await loadSessions()
        await loadPlanners()
        await loadNotifications() // 알림도 함께 새로고침
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
