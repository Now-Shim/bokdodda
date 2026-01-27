import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

// Mock Database (메모리 내 데이터)
const users = [
  { id: 1, email: 'admin@coaching.com', name: '최호석 센터장', password: 'admin123', role: 'admin', phone: '010-4652-8936' },
  { id: 2, email: 'planner01@coaching.com', name: '이영수', password: 'demo123', role: 'planner', phone: '010-1001-0001' },
  { id: 3, email: 'planner02@coaching.com', name: '박민지', password: 'demo123', role: 'planner', phone: '010-1002-0002' },
  { id: 4, email: 'planner03@coaching.com', name: '김철수', password: 'demo123', role: 'planner', phone: '010-1003-0003' },
]

const plannerProfiles = [
  { id: 1, userId: 2, personalityType: 'ESTJ', salesStyle: '분석적', experienceYears: 5, specialization: '생명보험', strengths: '체계적인 상품 설명, 논리적 설득', weaknesses: '감성적 공감 부족', totalCoachingSessions: 15, totalTrainingCompleted: 3 },
  { id: 2, userId: 3, personalityType: 'ENFP', salesStyle: '관계중심', experienceYears: 3, specialization: '손해보험', strengths: '친근한 관계 형성, 고객 니즈 파악', weaknesses: '계약 클로징 약함', totalCoachingSessions: 8, totalTrainingCompleted: 2 },
  { id: 3, userId: 4, personalityType: 'ISTJ', salesStyle: '공격적', experienceYears: 8, specialization: '생명보험', strengths: '빠른 계약 체결, 목표 달성력', weaknesses: '장기 관계 유지 어려움', totalCoachingSessions: 22, totalTrainingCompleted: 4 },
]

const coachingSessions = [
  {
    id: 1,
    plannerId: 2,
    sessionDate: '2025-01-20T10:30:00',
    context: '신규 고객과 첫 만남에서 보험 이야기를 꺼내자마자 거부감을 보였습니다. 어떻게 접근해야 할까요?',
    situationType: '신규고객',
    aiAnalysis: '고객이 보험에 대한 선입견이나 부정적 경험이 있을 가능성. 직접적인 상품 제안보다는 관계 형성 우선 필요.',
    coachingAdvice: '첫 만남에서는 보험 이야기를 최소화하고, 고객의 현재 상황과 걱정거리를 경청하세요. "어떤 부분이 가장 걱정되세요?" 같은 열린 질문으로 시작하고, 2-3회 만남 후 자연스럽게 보험 이야기를 꺼내세요.',
    recommendedApproach: '1차 만남: 관계 구축 및 경청\n2차 만남: 고객 니즈 파악\n3차 만남: 솔루션으로서 보험 소개',
    tacitKnowledgeApplied: '[30년 노하우] 급하게 계약하려는 마음이 고객에게 전달되면 신뢰가 무너집니다. 진정한 관심을 보이고 천천히 접근하세요.',
    isShared: true,
    effectivenessRating: 5,
    plannerFeedback: '정말 도움되었습니다. 천천히 접근했더니 3번째 만남에서 고객이 먼저 보험 상담을 요청했어요!'
  },
  {
    id: 2,
    plannerId: 3,
    sessionDate: '2025-01-22T14:00:00',
    context: '기존 고객이 보험료가 부담된다며 해지를 고려하고 있습니다. 어떻게 설득해야 할까요?',
    situationType: '기존고객',
    aiAnalysis: '경제적 어려움으로 인한 해지 고려. 단순 설득보다는 고객 상황 이해와 실질적 해결책 제시 필요.',
    coachingAdvice: '먼저 고객의 경제적 상황을 공감하고, 해지의 불이익을 설명하기보다는 대안을 제시하세요. 보장 축소, 보험료 감액, 납입 유예 등의 옵션을 함께 검토하세요.',
    recommendedApproach: '1. 공감 표현: "요즘 경제적으로 많이 어려우시죠?"\n2. 대안 제시: 보험료 조정 옵션 설명\n3. 핵심 보장 유지: 최소한의 보장 강조',
    tacitKnowledgeApplied: '[30년 노하우] 해지를 막으려고만 하면 고객은 더 멀어집니다. 고객 입장에서 최선의 방법을 함께 찾아주면, 나중에 상황이 나아졌을 때 다시 찾아옵니다.',
    isShared: true,
    effectivenessRating: 4,
    plannerFeedback: '고객이 감동해서 일부만 줄이고 유지하기로 했습니다. 감사합니다.'
  },
]

const trainingPrograms = [
  { id: 1, title: '신규 고객 개척 전략', description: '체계적인 신규 고객 개척 방법론과 실전 기법', category: '영업기법', difficulty: 'beginner', durationMinutes: 120, enrollmentCount: 45, completionCount: 32 },
  { id: 2, title: '클로징 기법 마스터', description: '계약 성사를 위한 고급 클로징 기법', category: '영업기법', difficulty: 'advanced', durationMinutes: 180, enrollmentCount: 28, completionCount: 15 },
  { id: 3, title: '장기 고객 관계 관리', description: '고객 이탈 방지와 지속적인 관계 유지 전략', category: '고객관리', difficulty: 'intermediate', durationMinutes: 90, enrollmentCount: 52, completionCount: 38 },
  { id: 4, title: '보험 상품 지식 심화', description: '생명보험 및 손해보험 상품의 심화 이해', category: '상품지식', difficulty: 'intermediate', durationMinutes: 150, enrollmentCount: 67, completionCount: 45 },
  { id: 5, title: '감성 영업 커뮤니케이션', description: '고객의 감성을 이해하고 공감하는 커뮤니케이션', category: '고객관리', difficulty: 'beginner', durationMinutes: 100, enrollmentCount: 41, completionCount: 29 },
]

const app = new Hono()

// CORS 설정
app.use('/api/*', cors())

// Static files
app.use('/static/*', serveStatic({ root: './' }))

// ============== API Routes ==============

// 로그인
app.post('/api/login', async (c) => {
  const { email, password } = await c.req.json()
  const user = users.find(u => u.email === email && u.password === password)
  
  if (!user) {
    return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)
  }
  
  return c.json({ 
    success: true, 
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  })
})

// 설계사 프로필 조회
app.get('/api/planner/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const user = users.find(u => u.id === id && u.role === 'planner')
  const profile = plannerProfiles.find(p => p.userId === id)
  
  if (!user || !profile) {
    return c.json({ error: '설계사를 찾을 수 없습니다.' }, 404)
  }
  
  return c.json({ user, profile })
})

// 설계사별 코칭 세션 목록
app.get('/api/coaching-sessions/:plannerId', (c) => {
  const plannerId = parseInt(c.req.param('plannerId'))
  const sessions = coachingSessions.filter(s => s.plannerId === plannerId)
  return c.json({ sessions })
})

// 새로운 코칭 요청
app.post('/api/coaching-sessions', async (c) => {
  const { plannerId, context, situationType } = await c.req.json()
  
  // 간단한 AI 코칭 로직 (실제로는 외부 AI API 호출)
  const newSession = {
    id: coachingSessions.length + 1,
    plannerId,
    sessionDate: new Date().toISOString(),
    context,
    situationType,
    aiAnalysis: '상황을 분석 중입니다. 고객의 행동 패턴과 현재 상황을 고려한 접근이 필요합니다.',
    coachingAdvice: '먼저 고객의 입장에서 생각해보세요. 그들의 진짜 니즈가 무엇인지 파악하는 것이 첫 단계입니다.',
    recommendedApproach: '1. 경청하기\n2. 공감 표현하기\n3. 해결책 제시하기',
    tacitKnowledgeApplied: '[30년 노하우] 서두르지 마세요. 고객과의 신뢰가 가장 중요합니다.',
    isShared: false,
    effectivenessRating: null,
    plannerFeedback: null
  }
  
  coachingSessions.push(newSession)
  return c.json({ success: true, session: newSession })
})

// 코칭 세션 피드백 제출
app.post('/api/coaching-sessions/:id/feedback', async (c) => {
  const id = parseInt(c.req.param('id'))
  const { effectivenessRating, feedback } = await c.req.json()
  
  const session = coachingSessions.find(s => s.id === id)
  if (!session) {
    return c.json({ error: '세션을 찾을 수 없습니다.' }, 404)
  }
  
  session.effectivenessRating = effectivenessRating
  session.plannerFeedback = feedback
  
  return c.json({ success: true, session })
})

// 교육 프로그램 목록
app.get('/api/training-programs', (c) => {
  return c.json({ programs: trainingPrograms })
})

// 관리자 대시보드 - 전체 통계
app.get('/api/admin/dashboard', (c) => {
  const totalPlanners = users.filter(u => u.role === 'planner').length
  const totalSessions = coachingSessions.length
  const sharedSessions = coachingSessions.filter(s => s.isShared).length
  const avgRating = coachingSessions
    .filter(s => s.effectivenessRating !== null)
    .reduce((sum, s) => sum + s.effectivenessRating, 0) / 
    coachingSessions.filter(s => s.effectivenessRating !== null).length
  
  return c.json({
    totalPlanners,
    totalSessions,
    sharedSessions,
    avgRating: avgRating.toFixed(1),
    totalPrograms: trainingPrograms.length
  })
})

// 관리자 - 공유된 코칭 세션 목록
app.get('/api/admin/shared-sessions', (c) => {
  const shared = coachingSessions
    .filter(s => s.isShared)
    .map(s => {
      const planner = users.find(u => u.id === s.plannerId)
      return { ...s, plannerName: planner?.name }
    })
  
  return c.json({ sessions: shared })
})

// ============== Frontend Routes ==============

// 메인 페이지 (로그인)
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>보험 설계사 AI 코칭 플랫폼</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen flex items-center justify-center">
        <div class="max-w-md w-full mx-4">
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <div class="text-center mb-8">
                    <div class="inline-block p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
                        <i class="fas fa-brain text-white text-4xl"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">AI 코칭 플랫폼</h1>
                    <p class="text-gray-600">보험 설계사를 위한 현장 코칭</p>
                </div>
                
                <form id="loginForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-envelope mr-2"></i>이메일
                        </label>
                        <input type="email" id="email" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="email@example.com">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-lock mr-2"></i>비밀번호
                        </label>
                        <input type="password" id="password" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="비밀번호">
                    </div>
                    
                    <button type="submit"
                        class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-200">
                        <i class="fas fa-sign-in-alt mr-2"></i>로그인
                    </button>
                </form>
                
                <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm font-semibold text-blue-800 mb-2">데모 계정:</p>
                    <p class="text-xs text-blue-700">관리자: admin@coaching.com / admin123</p>
                    <p class="text-xs text-blue-700">설계사: planner01@coaching.com / demo123</p>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault()
                const email = document.getElementById('email').value
                const password = document.getElementById('password').value
                
                try {
                    const response = await axios.post('/api/login', { email, password })
                    if (response.data.success) {
                        localStorage.setItem('user', JSON.stringify(response.data.user))
                        if (response.data.user.role === 'admin') {
                            window.location.href = '/admin'
                        } else {
                            window.location.href = '/planner'
                        }
                    }
                } catch (error) {
                    alert(error.response?.data?.error || '로그인 실패')
                }
            })
        </script>
    </body>
    </html>
  `)
})

// 설계사 대시보드
app.get('/planner', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>설계사 대시보드 - AI 코칭 플랫폼</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- 네비게이션 -->
        <nav class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
            <div class="max-w-7xl mx-auto flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <i class="fas fa-brain text-2xl"></i>
                    <h1 class="text-xl font-bold">AI 코칭 플랫폼</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <span id="userName" class="font-semibold"></span>
                    <button onclick="logout()" class="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100">
                        <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
                    </button>
                </div>
            </div>
        </nav>
        
        <div class="max-w-7xl mx-auto p-6">
            <!-- 프로필 카드 -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-user-circle mr-2 text-blue-600"></i>내 프로필
                </h2>
                <div id="profileInfo" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
            </div>
            
            <!-- AI 코칭 요청 -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-comments mr-2 text-purple-600"></i>AI 코칭 요청
                </h2>
                <form id="coachingForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">상황 유형</label>
                        <select id="situationType" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            <option value="신규고객">신규 고객</option>
                            <option value="기존고객">기존 고객</option>
                            <option value="대형계약">대형 계약</option>
                            <option value="클레임처리">클레임 처리</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">현장 상황 설명</label>
                        <textarea id="context" rows="4" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="현재 직면한 상황을 자세히 설명해주세요..."></textarea>
                    </div>
                    <button type="submit"
                        class="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700">
                        <i class="fas fa-paper-plane mr-2"></i>AI 코칭 받기
                    </button>
                </form>
            </div>
            
            <!-- 코칭 히스토리 -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-history mr-2 text-green-600"></i>코칭 히스토리
                </h2>
                <div id="sessionsList" class="space-y-4"></div>
            </div>
        </div>
        
        <!-- 코칭 상세 모달 -->
        <div id="sessionModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-2xl font-bold text-gray-800">코칭 상세</h3>
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
            if (!user.id || user.role !== 'planner') {
                window.location.href = '/'
            }
            
            document.getElementById('userName').textContent = user.name
            
            async function loadProfile() {
                try {
                    const res = await axios.get(\`/api/planner/\${user.id}\`)
                    const { profile } = res.data
                    document.getElementById('profileInfo').innerHTML = \`
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <p class="text-sm text-gray-600">성향</p>
                            <p class="font-bold text-blue-700">\${profile.personalityType} - \${profile.salesStyle}</p>
                        </div>
                        <div class="bg-purple-50 p-4 rounded-lg">
                            <p class="text-sm text-gray-600">경력</p>
                            <p class="font-bold text-purple-700">\${profile.experienceYears}년 (\${profile.specialization})</p>
                        </div>
                        <div class="bg-green-50 p-4 rounded-lg">
                            <p class="text-sm text-gray-600">코칭 세션</p>
                            <p class="font-bold text-green-700">\${profile.totalCoachingSessions}회</p>
                        </div>
                    \`
                } catch (error) {
                    console.error(error)
                }
            }
            
            async function loadSessions() {
                try {
                    const res = await axios.get(\`/api/coaching-sessions/\${user.id}\`)
                    const sessions = res.data.sessions
                    const html = sessions.map(s => \`
                        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer" onclick="viewSession(\${s.id})">
                            <div class="flex justify-between items-start mb-2">
                                <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">\${s.situationType}</span>
                                <span class="text-sm text-gray-500">\${new Date(s.sessionDate).toLocaleDateString('ko-KR')}</span>
                            </div>
                            <p class="text-gray-700 font-semibold mb-2">\${s.context.substring(0, 80)}...</p>
                            \${s.effectivenessRating ? \`
                                <div class="flex items-center text-yellow-500">
                                    \${' <i class="fas fa-star"></i>'.repeat(s.effectivenessRating)}
                                </div>
                            \` : ''}
                        </div>
                    \`).join('')
                    document.getElementById('sessionsList').innerHTML = html || '<p class="text-gray-500">아직 코칭 세션이 없습니다.</p>'
                } catch (error) {
                    console.error(error)
                }
            }
            
            document.getElementById('coachingForm').addEventListener('submit', async (e) => {
                e.preventDefault()
                const context = document.getElementById('context').value
                const situationType = document.getElementById('situationType').value
                
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
                    alert('오류가 발생했습니다.')
                }
            })
            
            function viewSession(id) {
                axios.get(\`/api/coaching-sessions/\${user.id}\`).then(res => {
                    const session = res.data.sessions.find(s => s.id === id)
                    if (!session) return
                    
                    document.getElementById('sessionDetail').innerHTML = \`
                        <div class="space-y-4">
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-bold text-gray-800 mb-2">상황</h4>
                                <p class="text-gray-700">\${session.context}</p>
                            </div>
                            
                            <div class="bg-blue-50 p-4 rounded-lg">
                                <h4 class="font-bold text-blue-800 mb-2"><i class="fas fa-search mr-2"></i>AI 분석</h4>
                                <p class="text-gray-700">\${session.aiAnalysis}</p>
                            </div>
                            
                            <div class="bg-purple-50 p-4 rounded-lg">
                                <h4 class="font-bold text-purple-800 mb-2"><i class="fas fa-lightbulb mr-2"></i>코칭 조언</h4>
                                <p class="text-gray-700">\${session.coachingAdvice}</p>
                            </div>
                            
                            <div class="bg-green-50 p-4 rounded-lg">
                                <h4 class="font-bold text-green-800 mb-2"><i class="fas fa-route mr-2"></i>추천 접근법</h4>
                                <pre class="text-gray-700 whitespace-pre-wrap font-sans">\${session.recommendedApproach}</pre>
                            </div>
                            
                            <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                                <h4 class="font-bold text-yellow-800 mb-2"><i class="fas fa-medal mr-2"></i>30년 현장 노하우</h4>
                                <p class="text-gray-700">\${session.tacitKnowledgeApplied}</p>
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
                                        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
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
  `)
})

// 관리자 대시보드
app.get('/admin', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>관리자 대시보드 - AI 코칭 플랫폼</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <!-- 네비게이션 -->
        <nav class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow-lg">
            <div class="max-w-7xl mx-auto flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <i class="fas fa-shield-alt text-2xl"></i>
                    <h1 class="text-xl font-bold">관리자 대시보드</h1>
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
            <!-- 통계 카드 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm">참여 설계사</p>
                            <p id="totalPlanners" class="text-3xl font-bold text-blue-600">0</p>
                        </div>
                        <i class="fas fa-users text-blue-600 text-3xl"></i>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm">총 코칭 세션</p>
                            <p id="totalSessions" class="text-3xl font-bold text-purple-600">0</p>
                        </div>
                        <i class="fas fa-comments text-purple-600 text-3xl"></i>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm">공유된 세션</p>
                            <p id="sharedSessions" class="text-3xl font-bold text-green-600">0</p>
                        </div>
                        <i class="fas fa-share-alt text-green-600 text-3xl"></i>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm">평균 만족도</p>
                            <p id="avgRating" class="text-3xl font-bold text-yellow-600">0</p>
                        </div>
                        <i class="fas fa-star text-yellow-600 text-3xl"></i>
                    </div>
                </div>
            </div>
            
            <!-- 공유된 코칭 세션 -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-share-alt mr-2 text-green-600"></i>공유된 코칭 세션
                </h2>
                <div id="sharedSessionsList" class="space-y-4"></div>
            </div>
            
            <!-- 교육 프로그램 -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-graduation-cap mr-2 text-blue-600"></i>교육 프로그램
                </h2>
                <div id="programsList" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            if (!user.id || user.role !== 'admin') {
                window.location.href = '/'
            }
            
            document.getElementById('userName').textContent = user.name
            
            async function loadDashboard() {
                try {
                    const res = await axios.get('/api/admin/dashboard')
                    const data = res.data
                    document.getElementById('totalPlanners').textContent = data.totalPlanners
                    document.getElementById('totalSessions').textContent = data.totalSessions
                    document.getElementById('sharedSessions').textContent = data.sharedSessions
                    document.getElementById('avgRating').textContent = data.avgRating
                } catch (error) {
                    console.error(error)
                }
            }
            
            async function loadSharedSessions() {
                try {
                    const res = await axios.get('/api/admin/shared-sessions')
                    const sessions = res.data.sessions
                    const html = sessions.map(s => \`
                        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2">\${s.situationType}</span>
                                    <span class="text-sm font-semibold text-gray-700">\${s.plannerName}</span>
                                </div>
                                <span class="text-sm text-gray-500">\${new Date(s.sessionDate).toLocaleDateString('ko-KR')}</span>
                            </div>
                            <p class="text-gray-700 mb-2">\${s.context.substring(0, 100)}...</p>
                            \${s.effectivenessRating ? \`
                                <div class="flex items-center text-yellow-500">
                                    \${' <i class="fas fa-star"></i>'.repeat(s.effectivenessRating)}
                                    <span class="ml-2 text-sm text-gray-600">\${s.plannerFeedback ? '"' + s.plannerFeedback.substring(0, 50) + '..."' : ''}</span>
                                </div>
                            \` : ''}
                        </div>
                    \`).join('')
                    document.getElementById('sharedSessionsList').innerHTML = html || '<p class="text-gray-500">공유된 세션이 없습니다.</p>'
                } catch (error) {
                    console.error(error)
                }
            }
            
            async function loadPrograms() {
                try {
                    const res = await axios.get('/api/training-programs')
                    const programs = res.data.programs
                    const html = programs.map(p => \`
                        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                            <h3 class="font-bold text-gray-800 mb-2">\${p.title}</h3>
                            <p class="text-sm text-gray-600 mb-3">\${p.description}</p>
                            <div class="flex justify-between text-sm">
                                <span class="text-blue-600"><i class="fas fa-users mr-1"></i>\${p.enrollmentCount}명 수강</span>
                                <span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>\${p.completionCount}명 완료</span>
                            </div>
                        </div>
                    \`).join('')
                    document.getElementById('programsList').innerHTML = html
                } catch (error) {
                    console.error(error)
                }
            }
            
            function logout() {
                localStorage.removeItem('user')
                window.location.href = '/'
            }
            
            loadDashboard()
            loadSharedSessions()
            loadPrograms()
        </script>
    </body>
    </html>
  `)
})

export default app
