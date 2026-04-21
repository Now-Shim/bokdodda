// 설계사 페이지 HTML
export const plannerPageHTML = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                <button onclick="logout()" class="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-gray-100">
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
            <div id="profileInfo" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
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
                <span id="loading" class="ml-4 hidden"><div class="loading"></div> AI가 분석 중입니다...</span>
            </form>
        </div>
        
        <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-history mr-2 text-green-600"></i>코칭 히스토리
            </h2>
            <div id="sessionsList" class="space-y-4"></div>
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
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (!user.id || user.role !== 'planner') window.location.href = '/'
        
        document.getElementById('userName').textContent = user.name
        
        async function loadProfile() {
            try {
                const res = await axios.get(\`/api/planner/\${user.id}\`)
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
            } catch (error) { console.error(error) }
        }
        
        async function loadSessions() {
            try {
                const res = await axios.get(\`/api/coaching-sessions/\${user.id}\`)
                const sessions = res.data.sessions
                const html = sessions.map(s => \`
                    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition" onclick="viewSession(\${s.id})">
                        <div class="flex justify-between items-start mb-2">
                            <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">\${s.situationType}</span>
                            <span class="text-sm text-gray-500">\${new Date(s.sessionDate).toLocaleDateString('ko-KR')}</span>
                        </div>
                        <p class="text-gray-700 font-semibold mb-2">\${s.context.substring(0, 100)}\${s.context.length > 100 ? '...' : ''}</p>
                        \${s.effectivenessRating ? \`
                            <div class="flex items-center text-yellow-500">
                                \${' <i class="fas fa-star"></i>'.repeat(s.effectivenessRating)}
                            </div>
                        \` : '<span class="text-gray-400 text-sm">피드백 대기 중</span>'}
                    </div>
                \`).join('')
                document.getElementById('sessionsList').innerHTML = html || '<p class="text-gray-500">아직 코칭 세션이 없습니다.</p>'
            } catch (error) { console.error(error) }
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
                })
                alert('AI 코칭이 완료되었습니다!')
                document.getElementById('context').value = ''
                loadSessions()
                viewSession(res.data.session.id)
            } catch (error) {
                alert('오류가 발생했습니다: ' + (error.response?.data?.error || error.message))
            } finally {
                submitBtn.disabled = false
                loading.classList.add('hidden')
            }
        })
        
        function viewSession(id) {
            axios.get(\`/api/coaching-sessions/\${user.id}\`).then(res => {
                const session = res.data.sessions.find(s => s.id === id)
                if (!session) return
                
                document.getElementById('sessionDetail').innerHTML = \`
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
                                    <p class="text-gray-800 ml-6">\${session.analyzedQuestion || session.context}</p>
                                </div>
                                
                                <!-- 카테고리 -->
                                <div class="bg-white p-4 rounded-lg shadow-sm">
                                    <h5 class="font-semibold text-blue-800 mb-2 flex items-center">
                                        <i class="fas fa-tag mr-2"></i>카테고리
                                    </h5>
                                    <span class="ml-6 inline-block bg-blue-600 text-white px-4 py-2 rounded-full font-semibold">
                                        \${session.category || session.situationType}
                                    </span>
                                </div>
                                
                                <!-- 핵심 포인트 -->
                                <div class="bg-white p-4 rounded-lg shadow-sm">
                                    <h5 class="font-semibold text-blue-800 mb-2 flex items-center">
                                        <i class="fas fa-bullseye mr-2"></i>핵심 포인트
                                    </h5>
                                    <div class="ml-6 text-gray-800 whitespace-pre-wrap">\${session.keyPoints || session.aiAnalysis}</div>
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
                                    <div class="ml-6 text-gray-800 whitespace-pre-wrap">\${session.coachingPoint || session.coachingAdvice}</div>
                                </div>
                                
                                <!-- 코칭 근거 -->
                                <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                                    <h5 class="font-semibold text-purple-800 mb-2 flex items-center">
                                        <i class="fas fa-file-contract mr-2"></i>코칭 근거 (약관/법률/인문학적 근거)
                                    </h5>
                                    <div class="ml-6 text-gray-800 whitespace-pre-wrap">\${session.coachingEvidence || '근거 분석 중...'}</div>
                                </div>
                                
                                <!-- 화법 (4~5번 대화) -->
                                <div class="bg-white p-4 rounded-lg shadow-sm">
                                    <h5 class="font-semibold text-purple-800 mb-2 flex items-center">
                                        <i class="fas fa-comments mr-2"></i>화법 (고객과의 대화 시나리오)
                                    </h5>
                                    <div class="ml-6 bg-gray-50 p-4 rounded border border-purple-200">
                                        <pre class="whitespace-pre-wrap font-sans text-sm text-gray-800">\${session.dialogue || session.dialogueScript || '대화 스크립트 생성 중...'}</pre>
                                    </div>
                                </div>
                                
                                <!-- 학습 필요 내용 -->
                                <div class="bg-white p-4 rounded-lg shadow-sm">
                                    <h5 class="font-semibold text-purple-800 mb-2 flex items-center">
                                        <i class="fas fa-book-reader mr-2"></i>학습 필요 내용
                                    </h5>
                                    <div class="ml-6 text-gray-800 whitespace-pre-wrap">\${session.learningNeeds || session.requiredKnowledge || '추가 학습 없음'}</div>
                                </div>
                                
                                <!-- 구체적인 행동지침 -->
                                <div class="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                                    <h5 class="font-semibold text-purple-800 mb-2 flex items-center">
                                        <i class="fas fa-tasks mr-2"></i>구체적인 행동지침 (다양한 시도 방법)
                                    </h5>
                                    <div class="ml-6 text-gray-800 whitespace-pre-wrap">\${session.actionGuidelines || session.recommendedApproach}</div>
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
                            <p class="text-gray-800 italic">\${session.tacitKnowledgeApplied || '[내부 참조용 - 30년 노하우 기반 코칭]'}</p>
                        </div>
                        
                        \${!session.effectivenessRating ? \`
                            <div class="bg-white p-4 rounded-lg border-2 border-gray-200">
                                <h4 class="font-bold text-gray-800 mb-2">피드백 남기기</h4>
                                <form id="feedbackForm" class="space-y-3">
                                    <div>
                                        <label class="block text-sm font-semibold mb-1">효과성 평가</label>
                                        <select id="rating" class="w-full px-3 py-2 border rounded-lg">
                                            <option value="5">⭐⭐⭐⭐⭐ 매우 도움됨</option>
                                            <option value="4">⭐⭐⭐⭐ 도움됨</option>
                                            <option value="3">⭐⭐⭐ 보통</option>
                                            <option value="2">⭐⭐ 별로</option>
                                            <option value="1">⭐ 도움 안됨</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-semibold mb-1">후기</label>
                                        <textarea id="feedback" rows="2" class="w-full px-3 py-2 border rounded-lg"></textarea>
                                    </div>
                                    <button type="submit" class="gradient-bg text-white px-4 py-2 rounded-lg hover:opacity-90">
                                        제출하기
                                    </button>
                                </form>
                            </div>
                        \` : \`
                            <div class="bg-green-100 p-4 rounded-lg">
                                <h4 class="font-bold text-green-800 mb-2">내 피드백</h4>
                                <div class="flex items-center text-yellow-500 mb-2">
                                    \${' <i class="fas fa-star"></i>'.repeat(session.effectivenessRating)}
                                </div>
                                <p class="text-gray-700">\${session.plannerFeedback || '없음'}</p>
                            </div>
                        \`}
                    </div>
                \`
                
                if (!session.effectivenessRating) {
                    document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
                        e.preventDefault()
                        const rating = parseInt(document.getElementById('rating').value)
                        const feedback = document.getElementById('feedback').value
                        
                        try {
                            await axios.post(\`/api/coaching-sessions/\${id}/feedback\`, {
                                effectivenessRating: rating,
                                feedback
                            })
                            alert('피드백이 등록되었습니다!')
                            closeModal()
                            loadSessions()
                        } catch (error) {
                            alert('오류가 발생했습니다.')
                        }
                    })
                }
                
                document.getElementById('sessionModal').classList.remove('hidden')
            })
        }
        
        function closeModal() {
            document.getElementById('sessionModal').classList.add('hidden')
        }
        
        function logout() {
            localStorage.removeItem('user')
            window.location.href = '/'
        }
        
        loadProfile()
        loadSessions()
    </script>
</body>
</html>
`
