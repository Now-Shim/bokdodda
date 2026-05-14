// 설계사 페이지 HTML
export const plannerPageHTML = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>설계사 대시보드 - 북돋다</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .loading { display: inline-block; width: 20px; height: 20px; border: 3px solid #f3f3f3; border-top: 3px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body class="bg-gray-50">
    <nav class="gradient-bg text-white p-4 shadow-lg">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <div class="flex items-center space-x-4">
                <i class="fas fa-book-open text-2xl"></i>
                <div>
                    <h1 class="text-xl font-bold">북돋다</h1>
                    <p class="text-xs opacity-90">Book | Jar | All</p>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <span id="userName" class="font-semibold"></span>
                <button id="logoutBtn" class="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-gray-100">
                    <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
                </button>
            </div>
        </div>
    </nav>
    
    <div class="max-w-7xl mx-auto p-6">
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-user-circle mr-2 text-purple-600"></i>내 프로필
            </h2>
            <div id="profileInfo" class="cursor-pointer hover:shadow-md transition-all" onclick="openPersonalityTest()">
                <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200 hover:border-purple-400">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600 mb-2">성향 분석</p>
                            <p id="personalityStatus" class="font-bold text-purple-700 text-lg">클릭하여 성향 테스트 시작</p>
                        </div>
                        <div class="text-4xl text-purple-600">
                            <i class="fas fa-brain"></i>
                        </div>
                    </div>
                    <div id="personalityReport" class="hidden mt-4">
                        <button onclick="event.stopPropagation(); viewPersonalityReport()" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                            <i class="fas fa-file-alt mr-2"></i>성향 Report 보기
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-robot mr-2 text-purple-600"></i>AI 코칭 요청
            </h2>
            <p class="text-sm text-gray-600 mb-4">현장에서 겪고 있는 상황을 입력하면, AI가 즉시 맞춤형 코칭을 제공합니다.</p>
            <form id="coachingForm" class="space-y-4">
                <div>
                    <label class="block text-gray-700 font-semibold mb-2">상황 유형</label>
                    <select id="situationType" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                        <option value="신규고객">신규 고객</option>
                        <option value="기존고객">기존 고객</option>
                        <option value="대형계약">대형 계약</option>
                        <option value="클레임처리">클레임 처리</option>
                        <option value="거절대응">거절 대응</option>
                        <option value="기타">기타</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 font-semibold mb-2">현장 상황 설명</label>
                    <textarea id="context" rows="4" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="예: 신규 고객과 첫 만남에서 보험 이야기를 꺼내자마자 거부감을 보였습니다..."></textarea>
                </div>
                <button type="submit" id="submitBtn"
                    class="gradient-bg text-white font-bold px-6 py-3 rounded-lg hover:opacity-90">
                    <i class="fas fa-paper-plane mr-2"></i>AI 코칭 받기
                </button>
                <span id="loading" class="ml-4 hidden">
                    <div class="loading"></div> 
                    <span id="loading-text">AI가 분석 중입니다... (약 30초 소요)</span>
                </span>
            </form>
        </div>
        
        <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-history mr-2 text-green-600"></i>코칭 히스토리
            </h2>
            <div id="sessionsList" class="space-y-4"></div>
        </div>
    </div>
    
    <!-- 성향 테스트 모달 -->
    <div id="personalityTestModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-brain mr-2 text-purple-600"></i>성향 파악 테스트
                    </h3>
                    <button onclick="closePersonalityTest()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <p class="text-sm text-gray-600 mb-6">각 질문에 대해 1~5점으로 평가해주세요. (1점: 왼쪽 선택지에 가까움 / 5점: 오른쪽 선택지에 가까움)</p>
                
                <form id="personalityTestForm" class="space-y-6">
                    <!-- Q1 -->
                    <div class="border-l-4 border-purple-500 pl-4">
                        <h4 class="font-bold text-gray-800 mb-2">Q1. [에너지 방향] 모처럼 만난 잠재 고객이 "보험의 '보'자도 꺼내지 마라"며 5분 만에 대화를 끝냈습니다. 사무실로 돌아오는 길에 당신은?</h4>
                        <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div class="bg-blue-50 p-3 rounded">(E) 동료에게 전화해 방금 겪은 황당한 일을 수다 떨며 털어버리고, 바로 다음 고객을 방문할 계획을 세운다.</div>
                            <div class="bg-green-50 p-3 rounded">(I) 조용한 곳에서 혼자 마음을 추스르며, 왜 거절당했는지 대화 내용을 복기하고 다시 나갈 에너지를 모은다.</div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">E (외향)</span>
                            <div class="flex space-x-2">
                                <input type="radio" name="q1" value="1" required class="w-6 h-6"> <span class="text-xs">1</span>
                                <input type="radio" name="q1" value="2" class="w-6 h-6"> <span class="text-xs">2</span>
                                <input type="radio" name="q1" value="3" class="w-6 h-6"> <span class="text-xs">3</span>
                                <input type="radio" name="q1" value="4" class="w-6 h-6"> <span class="text-xs">4</span>
                                <input type="radio" name="q1" value="5" class="w-6 h-6"> <span class="text-xs">5</span>
                            </div>
                            <span class="text-sm text-gray-600">I (내향)</span>
                        </div>
                    </div>

                    <!-- Q2 -->
                    <div class="border-l-4 border-blue-500 pl-4">
                        <h4 class="font-bold text-gray-800 mb-2">Q2. [정보 인식] 새로운 암 보험 상품을 공부할 때, 당신의 눈에 먼저 들어오는 것은?</h4>
                        <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div class="bg-blue-50 p-3 rounded">(S) 면책 기간, 감액 지급 규정, 정확한 보험료 구간 등 구체적인 약관 세부 내용.</div>
                            <div class="bg-green-50 p-3 rounded">(N) 이 상품이 고객의 인생 주기에서 어떤 의미를 갖는지, 그리고 이 보장으로 얻게 될 평화로운 미래의 모습.</div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">S (감각)</span>
                            <div class="flex space-x-2">
                                <input type="radio" name="q2" value="1" required class="w-6 h-6"> <span class="text-xs">1</span>
                                <input type="radio" name="q2" value="2" class="w-6 h-6"> <span class="text-xs">2</span>
                                <input type="radio" name="q2" value="3" class="w-6 h-6"> <span class="text-xs">3</span>
                                <input type="radio" name="q2" value="4" class="w-6 h-6"> <span class="text-xs">4</span>
                                <input type="radio" name="q2" value="5" class="w-6 h-6"> <span class="text-xs">5</span>
                            </div>
                            <span class="text-sm text-gray-600">N (직관)</span>
                        </div>
                    </div>

                    <!-- Q3 -->
                    <div class="border-l-4 border-green-500 pl-4">
                        <h4 class="font-bold text-gray-800 mb-2">Q3. [의사 결정] 계약을 고민하는 고객에게 마지막 한마디를 던진다면?</h4>
                        <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div class="bg-blue-50 p-3 rounded">(T) "이 상품은 타사 대비 보장 범위가 30% 넓고, 가성비 면에서 현재 가장 논리적인 선택입니다."</div>
                            <div class="bg-green-50 p-3 rounded">(F) "고객님, 제가 제 가족의 보험을 설계한다는 마음으로 정성을 다해 준비했습니다. 저를 믿고 맡겨주세요."</div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">T (사고)</span>
                            <div class="flex space-x-2">
                                <input type="radio" name="q3" value="1" required class="w-6 h-6"> <span class="text-xs">1</span>
                                <input type="radio" name="q3" value="2" class="w-6 h-6"> <span class="text-xs">2</span>
                                <input type="radio" name="q3" value="3" class="w-6 h-6"> <span class="text-xs">3</span>
                                <input type="radio" name="q3" value="4" class="w-6 h-6"> <span class="text-xs">4</span>
                                <input type="radio" name="q3" value="5" class="w-6 h-6"> <span class="text-xs">5</span>
                            </div>
                            <span class="text-sm text-gray-600">F (감정)</span>
                        </div>
                    </div>

                    <!-- Q4 -->
                    <div class="border-l-4 border-yellow-500 pl-4">
                        <h4 class="font-bold text-gray-800 mb-2">Q4. [성취 동기] 이번 달 마감 목표를 달성했을 때, 당신을 가장 기쁘게 하는 보상은?</h4>
                        <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div class="bg-blue-50 p-3 rounded">(도파민) 시상대에 올라가 동료들의 박수를 받으며 받는 화려한 트로피와 고액 보너스.</div>
                            <div class="bg-green-50 p-3 rounded">(세로토닌) 마감을 무사히 마쳤다는 안도감과 함께 사랑하는 가족과 보내는 평온하고 따뜻한 저녁 시간.</div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">도파민</span>
                            <div class="flex space-x-2">
                                <input type="radio" name="q4" value="1" required class="w-6 h-6"> <span class="text-xs">1</span>
                                <input type="radio" name="q4" value="2" class="w-6 h-6"> <span class="text-xs">2</span>
                                <input type="radio" name="q4" value="3" class="w-6 h-6"> <span class="text-xs">3</span>
                                <input type="radio" name="q4" value="4" class="w-6 h-6"> <span class="text-xs">4</span>
                                <input type="radio" name="q4" value="5" class="w-6 h-6"> <span class="text-xs">5</span>
                            </div>
                            <span class="text-sm text-gray-600">세로토닌</span>
                        </div>
                    </div>

                    <!-- Q5 -->
                    <div class="border-l-4 border-red-500 pl-4">
                        <h4 class="font-bold text-gray-800 mb-2">Q5. [스트레스 회복력] 가입하기로 했던 고객이 갑자기 전화를 안 받고 잠수를 탔습니다. 당신의 상태는?</h4>
                        <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div class="bg-blue-50 p-3 rounded">(회복탄력성) "바쁘신가 보네"라고 생각하며 크게 개의치 않고 다른 업무 리스트를 체크한다.</div>
                            <div class="bg-green-50 p-3 rounded">(불안 민감도) "내가 실수를 했나?" 하는 생각에 온종일 일이 손에 잡히지 않고, 자꾸 휴대폰만 확인하게 된다.</div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">회복탄력성</span>
                            <div class="flex space-x-2">
                                <input type="radio" name="q5" value="1" required class="w-6 h-6"> <span class="text-xs">1</span>
                                <input type="radio" name="q5" value="2" class="w-6 h-6"> <span class="text-xs">2</span>
                                <input type="radio" name="q5" value="3" class="w-6 h-6"> <span class="text-xs">3</span>
                                <input type="radio" name="q5" value="4" class="w-6 h-6"> <span class="text-xs">4</span>
                                <input type="radio" name="q5" value="5" class="w-6 h-6"> <span class="text-xs">5</span>
                            </div>
                            <span class="text-sm text-gray-600">불안 민감도</span>
                        </div>
                    </div>

                    <!-- Q6 -->
                    <div class="border-l-4 border-indigo-500 pl-4">
                        <h4 class="font-bold text-gray-800 mb-2">Q6. [전문성 선호도] 특별 교육이 있다면, 어떤 수업에 더 참여하고 싶습니까?</h4>
                        <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div class="bg-blue-50 p-3 rounded">(학구파) 보험법의 변천사와 정밀한 약관 분석을 통해 전문가로서의 이론적 깊이를 채우는 수업.</div>
                            <div class="bg-green-50 p-3 rounded">(현장파) 현장에서 바로 써먹을 수 있는 강력한 클로징 멘트와 고객 거절 처리 기법을 실전처럼 연습하는 수업.</div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">학구파</span>
                            <div class="flex space-x-2">
                                <input type="radio" name="q6" value="1" required class="w-6 h-6"> <span class="text-xs">1</span>
                                <input type="radio" name="q6" value="2" class="w-6 h-6"> <span class="text-xs">2</span>
                                <input type="radio" name="q6" value="3" class="w-6 h-6"> <span class="text-xs">3</span>
                                <input type="radio" name="q6" value="4" class="w-6 h-6"> <span class="text-xs">4</span>
                                <input type="radio" name="q6" value="5" class="w-6 h-6"> <span class="text-xs">5</span>
                            </div>
                            <span class="text-sm text-gray-600">현장파</span>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-4 mt-6">
                        <button type="button" onclick="closePersonalityTest()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                            취소
                        </button>
                        <button type="submit" id="savePersonalityBtn" class="gradient-bg text-white px-6 py-3 rounded-lg hover:opacity-90">
                            <i class="fas fa-save mr-2"></i>저장 및 AI 분석
                        </button>
                        <span id="personalityLoading" class="hidden">
                            <div class="loading"></div>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- 성향 Report 모달 -->
    <div id="personalityReportModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-file-alt mr-2 text-purple-600"></i>성향 Report
                    </h3>
                    <button onclick="closePersonalityReport()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <div id="personalityReportContent"></div>
            </div>
        </div>
    </div>

    <div id="sessionModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-bold text-gray-800">AI 코칭 상세</h3>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <div id="sessionDetail"></div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script>
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
                const res = await axios.get(\`/api/planner/\${user.id}\`)
                console.log('[DEBUG] Profile API response:', res.data)
                const { profile } = res.data
                document.getElementById('profileInfo').innerHTML = \`
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600">성향</p>
                        <p class="font-bold text-purple-700">\${profile.personalityType} - \${profile.salesStyle}</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600">경력</p>
                        <p class="font-bold text-blue-700">\${profile.experienceYears}년 (\${profile.specialization})</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600">코칭 세션</p>
                        <p class="font-bold text-green-700">\${profile.totalCoachingSessions}회</p>
                    </div>
                \`
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
                const res = await axios.get(\`/api/coaching-sessions/\${user.id}\`)
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
                
                sessions.forEach(s => {
                    const sessionDiv = document.createElement('div')
                    sessionDiv.className = 'border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition'
                    sessionDiv.onclick = () => viewSession(s.id)
                    
                    sessionDiv.innerHTML = \`
                        <div class="flex justify-between items-start mb-2">
                            <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">\${escapeHtml(s.situationType)}</span>
                            <span class="text-sm text-gray-500">\${new Date(s.sessionDate).toLocaleDateString('ko-KR')}</span>
                        </div>
                        <p class="text-gray-700 font-semibold mb-2" id="context-\${s.id}"></p>
                        <div id="rating-\${s.id}"></div>
                    \`
                    
                    // 안전하게 텍스트 삽입
                    const contextEl = sessionDiv.querySelector(\`#context-\${s.id}\`)
                    const contextText = s.context.substring(0, 100) + (s.context.length > 100 ? '...' : '')
                    contextEl.textContent = contextText
                    
                    // 별점 표시
                    const ratingEl = sessionDiv.querySelector(\`#rating-\${s.id}\`)
                    if (s.effectivenessRating) {
                        ratingEl.innerHTML = \`
                            <div class="flex items-center text-yellow-500">
                                \${'<i class="fas fa-star"></i>'.repeat(s.effectivenessRating)}
                            </div>
                        \`
                    } else {
                        ratingEl.innerHTML = '<span class="text-gray-400 text-sm">피드백 대기 중</span>'
                    }
                    
                    sessionsList.appendChild(sessionDiv)
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
                    timeout: 60000 // 60초 타임아웃 (AI 응답 대기)
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
            axios.get(\`/api/coaching-sessions/\${user.id}\`).then(res => {
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
                detailContainer.innerHTML = \`
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
                        \${session.references && session.references.length > 0 ? \`
                        <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-300">
                            <h4 class="font-bold text-yellow-900 mb-4 text-xl">
                                <i class="fas fa-link mr-2"></i>참조 자료 (근거)
                            </h4>
                            <div class="space-y-3">
                                \${session.references.map((ref, idx) => \`
                                    <div class="bg-white p-4 rounded-lg shadow-sm">
                                        <h5 class="font-semibold text-yellow-800 mb-2">
                                            <i class="fas fa-file-alt mr-2"></i>[\${idx + 1}] \${ref.source}
                                        </h5>
                                        <p class="text-gray-700 ml-6 mb-2">\${ref.content}</p>
                                        \${ref.url ? \`<a href="\${ref.url}" target="_blank" class="ml-6 text-blue-600 hover:underline text-sm">
                                            <i class="fas fa-external-link-alt mr-1"></i>출처 링크
                                        </a>\` : ''}
                                    </div>
                                \`).join('')}
                            </div>
                        </div>
                        \` : ''}
                        
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
                            <div id="conversationMessages-\${session.id}" class="mb-4 space-y-3 min-h-[200px] max-h-[1200px] overflow-y-auto bg-gray-50 p-4 rounded-lg">
                                \${session.conversationMessages && session.conversationMessages.length > 0 ? 
                                    session.conversationMessages.map(msg => \`
                                        <div class="\${msg.sender === 'planner' ? 'text-right' : 'text-left'}">
                                            <div class="inline-block max-w-[80%] p-3 rounded-lg \${msg.sender === 'planner' ? 'bg-purple-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}">
                                                <p class="text-sm">\${msg.message}</p>
                                                <p class="text-xs mt-1 opacity-70">\${new Date(msg.timestamp).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</p>
                                            </div>
                                        </div>
                                    \`).join('') 
                                : '<p class="text-gray-500 text-center py-4">아직 추가 질문이 없습니다. 궁금한 점을 물어보세요!</p>'}
                            </div>
                            
                            <!-- 메시지 입력 폼 -->
                            <form id="conversationForm-\${session.id}" class="flex gap-2" onsubmit="sendMessage(event, \${session.id})">
                                <input type="text" id="messageInput-\${session.id}" 
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
                            
                            \${session.effectivenessRating ? \`
                                <div class="bg-green-50 p-3 rounded-lg border border-green-200 mb-3">
                                    <p class="text-sm text-green-800 mb-1">✅ 평가 완료 (아래에서 수정 가능)</p>
                                    <div class="flex items-center text-yellow-500 mb-1">
                                        \${'<i class="fas fa-star"></i>'.repeat(session.effectivenessRating)}
                                    </div>
                                    \${session.plannerFeedback ? \`<p class="text-sm text-gray-700 mt-1">"\${session.plannerFeedback}"</p>\` : ''}
                                </div>
                            \` : ''}
                            
                            <form id="feedbackForm" class="space-y-3">
                                <div>
                                    <label class="block text-sm font-semibold mb-1">효과성 평가</label>
                                    <select id="rating" class="w-full px-3 py-2 border rounded-lg" required>
                                        <option value="5" \${session.effectivenessRating === 5 ? 'selected' : ''}>⭐⭐⭐⭐⭐ 매우 도움됨</option>
                                        <option value="4" \${session.effectivenessRating === 4 ? 'selected' : ''}>⭐⭐⭐⭐ 도움됨</option>
                                        <option value="3" \${session.effectivenessRating === 3 ? 'selected' : ''}>⭐⭐⭐ 보통</option>
                                        <option value="2" \${session.effectivenessRating === 2 ? 'selected' : ''}>⭐⭐ 별로</option>
                                        <option value="1" \${session.effectivenessRating === 1 ? 'selected' : ''}>⭐ 도움 안됨</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-semibold mb-1">후기 (선택)</label>
                                    <textarea id="feedback" rows="2" class="w-full px-3 py-2 border rounded-lg" 
                                        placeholder="코칭이 도움이 되었는지, 개선할 점이 있다면 알려주세요.">\${session.plannerFeedback || ''}</textarea>
                                </div>
                                <button type="submit" class="gradient-bg text-white px-4 py-2 rounded-lg hover:opacity-90" id="submitFeedbackBtn">
                                    <i class="fas fa-check mr-2"></i>\${session.effectivenessRating ? '평가 수정' : '평가 제출'}
                                </button>
                            </form>
                        </div>
                    </div>
                \`
                
                // 데이터를 안전하게 textContent로 삽입
                const setTextContent = (id, text) => {
                    const element = document.getElementById(id)
                    if (element) {
                        element.textContent = text
                    } else {
                        console.warn(\`Element not found: \${id}\`)
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
                            
                            console.log(\`[Feedback] 평가 제출 시작: 세션 \${sessionId}, 평점 \${rating}점\`)
                            
                            try {
                                const response = await axios.post(\`/api/coaching-sessions/\${sessionId}/feedback\`, {
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
                                alert(\`평가 제출에 실패했습니다. ❌\\n\${error.response?.data?.error || error.message}\`)
                                
                                // 오류 시 버튼 복구
                                submitBtn.disabled = false
                                submitBtn.innerHTML = originalText
                            }
                        })
                        
                        console.log(\`[Feedback] 세션 \${id} 평가 폼 이벤트 리스너 등록 완료\`)
                    }
                }, 100)
                
                document.getElementById('sessionModal').classList.remove('hidden')
        }
        
        function closeModal() {
            document.getElementById('sessionModal').classList.add('hidden')
        }
        
        async function sendMessage(event, sessionId) {
            event.preventDefault()
            
            const messageInput = document.getElementById(\`messageInput-\${sessionId}\`)
            const message = messageInput.value.trim()
            
            if (!message) return
            
            const messagesContainer = document.getElementById(\`conversationMessages-\${sessionId}\`)
            
            // 사용자 메시지 추가 (UI)
            const userMessageHtml = \`
                <div class="text-right">
                    <div class="inline-block max-w-[90%] p-3 rounded-lg bg-purple-500 text-white">
                        <p class="text-sm">\${message}</p>
                        <p class="text-xs mt-1 opacity-70">\${new Date().toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</p>
                    </div>
                </div>
            \`
            
            // 빈 메시지 제거
            if (messagesContainer.querySelector('.text-gray-500')) {
                messagesContainer.innerHTML = ''
            }
            
            messagesContainer.insertAdjacentHTML('beforeend', userMessageHtml)
            messageInput.value = ''
            
            // AI 응답 대기 표시
            const loadingHtml = \`
                <div class="text-left" id="loading-\${sessionId}">
                    <div class="inline-block max-w-[90%] p-3 rounded-lg bg-white border border-gray-200 text-gray-800">
                        <p class="text-sm"><i class="fas fa-spinner fa-spin mr-2"></i>AI가 답변 중입니다...</p>
                    </div>
                </div>
            \`
            messagesContainer.insertAdjacentHTML('beforeend', loadingHtml)
            messagesContainer.scrollTop = messagesContainer.scrollHeight
            
            try {
                // API 호출 (추가 질문은 답변이 길어서 120초 타임아웃)
                const res = await axios.post(\`/api/coaching-sessions/\${sessionId}/conversation\`, {
                    message
                }, {
                    timeout: 120000 // 120초 타임아웃 (긴 답변 대기)
                })
                
                // 로딩 제거
                document.getElementById(\`loading-\${sessionId}\`)?.remove()
                
                // AI 응답 추가
                const aiMessage = res.data.aiResponse
                const aiMessageHtml = \`
                    <div class="text-left">
                        <div class="inline-block max-w-[90%] p-3 rounded-lg bg-white border border-gray-200 text-gray-800">
                            <p class="text-sm whitespace-pre-wrap break-words">\${aiMessage}</p>
                            <p class="text-xs mt-1 opacity-70">\${new Date().toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</p>
                        </div>
                    </div>
                \`
                messagesContainer.insertAdjacentHTML('beforeend', aiMessageHtml)
                messagesContainer.scrollTop = messagesContainer.scrollHeight
                
            } catch (error) {
                // 로딩 제거
                document.getElementById(\`loading-\${sessionId}\`)?.remove()
                
                alert('오류가 발생했습니다: ' + (error.response?.data?.error || error.message))
            }
        }
        
        // 전역 함수 등록 (HTML onclick에서 호출 가능하도록)
        window.closeModal = closeModal
        
        // 로그아웃 버튼 이벤트
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('로그아웃 하시겠습니까?')) {
                localStorage.removeItem('user')
                window.location.href = '/'
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
            document.getElementById('personalityReportModal').classList.remove('hidden')
        }
        
        function closePersonalityReport() {
            document.getElementById('personalityReportModal').classList.add('hidden')
        }
        
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
                    
                    // 프로필 상태 업데이트
                    document.getElementById('personalityStatus').textContent = '성향 분석 완료 ✓'
                    document.getElementById('personalityReport').classList.remove('hidden')
                    
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
            content.innerHTML = \`
                <div class="space-y-6">
                    <div class="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-lg">
                        <h4 class="text-xl font-bold text-purple-800 mb-2">종합 성향</h4>
                        <p class="text-lg font-semibold text-gray-800">\${report.personalityType}</p>
                    </div>
                    
                    <div class="bg-white border-2 border-purple-200 p-6 rounded-lg">
                        <h4 class="text-lg font-bold text-gray-800 mb-3">
                            <i class="fas fa-chart-bar mr-2 text-purple-600"></i>세부 분석
                        </h4>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="font-semibold">에너지 방향:</span>
                                <span class="text-purple-700">\${report.energyDirection}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-semibold">정보 인식:</span>
                                <span class="text-blue-700">\${report.informationProcessing}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-semibold">의사 결정:</span>
                                <span class="text-green-700">\${report.decisionMaking}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-semibold">성취 동기:</span>
                                <span class="text-yellow-700">\${report.achievementMotivation}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-semibold">스트레스 회복:</span>
                                <span class="text-red-700">\${report.stressRecovery}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-semibold">전문성 선호:</span>
                                <span class="text-indigo-700">\${report.professionalPreference}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 p-6 rounded-lg">
                        <h4 class="text-lg font-bold text-gray-800 mb-3">
                            <i class="fas fa-star mr-2 text-yellow-500"></i>강점
                        </h4>
                        <p class="text-gray-700 whitespace-pre-wrap">\${report.strengths}</p>
                    </div>
                    
                    <div class="bg-green-50 p-6 rounded-lg">
                        <h4 class="text-lg font-bold text-gray-800 mb-3">
                            <i class="fas fa-lightbulb mr-2 text-green-600"></i>추천 영업 스타일
                        </h4>
                        <p class="text-gray-700 whitespace-pre-wrap">\${report.recommendedStyle}</p>
                    </div>
                    
                    <div class="bg-yellow-50 p-6 rounded-lg">
                        <h4 class="text-lg font-bold text-gray-800 mb-3">
                            <i class="fas fa-exclamation-triangle mr-2 text-yellow-600"></i>주의할 점
                        </h4>
                        <p class="text-gray-700 whitespace-pre-wrap">\${report.cautions}</p>
                    </div>
                    
                    <div class="bg-purple-50 p-6 rounded-lg">
                        <h4 class="text-lg font-bold text-gray-800 mb-3">
                            <i class="fas fa-graduation-cap mr-2 text-purple-600"></i>성장 방향
                        </h4>
                        <p class="text-gray-700 whitespace-pre-wrap">\${report.growthDirection}</p>
                    </div>
                </div>
            \`
            
            viewPersonalityReport()
        }
        
        // 초기 데이터 로드
        console.log('[DEBUG] Starting initial data load...')
        loadProfile()
        loadSessions()
        console.log('[DEBUG] Page setup complete')
        
        // 30초마다 자동 갱신 (새로운 코칭 세션 실시간 반영)
        setInterval(() => {
            console.log('[AUTO-REFRESH] Reloading sessions...')
            loadSessions()
        }, 30000)
    </script>
</body>
</html>
`
