import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { generateAICoaching } from './ai-helper'
import { users, plannerProfiles, coachingSessions, trainingPrograms, knowledgeBase } from './data'
import type { CoachingSession, KnowledgeBase } from './data'

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
  // 설계사는 내부 노트와 Director 피드백을 볼 수 없음
  const sanitizedSessions = sessions.map(s => ({
    ...s,
    managerNote: undefined,
    directorFeedback: undefined,
    directorRating: undefined,
  }))
  return c.json({ sessions: sanitizedSessions })
})

// 새로운 코칭 요청 (AI 실시간 연동!)
app.post('/api/coaching-sessions', async (c) => {
  const { plannerId, context, situationType } = await c.req.json()
  
  // 설계사 프로필 가져오기
  const user = users.find(u => u.id === plannerId)
  const profile = plannerProfiles.find(p => p.userId === plannerId)
  
  if (!user || !profile) {
    return c.json({ error: '설계사를 찾을 수 없습니다.' }, 404)
  }
  
  try {
    // AI 코칭 생성
    const aiResponse = await generateAICoaching({
      context,
      situationType,
      plannerProfile: {
        name: user.name,
        personalityType: profile.personalityType,
        salesStyle: profile.salesStyle,
        experienceYears: profile.experienceYears,
        specialization: profile.specialization,
        strengths: profile.strengths,
        weaknesses: profile.weaknesses,
      },
      env: c.env // Cloudflare env binding 전달
    })
    
    const newSession: CoachingSession = {
      id: coachingSessions.length + 1,
      plannerId,
      sessionDate: new Date().toISOString(),
      context,
      situationType,
      aiAnalysis: aiResponse.aiAnalysis,
      coachingAdvice: aiResponse.coachingAdvice,
      recommendedApproach: aiResponse.recommendedApproach,
      tacitKnowledgeApplied: aiResponse.tacitKnowledge,
      isShared: false,
      isValidated: false,
      useForLearning: false,
    }
    
    coachingSessions.push(newSession)
    
    // 프로필 통계 업데이트
    profile.totalCoachingSessions++
    
    return c.json({ success: true, session: newSession })
  } catch (error) {
    console.error('AI 코칭 오류:', error)
    return c.json({ error: 'AI 코칭 생성 중 오류가 발생했습니다.' }, 500)
  }
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

// 관리자 - 전체 현황
app.get('/api/manager/overview', (c) => {
  const totalPlanners = users.filter(u => u.role === 'planner').length
  const totalSessions = coachingSessions.length
  const totalNotes = coachingSessions.filter(s => s.managerNote).length
  
  // 최근 세션 (최근 5개)
  const recentSessions = coachingSessions
    .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
    .slice(0, 5)
    .map(s => {
      const planner = users.find(u => u.id === s.plannerId)
      return { ...s, plannerName: planner?.name }
    })
  
  // 주의가 필요한 설계사 (경력 1년 이하 또는 낮은 평가)
  const attentionPlanners = users
    .filter(u => u.role === 'planner')
    .map(u => {
      const profile = plannerProfiles.find(p => p.userId === u.id)
      const sessions = coachingSessions.filter(s => s.plannerId === u.id)
      const avgRating = sessions
        .filter(s => s.effectivenessRating)
        .reduce((sum, s) => sum + (s.effectivenessRating || 0), 0) / 
        (sessions.filter(s => s.effectivenessRating).length || 1)
      
      let reason = ''
      if (profile && profile.experienceYears <= 1) {
        reason = '신규 설계사 (경력 1년 이하)'
      } else if (avgRating < 3) {
        reason = '코칭 효과성 낮음 (평균 3점 미만)'
      } else if (sessions.length < 3) {
        reason = '코칭 참여 부족'
      }
      
      return reason ? { id: u.id, name: u.name, reason } : null
    })
    .filter(p => p !== null)
    .slice(0, 5)
  
  return c.json({
    totalPlanners,
    totalSessions,
    totalNotes,
    recentSessions,
    attentionPlanners
  })
})

// 관리자 - 전체 세션 목록 (내부 노트 포함)
app.get('/api/manager/sessions', (c) => {
  const sessions = coachingSessions.map(s => {
    const planner = users.find(u => u.id === s.plannerId)
    return { ...s, plannerName: planner?.name }
  })
  
  const planners = users
    .filter(u => u.role === 'planner')
    .map(u => ({ id: u.id, name: u.name }))
  
  return c.json({ sessions, planners })
})

// 관리자 - 설계사 목록
app.get('/api/manager/planners', (c) => {
  const planners = users
    .filter(u => u.role === 'planner')
    .map(u => {
      const profile = plannerProfiles.find(p => p.userId === u.id)
      return { 
        userId: u.id,
        name: u.name, 
        email: u.email, 
        phone: u.phone,
        ...profile 
      }
    })
  
  return c.json({ planners })
})

// 관리자 - 내부 노트 작성
app.post('/api/manager/note', async (c) => {
  const { sessionId, managerNote } = await c.req.json()
  
  const session = coachingSessions.find(s => s.id === sessionId)
  if (!session) {
    return c.json({ error: '세션을 찾을 수 없습니다.' }, 404)
  }
  
  session.managerNote = managerNote
  
  return c.json({ success: true, session })
})

// Director - 자료 업로드
app.post('/api/director/knowledge', async (c) => {
  const { title, category, content, priority } = await c.req.json()
  
  const newKnowledge: KnowledgeBase = {
    id: knowledgeBase.length + 1,
    title,
    category,
    content,
    priority: priority || false,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 1 // Director ID
  }
  
  knowledgeBase.push(newKnowledge)
  
  return c.json({ success: true, knowledge: newKnowledge })
})

// Director - 자료 목록 조회
app.get('/api/director/knowledge', (c) => {
  return c.json({ knowledge: knowledgeBase })
})

// Director - 자료 삭제
app.delete('/api/director/knowledge/:index', (c) => {
  const index = parseInt(c.req.param('index'))
  
  if (index < 0 || index >= knowledgeBase.length) {
    return c.json({ error: '자료를 찾을 수 없습니다.' }, 404)
  }
  
  knowledgeBase.splice(index, 1)
  
  return c.json({ success: true })
})

// Director - 전체 세션 목록 (모든 필드 포함)
app.get('/api/director/sessions', (c) => {
  const sessions = coachingSessions.map(s => {
    const planner = users.find(u => u.id === s.plannerId)
    const profile = plannerProfiles.find(p => p.userId === s.plannerId)
    return { ...s, plannerName: planner?.name, plannerProfile: profile }
  })
  
  const planners = users
    .filter(u => u.role === 'planner')
    .map(u => ({ id: u.id, name: u.name }))
  
  return c.json({ sessions, planners })
})

// Director - 피드백 작성
app.post('/api/director/feedback', async (c) => {
  const { sessionId, directorFeedback, directorRating, useForLearning } = await c.req.json()
  
  const session = coachingSessions.find(s => s.id === sessionId)
  if (!session) {
    return c.json({ error: '세션을 찾을 수 없습니다.' }, 404)
  }
  
  session.directorFeedback = directorFeedback
  session.directorRating = directorRating
  session.isValidated = true
  session.useForLearning = useForLearning || false
  
  return c.json({ success: true, session })
})

// Director - 통계 대시보드
app.get('/api/director/dashboard', (c) => {
  const totalPlanners = users.filter(u => u.role === 'planner').length
  const totalSessions = coachingSessions.length
  const validatedSessions = coachingSessions.filter(s => s.isValidated).length
  const learningData = coachingSessions.filter(s => s.useForLearning).length
  
  const sessionsWithRating = coachingSessions.filter(s => s.effectivenessRating !== undefined)
  const avgEffectiveness = sessionsWithRating.length > 0
    ? (sessionsWithRating.reduce((sum, s) => sum + (s.effectivenessRating || 0), 0) / sessionsWithRating.length).toFixed(1)
    : '0.0'
  
  // 설계사별 세션 수
  const sessionsByPlanner = users
    .filter(u => u.role === 'planner')
    .map(u => ({
      id: u.id,
      name: u.name,
      count: coachingSessions.filter(s => s.plannerId === u.id).length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  
  // 효과성 분포
  const effectiveness5 = coachingSessions.filter(s => s.effectivenessRating === 5).length
  const effectiveness4 = coachingSessions.filter(s => s.effectivenessRating === 4).length
  const effectiveness3 = coachingSessions.filter(s => s.effectivenessRating && s.effectivenessRating <= 3).length
  
  // 우수 사례 (재학습 데이터)
  const excellentCases = coachingSessions
    .filter(s => s.useForLearning)
    .sort((a, b) => (b.directorRating || 0) - (a.directorRating || 0))
    .slice(0, 5)
    .map(s => {
      const planner = users.find(u => u.id === s.plannerId)
      return {
        ...s,
        plannerName: planner?.name
      }
    })
  
  return c.json({
    totalPlanners,
    totalSessions,
    validatedSessions,
    learningData,
    avgEffectiveness,
    sessionsByPlanner,
    effectiveness5,
    effectiveness4,
    effectiveness3,
    excellentCases,
    totalPrograms: trainingPrograms.length
  })
})

// 교육 프로그램 목록
app.get('/api/training-programs', (c) => {
  return c.json({ programs: trainingPrograms })
})

// 전체 설계사 목록 (관리자/Director용)
app.get('/api/planners', (c) => {
  const planners = users
    .filter(u => u.role === 'planner')
    .map(u => {
      const profile = plannerProfiles.find(p => p.userId === u.id)
      return { ...u, profile }
    })
  return c.json({ planners })
})

export default app

// ============== Frontend Routes ==============

// 로그인 페이지
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>북돋다 - 보험 설계사 AI 코칭 플랫폼</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            .gradient-bg {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
        </style>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen flex items-center justify-center">
        <div class="max-w-md w-full mx-4">
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <div class="text-center mb-8">
                    <div class="inline-block p-4 gradient-bg rounded-full mb-4">
                        <i class="fas fa-book-open text-white text-4xl"></i>
                    </div>
                    <h1 class="text-4xl font-bold text-gray-800 mb-2">북돋다</h1>
                    <p class="text-gray-600">Book | Jar | All</p>
                    <p class="text-sm text-gray-500 mt-2">보험 설계사를 위한 AI 코칭 플랫폼</p>
                </div>
                
                <form id="loginForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-envelope mr-2"></i>이메일
                        </label>
                        <input type="email" id="email" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="email@bukdotda.com">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            <i class="fas fa-lock mr-2"></i>비밀번호
                        </label>
                        <input type="password" id="password" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="비밀번호">
                    </div>
                    
                    <button type="submit"
                        class="w-full gradient-bg text-white font-bold py-3 rounded-lg hover:opacity-90 transition duration-200">
                        <i class="fas fa-sign-in-alt mr-2"></i>로그인
                    </button>
                </form>
                
                <div class="mt-6 p-4 bg-purple-50 rounded-lg">
                    <p class="text-sm font-semibold text-purple-800 mb-2">데모 계정:</p>
                    <p class="text-xs text-purple-700">Director: director@bukdotda.com / director123</p>
                    <p class="text-xs text-purple-700">관리자: manager@bukdotda.com / manager123</p>
                    <p class="text-xs text-purple-700">설계사: planner01@bukdotda.com / demo123</p>
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
                        if (response.data.user.role === 'director') {
                            window.location.href = '/director'
                        } else if (response.data.user.role === 'manager') {
                            window.location.href = '/manager'
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

// 설계사 페이지
// 설계사 페이지
app.get('/planner', async (c) => {
  const { plannerPageHTML } = await import('./pages-planner')
  return c.html(plannerPageHTML)
})

// 관리자 페이지
app.get('/manager', async (c) => {
  const { renderManagerPage } = await import('./pages-manager')
  return renderManagerPage(c)
})

// Director 페이지
app.get('/director', async (c) => {
  const { renderDirectorPage } = await import('./pages-director')
  return renderDirectorPage(c)
})
