// 설계사 대시보드 JavaScript
console.log('[DEBUG] localStorage user:', localStorage.getItem('user'))
const user = JSON.parse(localStorage.getItem('user') || '{}')
console.log('[DEBUG] Parsed user:', user)

if (!user.id || user.role !== 'planner') {
    console.warn('[DEBUG] Not logged in or not a planner, redirecting...')
    window.location.href = '/'
}

document.getElementById('userName').textContent = user.name || '사용자'
console.log('[DEBUG] Page initialized for:', user.name)

async function loadProfile() {
    console.log('[DEBUG] Loading profile for user ID:', user.id)
    try {
        const res = await axios.get('/api/planner/' + user.id)
        console.log('[DEBUG] Profile API response:', res.data)
        const { profile } = res.data
        
        console.log('[DEBUG] Profile data:', profile)
        console.log('[DEBUG] experienceYears:', profile.experienceYears)
        console.log('[DEBUG] salesStyle:', profile.salesStyle)
        console.log('[DEBUG] specialization:', profile.specialization)
        
        // 기본 프로필 정보 업데이트 (상단 카드)
        const experienceEl = document.getElementById('profileExperienceYears')
        const salesStyleEl = document.getElementById('profileSalesStyle')
        const specializationEl = document.getElementById('profileSpecialization')
        const personalityEl = document.getElementById('profilePersonalityType')
        const strengthsEl = document.getElementById('profileStrengths')
        const weaknessesEl = document.getElementById('profileWeaknesses')
        
        console.log('[DEBUG] Elements found:', {
            experienceEl: !!experienceEl,
            salesStyleEl: !!salesStyleEl,
            specializationEl: !!specializationEl,
            personalityEl: !!personalityEl,
            strengthsEl: !!strengthsEl,
            weaknessesEl: !!weaknessesEl
        })
        
        if (experienceEl) experienceEl.textContent = profile.experienceYears ? profile.experienceYears + '년' : '-'
        if (salesStyleEl) salesStyleEl.textContent = profile.salesStyle || '-'
        if (specializationEl) specializationEl.textContent = profile.specialization || '-'
        if (personalityEl) personalityEl.textContent = profile.personalityType || '미분석'
        if (strengthsEl) strengthsEl.textContent = profile.strengths || '-'
        if (weaknessesEl) weaknessesEl.textContent = profile.weaknesses || '-'
        
        console.log('[DEBUG] Profile info updated')
        
        // 성향 정보 업데이트 (실제 분석 완료된 경우만)
        if (profile.personalityType && profile.personalityType !== '미분석' && profile.energyDirection) {
            const statusElement = document.getElementById('personalityStatus')
            const reportElement = document.getElementById('personalityReport')
            
            if (statusElement) {
                statusElement.textContent = '성향 분석 완료 ✓'
            }
            if (reportElement) {
                reportElement.classList.remove('hidden')
            }
            
            // 성향 데이터를 전역 변수에 저장
            window.personalityReportData = {
                personalityType: profile.personalityType,
                energyDirection: profile.energyDirection,
                informationProcessing: profile.informationProcessing,
                decisionMaking: profile.decisionMaking,
                achievementMotivation: profile.achievementMotivation,
                stressRecovery: profile.stressRecovery,
                professionalPreference: profile.professionalPreference,
                strengths: profile.strengths,
                recommendedStyle: profile.recommendedStyle,
                cautions: profile.cautions,
                growthDirection: profile.growthDirection
            }
            console.log('[DEBUG] Personality data saved to window.personalityReportData')
        }
        
        // 경력 정보 업데이트
        // 경력 연수 자동 계산
        let experienceText = '-'
        if (profile.careerStartYear) {
            const currentYear = new Date().getFullYear()
            const experienceYears = currentYear - parseInt(profile.careerStartYear) + 1
            experienceText = experienceYears + '년 (' + profile.careerStartYear + '년 시작)'
        }
        document.getElementById('careerStartYear').textContent = experienceText
        document.getElementById('firstOrganization').textContent = profile.firstOrganization || '-'
        document.getElementById('careerPath').textContent = profile.careerPath || '-'
        
        // 전문 분야 자동 판단 및 상품 비중 표시
        if (profile.productRatio) {
            const ratioMatch = profile.productRatio.match(/생보 (\d+)% \/ 손보 (\d+)%/)
            if (ratioMatch) {
                const lifeRatio = parseInt(ratioMatch[1])
                const nonLifeRatio = parseInt(ratioMatch[2])
                
                document.getElementById('productRatioLife').textContent = lifeRatio + '%'
                document.getElementById('productRatioNonLife').textContent = nonLifeRatio + '%'
                
                // 전문 분야 판단 로직 (매니저 대시보드와 동일)
                let specializationText = ''
                if (lifeRatio >= 70) {
                    specializationText = '생명보험 전문 (생보 ' + lifeRatio + '%)'
                } else if (nonLifeRatio >= 70) {
                    specializationText = '손해보험 전문 (손보 ' + nonLifeRatio + '%)'
                } else if (Math.abs(lifeRatio - nonLifeRatio) <= 20) {
                    specializationText = '통합형 (생보 ' + lifeRatio + '% / 손보 ' + nonLifeRatio + '%)'
                } else {
                    // 기타 경우 (21%~69% 차이)
                    if (lifeRatio > nonLifeRatio) {
                        specializationText = '생보 우위형 (생보 ' + lifeRatio + '% / 손보 ' + nonLifeRatio + '%)'
                    } else {
                        specializationText = '손보 우위형 (생보 ' + lifeRatio + '% / 손보 ' + nonLifeRatio + '%)'
                    }
                }
                
                // 전문 분야를 별도 영역에 표시 (현재는 상품 비중 영역에 추가)
                console.log('[DEBUG] Specialization:', specializationText)
                // Note: HTML에 전문 분야 표시 영역이 없으므로 콘솔에만 로그
                // 필요시 HTML 수정하여 표시 영역 추가 가능
            }
        } else {
            document.getElementById('productRatioLife').textContent = '-'
            document.getElementById('productRatioNonLife').textContent = '-'
        }
        
        // 개인정보 업데이트
        const currentYear = new Date().getFullYear()
        const age = profile.birthYear ? (currentYear - profile.birthYear + 1) + '세 (' + profile.birthYear + '년생)' : '-'
        document.getElementById('birthYear').textContent = age
        document.getElementById('gender').textContent = profile.gender || '-'
        document.getElementById('maritalStatus').textContent = profile.maritalStatus || '-'
        
        console.log('[DEBUG] Profile loaded successfully')
    } catch (error) { 
        console.error('[DEBUG] Profile load error:', error)
        alert('프로필 로드 실패: ' + error.message)
    }
}

// HTML 이스케이프 함수
function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

async function loadSessions() {
    console.log('[DEBUG] Loading sessions for user ID:', user.id)
    try {
        const res = await axios.get('/api/coaching-sessions/' + user.id)
        console.log('[DEBUG] Sessions API Response:', res.data)
        const sessions = res.data.sessions || []
        console.log('[DEBUG] Sessions count:', sessions.length)
        
        // 세션 목록 렌더링
        const sessionsList = document.getElementById('sessionsList')
        sessionsList.innerHTML = ''
        
        if (sessions.length === 0) {
            sessionsList.innerHTML = '<p class="text-gray-500">아직 코칭 세션이 없습니다.</p>'
            return
        }
        
        // 유형별로 그룹화
        const groupedSessions = {}
        sessions.forEach(s => {
            if (!groupedSessions[s.situationType]) {
                groupedSessions[s.situationType] = []
            }
            groupedSessions[s.situationType].push(s)
        })
        
        // 유형별 색상 매핑
        const typeColors = {
            '신규고객': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-500' },
            '기존고객': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500' },
            '계약전환': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
            '민원처리': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' },
            '팀관리': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500' }
        }
        
        // 유형별로 수평 렌더링
        Object.keys(groupedSessions).forEach(type => {
            const typeSection = document.createElement('div')
            typeSection.className = 'mb-6'
            
            const color = typeColors[type] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500' }
            
            typeSection.innerHTML = `
                <h3 class="text-lg font-bold mb-3 ${color.text} flex items-center">
                    <i class="fas fa-folder-open mr-2"></i>${type} (${groupedSessions[type].length})
                </h3>
                <div class="flex overflow-x-auto gap-4 pb-3" style="scroll-behavior: smooth;">
                    ${groupedSessions[type].map(s => {
                        const contextText = escapeHtml(s.context.substring(0, 80) + (s.context.length > 80 ? '...' : ''))
                        const ratingHTML = s.effectivenessRating 
                            ? `<div class="flex items-center text-yellow-500 text-sm">${'⭐'.repeat(s.effectivenessRating)}</div>`
                            : '<span class="text-gray-400 text-xs">피드백 대기 중</span>'
                        
                        return `
                            <div class="flex-shrink-0 w-72 border ${color.border} ${color.bg} rounded-lg p-4 hover:shadow-lg cursor-pointer transition" onclick="viewSession(${s.id})">
                                <div class="flex justify-between items-start mb-2">
                                    <span class="${color.bg} ${color.text} px-2 py-1 rounded-full text-xs font-semibold">${escapeHtml(s.situationType)}</span>
                                    <span class="text-xs text-gray-600">${new Date(s.sessionDate).toLocaleDateString('ko-KR')}</span>
                                </div>
                                <p class="text-gray-700 text-sm font-medium mb-3 line-clamp-3">${contextText}</p>
                                <div class="mt-2">
                                    ${ratingHTML}
                                </div>
                            </div>
                        `
                    }).join('')}
                </div>
            `
            
            sessionsList.appendChild(typeSection)
        })
        
        console.log('[DEBUG] Sessions rendered successfully')
    } catch (error) { 
        console.error('[DEBUG] Sessions load error:', error)
        const sessionsList = document.getElementById('sessionsList')
        if (sessionsList) {
            sessionsList.innerHTML = '<p class="text-red-500">세션을 불러오는 중 오류가 발생했습니다.</p>'
        }
    }
}

document.getElementById('coachingForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const context = document.getElementById('context').value
    const situationType = document.getElementById('situationType').value
    const submitBtn = document.getElementById('submitBtn')
    const loading = document.getElementById('loading')
    
    submitBtn.disabled = true
    loading.classList.remove('hidden')
    
    try {
        const res = await axios.post('/api/coaching-sessions', {
            plannerId: user.id,
            context,
            situationType
        }, {
            timeout: 180000 // 180초 (3분) 타임아웃 - Gemini API 응답 대기
        })
        
        if (res.data.success) {
            alert('AI 코칭이 완료되었습니다!')
            document.getElementById('context').value = ''
            document.getElementById('situationType').value = '신규고객'
            
            // 먼저 세션 목록을 새로고침
            await loadSessions()
            
            // API 재호출 없이 받은 데이터로 바로 표시
            viewSessionWithData(res.data.session)
        } else {
            throw new Error('코칭 세션 생성 실패')
        }
    } catch (error) {
        alert('오류가 발생했습니다: ' + (error.response?.data?.error || error.message))
    } finally {
        submitBtn.disabled = false
        loading.classList.add('hidden')
    }
})

// 세션 데이터로 직접 모달 표시 (API 재호출 없음)
function viewSessionWithData(session) {
    if (!session) return
    
    console.log('[viewSessionWithData] 받은 세션 데이터:', {
        id: session.id,
        hasCoachingEvidence: !!session.coachingEvidence,
        hasDialogue: !!session.dialogue,
        hasLearningNeeds: !!session.learningNeeds
    })
    
    // 안전하게 데이터 준비
    const safeData = {
        analyzedQuestion: session.analyzedQuestion || session.context,
        category: session.category || session.situationType,
        keyPoints: session.keyPoints || session.aiAnalysis,
        coachingPoint: session.coachingPoint || session.coachingAdvice,
        coachingEvidence: session.coachingEvidence || '근거 분석 중...',
        dialogue: session.dialogue || session.dialogueScript || '대화 스크립트 생성 중...',
        learningNeeds: session.learningNeeds || session.requiredKnowledge || '추가 학습 없음',
        actionGuidelines: session.actionGuidelines || session.recommendedApproach,
        tacitKnowledge: session.tacitKnowledgeApplied || '[내부 참조용 - 30년 노하우 기반 코칭]'
    }
    
    // displaySessionModal 함수 호출
    displaySessionModal(session, safeData)
}

// 세션 ID로 API 재호출하여 모달 표시 (히스토리 클릭 시 사용)
function viewSession(id) {
    axios.get("/api/coaching-sessions/" + user.id).then(res => {
        const session = res.data.sessions.find(s => s.id === id)
        if (!session) return
        
        // 디버그 로그
        console.log('[viewSession] API로 가져온 세션 데이터:', {
            id: session.id,
            hasCoachingEvidence: !!session.coachingEvidence,
            hasDialogue: !!session.dialogue,
            hasLearningNeeds: !!session.learningNeeds,
            coachingEvidenceLength: session.coachingEvidence?.length,
            dialogueLength: session.dialogue?.length,
            learningNeedsLength: session.learningNeeds?.length
        })
        
        // 안전하게 데이터 준비
        const safeData = {
            analyzedQuestion: session.analyzedQuestion || session.context,
            category: session.category || session.situationType,
            keyPoints: session.keyPoints || session.aiAnalysis,
            coachingPoint: session.coachingPoint || session.coachingAdvice,
            coachingEvidence: session.coachingEvidence || '근거 분석 중...',
            dialogue: session.dialogue || session.dialogueScript || '대화 스크립트 생성 중...',
            learningNeeds: session.learningNeeds || session.requiredKnowledge || '추가 학습 없음',
            actionGuidelines: session.actionGuidelines || session.recommendedApproach,
            tacitKnowledge: session.tacitKnowledgeApplied || '[내부 참조용 - 30년 노하우 기반 코칭]'
        }
        
        // displaySessionModal 함수 호출
        displaySessionModal(session, safeData)
    })
}

// 공통 모달 표시 함수
function displaySessionModal(session, safeData) {
        // DOM 요소 생성 및 데이터 안전하게 삽입
        const detailContainer = document.getElementById('sessionDetail')
        detailContainer.innerHTML = `
            <div class="space-y-6">
                <!-- ===== 1. AI 분석 ===== -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                    <h4 class="font-bold text-blue-900 mb-4 text-xl">
                        <i class="fas fa-brain mr-2"></i>1️⃣ AI 분석
                    </h4>
                    <div class="space-y-4">
                        <!-- 파악된 질문 -->
                        <div class="bg-white p-4 rounded-lg shadow-sm">
                            <h5 class="font-semibold text-blue-800 mb-2 flex items-center">
                                <i class="fas fa-question-circle mr-2"></i>파악된 질문 (질문의 요지)
                            </h5>
                            <p class="text-gray-800 ml-6" id="analyzed-question"></p>
                        </div>
                        
                        <!-- 카테고리 -->
                        <div class="bg-white p-4 rounded-lg shadow-sm">
                            <h5 class="font-semibold text-blue-800 mb-2 flex items-center">
                                <i class="fas fa-tag mr-2"></i>카테고리
                            </h5>
                            <span class="ml-6 inline-block bg-blue-600 text-white px-4 py-2 rounded-full font-semibold" id="category"></span>
                        </div>
                        
                        <!-- 핵심 포인트 -->
                        <div class="bg-white p-4 rounded-lg shadow-sm">
                            <h5 class="font-semibold text-blue-800 mb-2 flex items-center">
                                <i class="fas fa-bullseye mr-2"></i>핵심 포인트
                            </h5>
                            <div class="ml-6 text-gray-800 whitespace-pre-wrap" id="key-points"></div>
                        </div>
                    </div>
                </div>
                
                <!-- ===== 2. 코칭 ===== -->
                <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                    <h4 class="font-bold text-purple-900 mb-4 text-xl">
                        <i class="fas fa-chalkboard-teacher mr-2"></i>2️⃣ 코칭
                    </h4>
                    <div class="space-y-4">
                        <!-- 코칭 포인트 -->
                        <div class="bg-white p-4 rounded-lg shadow-sm">
                            <h5 class="font-semibold text-purple-800 mb-2 flex items-center">
                                <i class="fas fa-lightbulb mr-2"></i>코칭 포인트 (카테고리별 핵심)
                            </h5>
                            <div class="ml-6 text-gray-800 whitespace-pre-wrap" id="coaching-point"></div>
                        </div>
                        
                        <!-- 코칭 근거 -->
                        <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                            <h5 class="font-semibold text-purple-800 mb-2 flex items-center">
                                <i class="fas fa-file-contract mr-2"></i>코칭 근거 (약관/법률/인문학적 근거)
                            </h5>
                            <div class="ml-6 text-gray-800 whitespace-pre-wrap" id="coaching-evidence"></div>
                        </div>
                        
                        <!-- 화법 (4~5번 대화) -->
                        <div class="bg-white p-4 rounded-lg shadow-sm">
                            <h5 class="font-semibold text-purple-800 mb-2 flex items-center">
                                <i class="fas fa-comments mr-2"></i>화법 (고객과의 대화 시나리오)
                            </h5>
                            <div class="ml-6 bg-gray-50 p-4 rounded border border-purple-200">
                                <pre class="whitespace-pre-wrap font-sans text-sm text-gray-800" id="dialogue"></pre>
                            </div>
                        </div>
                        
                        <!-- 학습 필요 내용 -->
                        <div class="bg-white p-4 rounded-lg shadow-sm">
                            <h5 class="font-semibold text-purple-800 mb-2 flex items-center">
                                <i class="fas fa-book-reader mr-2"></i>학습 필요 내용
                            </h5>
                            <div class="ml-6 text-gray-800 whitespace-pre-wrap" id="learning-needs"></div>
                        </div>
                        
                        <!-- 구체적인 행동지침 -->
                        <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                            <h5 class="font-semibold text-purple-800 mb-2 flex items-center">
                                <i class="fas fa-tasks mr-2"></i>구체적인 행동지침 (다양한 시도 방법)
                            </h5>
                            <div class="ml-6 text-gray-800 whitespace-pre-wrap" id="action-guidelines"></div>
                        </div>
                    </div>
                </div>
                
                <!-- ===== 참조 자료 (근거) ===== -->
                ${session.references && session.references.length > 0 ? `
                <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-300">
                    <h4 class="font-bold text-yellow-900 mb-4 text-xl">
                        <i class="fas fa-link mr-2"></i>참조 자료 (근거)
                    </h4>
                    <div class="space-y-3">
                        ${session.references.map((ref, idx) => `
                            <div class="bg-white p-4 rounded-lg shadow-sm">
                                <h5 class="font-semibold text-yellow-800 mb-2">
                                    <i class="fas fa-file-alt mr-2"></i>[${idx + 1}] ${ref.source}
                                </h5>
                                <p class="text-gray-700 ml-6 mb-2">${ref.content}</p>
                                ${ref.url ? `<a href="${ref.url}" target="_blank" class="ml-6 text-blue-600 hover:underline text-sm">
                                    <i class="fas fa-external-link-alt mr-1"></i>출처 링크
                                </a>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- 30년 노하우 -->
                <div class="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border-2 border-amber-300 border-l-8">
                    <h4 class="font-bold text-amber-900 mb-3 text-xl">
                        <i class="fas fa-medal mr-2"></i>30년 현장 노하우
                    </h4>
                    <p class="text-gray-800 italic" id="tacit-knowledge"></p>
                </div>
                
                <!-- ===== 대화창 (추가 질문) ===== -->
                <div class="bg-white p-6 rounded-xl border-2 border-purple-200">
                    <h4 class="font-bold text-purple-900 mb-4 text-xl flex items-center">
                        <i class="fas fa-comment-dots mr-2"></i>추가 질문하기
                        <span class="ml-2 text-sm text-gray-500 font-normal">(궁금한 점을 자유롭게 물어보세요)</span>
                    </h4>
                    
                    <!-- 대화 메시지 목록 -->
                    <div id="conversationMessages-${session.id}" class="mb-4 space-y-3 min-h-[200px] max-h-[1200px] overflow-y-auto bg-gray-50 p-4 rounded-lg">
                        ${session.conversationMessages && session.conversationMessages.length > 0 ? 
                            session.conversationMessages.map(msg => `
                                <div class="${msg.sender === 'planner' ? 'text-right' : 'text-left'}">
                                    <div class="inline-block max-w-[80%] p-3 rounded-lg ${msg.sender === 'planner' ? 'bg-purple-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}">
                                        <p class="text-sm">${msg.message}</p>
                                        <p class="text-xs mt-1 opacity-70">${new Date(msg.timestamp).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</p>
                                    </div>
                                </div>
                            `).join('') 
                        : '<p class="text-gray-500 text-center py-4">아직 추가 질문이 없습니다. 궁금한 점을 물어보세요!</p>'}
                    </div>
                    
                    <!-- 메시지 입력 폼 -->
                    <form id="conversationForm-${session.id}" class="flex gap-2" onsubmit="sendMessage(event, ${session.id})">
                        <input type="text" id="messageInput-${session.id}" 
                            placeholder="추가로 궁금한 점을 입력하세요..." 
                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            required>
                        <button type="submit" class="gradient-bg text-white px-6 py-2 rounded-lg hover:opacity-90 flex items-center gap-2">
                            <i class="fas fa-paper-plane"></i>
                            전송
                        </button>
                    </form>
                </div>
                
                <!-- ===== 효과성 평가 (항상 표시) ===== -->
                <div class="bg-white p-4 rounded-lg border-2 border-gray-200">
                    <h4 class="font-bold text-gray-800 mb-2">
                        <i class="fas fa-star text-yellow-500 mr-2"></i>코칭 효과성 평가
                    </h4>
                    
                    ${session.effectivenessRating ? `
                        <div class="bg-green-50 p-3 rounded-lg border border-green-200 mb-3">
                            <p class="text-sm text-green-800 mb-1">✅ 평가 완료 (아래에서 수정 가능)</p>
                            <div class="flex items-center text-yellow-500 mb-1">
                                ${'<i class="fas fa-star"></i>'.repeat(session.effectivenessRating)}
                            </div>
                            ${session.plannerFeedback ? `<p class="text-sm text-gray-700 mt-1">"${session.plannerFeedback}"</p>` : ''}
                        </div>
                    ` : ''}
                    
                    <form id="feedbackForm" class="space-y-3">
                        <div>
                            <label class="block text-sm font-semibold mb-1">효과성 평가</label>
                            <select id="rating" class="w-full px-3 py-2 border rounded-lg" required>
                                <option value="5" ${session.effectivenessRating === 5 ? 'selected' : ''}>⭐⭐⭐⭐⭐ 매우 도움됨</option>
                                <option value="4" ${session.effectivenessRating === 4 ? 'selected' : ''}>⭐⭐⭐⭐ 도움됨</option>
                                <option value="3" ${session.effectivenessRating === 3 ? 'selected' : ''}>⭐⭐⭐ 보통</option>
                                <option value="2" ${session.effectivenessRating === 2 ? 'selected' : ''}>⭐⭐ 별로</option>
                                <option value="1" ${session.effectivenessRating === 1 ? 'selected' : ''}>⭐ 도움 안됨</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-1">후기 (선택)</label>
                            <textarea id="feedback" rows="2" class="w-full px-3 py-2 border rounded-lg" 
                                placeholder="코칭이 도움이 되었는지, 개선할 점이 있다면 알려주세요.">${session.plannerFeedback || ''}</textarea>
                        </div>
                        <button type="submit" class="gradient-bg text-white px-4 py-2 rounded-lg hover:opacity-90" id="submitFeedbackBtn">
                            <i class="fas fa-check mr-2"></i>${session.effectivenessRating ? '평가 수정' : '평가 제출'}
                        </button>
                    </form>
                </div>
            </div>
        `
        
        // 데이터를 안전하게 textContent로 삽입
        const setTextContent = (id, text) => {
            const element = document.getElementById(id)
            if (element) {
                element.textContent = text
            } else {
                console.warn("Element not found: " + id)
            }
        }
        
        // DOM이 완전히 렌더링될 때까지 약간 대기
        setTimeout(() => {
            setTextContent('analyzed-question', safeData.analyzedQuestion)
            setTextContent('category', safeData.category)
            setTextContent('key-points', safeData.keyPoints)
            setTextContent('coaching-point', safeData.coachingPoint)
            setTextContent('coaching-evidence', safeData.coachingEvidence)
            setTextContent('dialogue', safeData.dialogue)
            setTextContent('learning-needs', safeData.learningNeeds)
            setTextContent('action-guidelines', safeData.actionGuidelines)
            setTextContent('tacit-knowledge', safeData.tacitKnowledge)
            
            console.log('✅ Data inserted successfully:', {
                analyzedQuestion: safeData.analyzedQuestion?.substring(0, 50),
                category: safeData.category,
                coachingEvidence: safeData.coachingEvidence?.substring(0, 100),
                dialogue: safeData.dialogue?.substring(0, 100),
                learningNeeds: safeData.learningNeeds
            })
        }, 100)
        
        // 피드백 폼 이벤트 리스너 (항상 등록, 중복 방지 개선)
        setTimeout(() => {
            const form = document.getElementById('feedbackForm')
            if (form && !form.dataset.listenerAdded) {
                // 중복 등록 방지 플래그
                form.dataset.listenerAdded = 'true'
                
                form.addEventListener('submit', async (e) => {
                    e.preventDefault()
                    
                    const submitBtn = document.getElementById('submitFeedbackBtn')
                    
                    // 중복 제출 방지
                    if (submitBtn.disabled) {
                        console.log('[Feedback] 이미 제출 중입니다.')
                        return
                    }
                    
                    submitBtn.disabled = true
                    const originalText = submitBtn.innerHTML
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>제출 중...'
                    
                    const rating = parseInt(document.getElementById('rating').value)
                    const feedback = document.getElementById('feedback').value.trim()
                    const sessionId = session.id  // 명시적으로 session.id 사용
                    
                    console.log("[Feedback] 평가 제출 시작: 세션 " + sessionId + ", 평점 " + rating + "점")
                    
                    try {
                        const response = await axios.post("/api/coaching-sessions/" + sessionId + "/feedback", {
                            effectivenessRating: rating,
                            feedback
                        })
                        
                        console.log('[Feedback] 평가 제출 성공:', response.data)
                        alert('피드백이 성공적으로 등록되었습니다! ✅')
                        closeModal()
                        await loadSessions()
                    } catch (error) {
                        console.error('[Feedback] 평가 제출 오류:', error)
                        console.error('[Feedback] 오류 상세:', error.response?.data || error.message)
                        alert(`평가 제출에 실패했습니다. ❌\n${error.response?.data?.error || error.message}`)
                        
                        // 오류 시 버튼 복구
                        submitBtn.disabled = false
                        submitBtn.innerHTML = originalText
                    }
                })
                
                console.log("[Feedback] 세션 평가 폼 이벤트 리스너 등록 완료")
            }
        }, 100)
        
        document.getElementById('sessionModal').classList.remove('hidden')
}

function closeModal() {
    document.getElementById('sessionModal').classList.add('hidden')
}

async function sendMessage(event, sessionId) {
    event.preventDefault()
    
    const messageInput = document.getElementById(`messageInput-${sessionId}`)
    const message = messageInput.value.trim()
    
    if (!message) return
    
    const messagesContainer = document.getElementById('conversationMessages-' + sessionId)
    
    // 사용자 메시지 추가 (UI)
    const userMessageHtml = '<div class="text-right">' +
        '<div class="inline-block max-w-[90%] p-3 rounded-lg bg-purple-500 text-white">' +
        '<p class="text-sm">' + message + '</p>' +
        '<p class="text-xs mt-1 opacity-70">' + new Date().toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'}) + '</p>' +
        '</div>' +
        '</div>'
    
    // 빈 메시지 제거
    if (messagesContainer.querySelector('.text-gray-500')) {
        messagesContainer.innerHTML = ''
    }
    
    messagesContainer.insertAdjacentHTML('beforeend', userMessageHtml)
    messageInput.value = ''
    
    // AI 응답 대기 표시
    const loadingHtml = '<div class="text-left" id="loading-' + sessionId + '">' +
        '<div class="inline-block max-w-[90%] p-3 rounded-lg bg-white border border-gray-200 text-gray-800">' +
        '<p class="text-sm"><i class="fas fa-spinner fa-spin mr-2"></i>AI가 답변 중입니다...</p>' +
        '</div>' +
        '</div>'
    messagesContainer.insertAdjacentHTML('beforeend', loadingHtml)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
    
    try {
        // API 호출 (추가 질문은 답변이 길어서 120초 타임아웃)
        const res = await axios.post('/api/coaching-sessions/' + sessionId + '/conversation', {
            message
        }, {
            timeout: 120000 // 120초 타임아웃 (긴 답변 대기)
        })
        
        // 로딩 제거
        const loadingEl = document.getElementById('loading-' + sessionId)
        if (loadingEl) loadingEl.remove()
        
        // AI 응답 추가
        const aiMessage = res.data.aiResponse
        const aiMessageHtml = '<div class="text-left">' +
            '<div class="inline-block max-w-[90%] p-3 rounded-lg bg-white border border-gray-200 text-gray-800">' +
            '<p class="text-sm whitespace-pre-wrap break-words">' + aiMessage + '</p>' +
            '<p class="text-xs mt-1 opacity-70">' + new Date().toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'}) + '</p>' +
            '</div>' +
            '</div>'
        messagesContainer.insertAdjacentHTML('beforeend', aiMessageHtml)
        messagesContainer.scrollTop = messagesContainer.scrollHeight
        
    } catch (error) {
        // 로딩 제거
        document.getElementById(`loading-${sessionId}`)?.remove()
        
        alert('오류가 발생했습니다: ' + (error.response?.data?.error || error.message))
    }
}

// 전역 함수 등록 (HTML onclick에서 호출 가능하도록)
window.closeModal = closeModal
window.sendMessage = sendMessage

// 로그아웃 버튼 이벤트
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('user')
        window.location.href = '/'
    }
})

// 경력 정보 관련 함수들
function openCareerModal() {
    document.getElementById('careerModal').classList.remove('hidden')
}

function closeCareerModal() {
    document.getElementById('careerModal').classList.add('hidden')
}

function updateProductRatioDisplay() {
    const lifeRatio = parseInt(document.getElementById('productRatioLifeInput').value)
    const nonLifeRatio = parseInt(document.getElementById('productRatioNonLifeInput').value)
    
    document.getElementById('lifeRatioDisplay').textContent = lifeRatio + '%'
    document.getElementById('nonLifeRatioDisplay').textContent = nonLifeRatio + '%'
    
    const ratioError = document.getElementById('ratioError')
    if (lifeRatio + nonLifeRatio !== 100) {
        ratioError.classList.remove('hidden')
    } else {
        ratioError.classList.add('hidden')
    }
}

// 개인정보 관련 함수들
function openPersonalInfoModal() {
    document.getElementById('personalInfoModal').classList.remove('hidden')
}

function closePersonalInfoModal() {
    document.getElementById('personalInfoModal').classList.add('hidden')
}

// 경력 정보 제출
document.getElementById('careerForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const lifeRatio = parseInt(document.getElementById('productRatioLifeInput').value)
    const nonLifeRatio = parseInt(document.getElementById('productRatioNonLifeInput').value)
    
    if (lifeRatio + nonLifeRatio !== 100) {
        alert('생보와 손보의 합계가 100%가 되어야 합니다.')
        return
    }
    
    const careerData = {
        careerStartYear: parseInt(document.getElementById('careerStartYearInput').value),
        firstOrganization: document.getElementById('firstOrganizationInput').value,
        careerPath: document.getElementById('careerPathInput').value,
        productRatio: "생보 " + lifeRatio + "% / 손보 " + nonLifeRatio + "%"
    }
    
    const saveBtn = document.getElementById('saveCareerBtn')
    const loading = document.getElementById('careerLoading')
    
    saveBtn.disabled = true
    loading.classList.remove('hidden')
    
    try {
        const res = await axios.post('/api/planner/career', {
            plannerId: user.id,
            ...careerData
        })
        
        if (res.data.success) {
            alert('경력 정보가 저장되었습니다!')
            closeCareerModal()
            loadProfile()
        } else {
            throw new Error('경력 정보 저장 실패')
        }
    } catch (error) {
        alert('오류가 발생했습니다: ' + (error.response?.data?.error || error.message))
    } finally {
        saveBtn.disabled = false
        loading.classList.add('hidden')
    }
})

// 개인정보 제출
document.getElementById('personalInfoForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const personalData = {
        birthYear: parseInt(document.getElementById('birthYearInput').value),
        gender: document.querySelector('input[name="gender"]:checked').value,
        maritalStatus: document.getElementById('maritalStatusInput').value
    }
    
    const saveBtn = document.getElementById('savePersonalInfoBtn')
    const loading = document.getElementById('personalInfoLoading')
    
    saveBtn.disabled = true
    loading.classList.remove('hidden')
    
    try {
        const res = await axios.post('/api/planner/personal-info', {
            plannerId: user.id,
            ...personalData
        })
        
        if (res.data.success) {
            alert('개인정보가 저장되었습니다!')
            closePersonalInfoModal()
            loadProfile()
        } else {
            throw new Error('개인정보 저장 실패')
        }
    } catch (error) {
        alert('오류가 발생했습니다: ' + (error.response?.data?.error || error.message))
    } finally {
        saveBtn.disabled = false
        loading.classList.add('hidden')
    }
})

// 성향 테스트 관련 함수들
function openPersonalityTest() {
    document.getElementById('personalityTestModal').classList.remove('hidden')
}

function closePersonalityTest() {
    document.getElementById('personalityTestModal').classList.add('hidden')
}

function viewPersonalityReport() {
    // 저장된 성향 데이터가 있으면 표시
    if (window.personalityReportData) {
        displayPersonalityReport(window.personalityReportData)
    } else {
        // 데이터가 없으면 API에서 다시 불러오기
        console.log('[DEBUG] No cached personality data, fetching from API...')
        axios.get('/api/planner/' + user.id).then(res => {
            const profile = res.data.profile
            if (profile.personalityType) {
                const reportData = {
                    personalityType: profile.personalityType,
                    energyDirection: profile.energyDirection,
                    informationProcessing: profile.informationProcessing,
                    decisionMaking: profile.decisionMaking,
                    achievementMotivation: profile.achievementMotivation,
                    stressRecovery: profile.stressRecovery,
                    professionalPreference: profile.professionalPreference,
                    strengths: profile.strengths,
                    recommendedStyle: profile.recommendedStyle,
                    cautions: profile.cautions,
                    growthDirection: profile.growthDirection
                }
                window.personalityReportData = reportData
                displayPersonalityReport(reportData)
            } else {
                alert('저장된 성향 분석 결과가 없습니다.')
            }
        }).catch(error => {
            console.error('[DEBUG] Failed to load personality data:', error)
            alert('성향 데이터를 불러오는데 실패했습니다.')
        })
    }
}

function closePersonalityReport() {
    document.getElementById('personalityReportModal').classList.add('hidden')
}

function retakePersonalityTest() {
    // Report 모달 닫기
    closePersonalityReport()
    // 성향 테스트 모달 열기
    openPersonalityTest()
}

// 전역 함수 등록 (HTML onclick에서 사용)
window.openCareerModal = openCareerModal
window.closeCareerModal = closeCareerModal
window.updateProductRatioDisplay = updateProductRatioDisplay
window.openPersonalInfoModal = openPersonalInfoModal
window.closePersonalInfoModal = closePersonalInfoModal
window.openPersonalityTest = openPersonalityTest
window.closePersonalityTest = closePersonalityTest
window.viewPersonalityReport = viewPersonalityReport
window.closePersonalityReport = closePersonalityReport
window.retakePersonalityTest = retakePersonalityTest

// 성향 테스트 제출
document.getElementById('personalityTestForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const answers = {
        q1: parseInt(document.querySelector('input[name="q1"]:checked').value),
        q2: parseInt(document.querySelector('input[name="q2"]:checked').value),
        q3: parseInt(document.querySelector('input[name="q3"]:checked').value),
        q4: parseInt(document.querySelector('input[name="q4"]:checked').value),
        q5: parseInt(document.querySelector('input[name="q5"]:checked').value),
        q6: parseInt(document.querySelector('input[name="q6"]:checked').value)
    }
    
    const saveBtn = document.getElementById('savePersonalityBtn')
    const loading = document.getElementById('personalityLoading')
    
    saveBtn.disabled = true
    loading.classList.remove('hidden')
    
    try {
        const res = await axios.post('/api/personality-analysis', {
            plannerId: user.id,
            answers
        }, {
            timeout: 60000
        })
        
        if (res.data.success) {
            alert('성향 분석이 완료되었습니다!')
            closePersonalityTest()
            
            // 프로필 상태 업데이트 (요소가 존재할 때만)
            const statusElement = document.getElementById('personalityStatus')
            const reportElement = document.getElementById('personalityReport')
            
            if (statusElement) {
                statusElement.textContent = '성향 분석 완료 ✓'
            }
            if (reportElement) {
                reportElement.classList.remove('hidden')
            }
            
            // Report 내용 저장
            window.personalityReportData = res.data.report
            
            // Report 모달 자동 표시
            displayPersonalityReport(res.data.report)
        } else {
            throw new Error('성향 분석 실패')
        }
    } catch (error) {
        alert('오류가 발생했습니다: ' + (error.response?.data?.error || error.message))
    } finally {
        saveBtn.disabled = false
        loading.classList.add('hidden')
    }
})

function displayPersonalityReport(report) {
    const content = document.getElementById('personalityReportContent')
    if (!content) {
        console.error('personalityReportContent 요소를 찾을 수 없습니다.')
        return
    }
    content.innerHTML = `
        <div class="space-y-6">
            <div class="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-lg">
                <h4 class="text-xl font-bold text-purple-800 mb-2">종합 성향</h4>
                <p class="text-lg font-semibold text-gray-800">${report.personalityType}</p>
            </div>
            
            <div class="bg-white border-2 border-purple-200 p-6 rounded-lg">
                <h4 class="text-lg font-bold text-gray-800 mb-3">
                    <i class="fas fa-chart-bar mr-2 text-purple-600"></i>세부 분석
                </h4>
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="font-semibold">에너지 방향:</span>
                        <span class="text-purple-700">${report.energyDirection}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-semibold">정보 인식:</span>
                        <span class="text-blue-700">${report.informationProcessing}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-semibold">의사 결정:</span>
                        <span class="text-green-700">${report.decisionMaking}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-semibold">성취 동기:</span>
                        <span class="text-yellow-700">${report.achievementMotivation}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-semibold">스트레스 회복:</span>
                        <span class="text-red-700">${report.stressRecovery}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-semibold">전문성 선호:</span>
                        <span class="text-indigo-700">${report.professionalPreference}</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-blue-50 p-6 rounded-lg">
                <h4 class="text-lg font-bold text-gray-800 mb-3">
                    <i class="fas fa-star mr-2 text-yellow-500"></i>강점
                </h4>
                <p class="text-gray-700 whitespace-pre-wrap">${report.strengths}</p>
            </div>
            
            <div class="bg-green-50 p-6 rounded-lg">
                <h4 class="text-lg font-bold text-gray-800 mb-3">
                    <i class="fas fa-lightbulb mr-2 text-green-600"></i>추천 영업 스타일
                </h4>
                <p class="text-gray-700 whitespace-pre-wrap">${report.recommendedStyle}</p>
            </div>
            
            <div class="bg-yellow-50 p-6 rounded-lg">
                <h4 class="text-lg font-bold text-gray-800 mb-3">
                    <i class="fas fa-exclamation-triangle mr-2 text-yellow-600"></i>주의할 점
                </h4>
                <p class="text-gray-700 whitespace-pre-wrap">${report.cautions}</p>
            </div>
            
            <div class="bg-purple-50 p-6 rounded-lg">
                <h4 class="text-lg font-bold text-gray-800 mb-3">
                    <i class="fas fa-graduation-cap mr-2 text-purple-600"></i>성장 방향
                </h4>
                <p class="text-gray-700 whitespace-pre-wrap">${report.growthDirection}</p>
            </div>
            
            <!-- 수정 버튼 -->
            <div class="flex justify-center pt-4 border-t-2 border-gray-200">
                <button onclick="retakePersonalityTest()" class="gradient-bg text-white px-6 py-3 rounded-lg hover:opacity-90 flex items-center gap-2">
                    <i class="fas fa-edit mr-2"></i>수정
                </button>
            </div>
        </div>
    `
    
    // 모달 열기 (재귀 호출 제거)
    document.getElementById('personalityReportModal').classList.remove('hidden')
}

// 초기 데이터 로드
console.log('[DEBUG] Starting initial data load...')
loadProfile()
loadSessions()
loadKnowledgeBase()
console.log('[DEBUG] Page setup complete')

// 업로드된 자료 목록 로드
let allKnowledge = []
let currentKnowledgeCategory = 'all'

async function loadKnowledgeBase() {
    try {
        const res = await axios.get('/api/knowledge-base')
        allKnowledge = res.data.knowledge || []
        
        // 설계사용 또는 공용 자료만 필터링
        allKnowledge = allKnowledge.filter(k => 
            k.targetAudience === '설계사용' || k.targetAudience === '공용'
        )
        
        displayKnowledge()
    } catch (error) {
        console.error('자료 로드 실패:', error)
        document.getElementById('knowledgeList').innerHTML = 
            '<p class="text-red-500 col-span-full text-center py-8">자료를 불러오는 중 오류가 발생했습니다.</p>'
    }
}

function filterKnowledge(category) {
    currentKnowledgeCategory = category
    
    // 탭 활성화 스타일 변경
    document.querySelectorAll('.knowledge-tab').forEach(tab => {
        if (tab.dataset.category === category) {
            tab.className = 'knowledge-tab px-4 py-2 rounded-t-lg font-semibold transition bg-gradient-to-r from-blue-600 to-purple-600 text-white'
        } else {
            tab.className = 'knowledge-tab px-4 py-2 rounded-t-lg font-semibold text-gray-600 hover:bg-gray-100 transition'
        }
    })
    
    displayKnowledge()
}

function displayKnowledge() {
    const container = document.getElementById('knowledgeList')
    
    let filtered = allKnowledge
    if (currentKnowledgeCategory !== 'all') {
        filtered = allKnowledge.filter(k => k.category === currentKnowledgeCategory)
    }
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">해당 카테고리에 자료가 없습니다.</p>'
        return
    }
    
    // 카테고리별 색상
    const categoryColors = {
        '영업기법': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'fa-chart-line' },
        '고객관리': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'fa-users' },
        '상품지식': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'fa-file-invoice-dollar' },
        '민원대응': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'fa-exclamation-triangle' },
        '기타': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'fa-folder' }
    }
    
    container.innerHTML = filtered.map(k => {
        const color = categoryColors[k.category] || categoryColors['기타']
        const isPriority = k.isPriority ? '<span class="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full"><i class="fas fa-star mr-1"></i>중요</span>' : ''
        const preview = k.content.substring(0, 100) + (k.content.length > 100 ? '...' : '')
        
        return `
            <div class="border ${color.border} ${color.bg} rounded-lg p-4 hover:shadow-lg transition cursor-pointer" onclick="viewKnowledge(${k.id})">
                <div class="flex items-start justify-between mb-2">
                    <span class="${color.text} text-sm font-semibold">
                        <i class="fas ${color.icon} mr-1"></i>${k.category}
                    </span>
                    ${isPriority}
                </div>
                <h3 class="font-bold text-gray-800 mb-2">${escapeHtml(k.title)}</h3>
                <p class="text-sm text-gray-600 mb-3 line-clamp-3">${escapeHtml(preview)}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span><i class="far fa-calendar mr-1"></i>${new Date(k.uploadDate).toLocaleDateString('ko-KR')}</span>
                    <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded">${k.targetAudience}</span>
                </div>
            </div>
        `
    }).join('')
}

function viewKnowledge(id) {
    const knowledge = allKnowledge.find(k => k.id === id)
    if (!knowledge) return
    
    const color = {
        '영업기법': 'blue',
        '고객관리': 'green',
        '상품지식': 'purple',
        '민원대응': 'red',
        '기타': 'gray'
    }[knowledge.category] || 'gray'
    
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
    modal.innerHTML = `
        <div class="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="bg-${color}-100 text-${color}-700 px-3 py-1 rounded-full text-sm font-semibold">
                                ${knowledge.category}
                            </span>
                            ${knowledge.isPriority ? '<span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm"><i class="fas fa-star mr-1"></i>중요</span>' : ''}
                            <span class="bg-${color}-50 text-${color}-700 px-2 py-1 rounded text-xs">${knowledge.targetAudience}</span>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800">${escapeHtml(knowledge.title)}</h3>
                        <p class="text-sm text-gray-500 mt-1">
                            <i class="far fa-calendar mr-1"></i>${new Date(knowledge.uploadDate).toLocaleDateString('ko-KR')}
                        </p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <div class="prose max-w-none">
                    <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-${color}-500">
                        <p class="text-gray-700 whitespace-pre-wrap">${escapeHtml(knowledge.content)}</p>
                    </div>
                </div>
            </div>
        </div>
    `
    document.body.appendChild(modal)
    
    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove()
        }
    })
}

// 30초마다 자동 갱신 (새로운 코칭 세션 실시간 반영)
setInterval(() => {
    console.log('[AUTO-REFRESH] Reloading sessions...')
    loadSessions()
}, 30000)
