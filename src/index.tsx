import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// ===== API Routes =====

// 로그인 (간단한 데모용 - 실제로는 JWT 등 사용)
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  
  const user = await c.env.DB.prepare(`
    SELECT id, email, name, role FROM users 
    WHERE email = ? AND password_hash = ?
  `).bind(email, `demo_hash_${password}`).first()
  
  if (!user) {
    return c.json({ error: '이메일 또는 비밀번호가 잘못되었습니다' }, 401)
  }
  
  return c.json({ user })
})

// 설계사 대시보드 데이터
app.get('/api/planner/dashboard/:userId', async (c) => {
  const userId = c.req.param('userId')
  
  // 프로필 정보
  const profile = await c.env.DB.prepare(`
    SELECT u.*, p.* 
    FROM users u
    LEFT JOIN planner_profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `).bind(userId).first()
  
  // 최근 코칭 세션
  const recentSessions = await c.env.DB.prepare(`
    SELECT * FROM coaching_sessions 
    WHERE planner_id = ? 
    ORDER BY session_date DESC 
    LIMIT 5
  `).bind(userId).all()
  
  // 진행 중인 교육
  const ongoingTraining = await c.env.DB.prepare(`
    SELECT e.*, t.title, t.category, t.duration_minutes
    FROM training_enrollments e
    JOIN training_programs t ON e.program_id = t.id
    WHERE e.planner_id = ? AND e.status IN ('enrolled', 'in_progress')
    ORDER BY e.enrolled_at DESC
  `).bind(userId).all()
  
  // 완료한 교육 수
  const completedTrainingCount = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM training_enrollments 
    WHERE planner_id = ? AND status = 'completed'
  `).bind(userId).first()
  
  return c.json({
    profile,
    recentSessions: recentSessions.results,
    ongoingTraining: ongoingTraining.results,
    stats: {
      totalCoachingSessions: profile.total_coaching_sessions || 0,
      completedTraining: completedTrainingCount.count || 0
    }
  })
})

// 새로운 코칭 요청
app.post('/api/coaching/new', async (c) => {
  const { planner_id, context, situation_type } = await c.req.json()
  
  // AI 분석 (실제로는 OpenAI API 등 사용, 여기서는 데모)
  const aiAnalysis = `상황 분석: ${situation_type}에 대한 ${context.substring(0, 50)}... 상황입니다.`
  const coachingAdvice = `[AI 코칭] 이 상황에서는 먼저 고객의 입장을 충분히 이해하고 공감하는 것이 중요합니다. 30년 현장 경험에 비추어 볼 때, 이런 상황에서는...`
  const recommendedApproach = `1단계: 경청과 공감\n2단계: 니즈 파악\n3단계: 솔루션 제시`
  const tacitKnowledge = `[30년 노하우] 이런 상황에서 경험상 중요한 것은 성급하게 답을 주려 하지 말고, 고객이 스스로 깨닫도록 돕는 것입니다.`
  
  const result = await c.env.DB.prepare(`
    INSERT INTO coaching_sessions 
    (planner_id, context, situation_type, ai_analysis, coaching_advice, recommended_approach, tacit_knowledge_applied)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    planner_id, 
    context, 
    situation_type, 
    aiAnalysis, 
    coachingAdvice, 
    recommendedApproach, 
    tacitKnowledge
  ).run()
  
  // 설계사 프로필 통계 업데이트
  await c.env.DB.prepare(`
    UPDATE planner_profiles 
    SET total_coaching_sessions = total_coaching_sessions + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).bind(planner_id).run()
  
  return c.json({ 
    success: true, 
    sessionId: result.meta.last_row_id,
    coaching: {
      ai_analysis: aiAnalysis,
      coaching_advice: coachingAdvice,
      recommended_approach: recommendedApproach,
      tacit_knowledge_applied: tacitKnowledge
    }
  })
})

// 코칭 피드백 제출
app.post('/api/coaching/feedback', async (c) => {
  const { session_id, feedback, rating, is_shared } = await c.req.json()
  
  await c.env.DB.prepare(`
    UPDATE coaching_sessions 
    SET planner_feedback = ?, 
        effectiveness_rating = ?,
        is_shared = ?
    WHERE id = ?
  `).bind(feedback, rating, is_shared ? 1 : 0, session_id).run()
  
  // 플랫폼 학습 데이터에 추가 (재학습용)
  if (rating >= 4) {
    const session = await c.env.DB.prepare(`
      SELECT * FROM coaching_sessions WHERE id = ?
    `).bind(session_id).first()
    
    await c.env.DB.prepare(`
      INSERT INTO platform_learning_data 
      (situation_context, coaching_provided, effectiveness_score, planner_satisfaction, source_session_id, is_validated)
      VALUES (?, ?, ?, ?, ?, 1)
    `).bind(
      session.context,
      session.coaching_advice,
      rating / 5.0,
      rating,
      session_id
    ).run()
  }
  
  return c.json({ success: true })
})

// 모든 교육 프로그램 조회
app.get('/api/training/programs', async (c) => {
  const programs = await c.env.DB.prepare(`
    SELECT * FROM training_programs 
    WHERE is_active = 1 
    ORDER BY category, difficulty
  `).all()
  
  return c.json({ programs: programs.results })
})

// 교육 프로그램 등록
app.post('/api/training/enroll', async (c) => {
  const { planner_id, program_id } = await c.req.json()
  
  try {
    await c.env.DB.prepare(`
      INSERT INTO training_enrollments (planner_id, program_id, status, progress_percent)
      VALUES (?, ?, 'enrolled', 0)
    `).bind(planner_id, program_id).run()
    
    // 교육 프로그램 등록 수 증가
    await c.env.DB.prepare(`
      UPDATE training_programs 
      SET enrollment_count = enrollment_count + 1 
      WHERE id = ?
    `).bind(program_id).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: '이미 등록된 프로그램입니다' }, 400)
  }
})

// 관리자 대시보드 데이터
app.get('/api/admin/dashboard', async (c) => {
  // 전체 설계사 수
  const plannerCount = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM users WHERE role = 'planner'
  `).first()
  
  // 공유된 코칭 세션
  const sharedSessions = await c.env.DB.prepare(`
    SELECT cs.*, u.name as planner_name, u.email
    FROM coaching_sessions cs
    JOIN users u ON cs.planner_id = u.id
    WHERE cs.is_shared = 1
    ORDER BY cs.session_date DESC
    LIMIT 20
  `).all()
  
  // 인사이트
  const insights = await c.env.DB.prepare(`
    SELECT i.*, cs.context, u.name as planner_name
    FROM admin_insights i
    JOIN coaching_sessions cs ON i.coaching_session_id = cs.id
    JOIN users u ON cs.planner_id = u.id
    ORDER BY i.created_at DESC
    LIMIT 10
  `).all()
  
  // 플랫폼 통계
  const totalSessions = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM coaching_sessions
  `).first()
  
  const avgEffectiveness = await c.env.DB.prepare(`
    SELECT AVG(effectiveness_rating) as avg FROM coaching_sessions 
    WHERE effectiveness_rating IS NOT NULL
  `).first()
  
  return c.json({
    stats: {
      totalPlanners: plannerCount.count,
      totalCoachingSessions: totalSessions.count,
      averageEffectiveness: avgEffectiveness.avg || 0
    },
    sharedSessions: sharedSessions.results,
    insights: insights.results
  })
})

// 관리자: 인사이트 생성
app.post('/api/admin/insights', async (c) => {
  const { coaching_session_id, admin_id, insight_type, insight_content, recommended_programs, priority } = await c.req.json()
  
  await c.env.DB.prepare(`
    INSERT INTO admin_insights 
    (coaching_session_id, admin_id, insight_type, insight_content, recommended_programs, priority)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    coaching_session_id,
    admin_id,
    insight_type,
    insight_content,
    recommended_programs,
    priority
  ).run()
  
  return c.json({ success: true })
})

// 설계사 목록 (관리자용)
app.get('/api/admin/planners', async (c) => {
  const planners = await c.env.DB.prepare(`
    SELECT u.*, p.*
    FROM users u
    LEFT JOIN planner_profiles p ON u.id = p.user_id
    WHERE u.role = 'planner'
    ORDER BY u.name
  `).all()
  
  return c.json({ planners: planners.results })
})

// ===== HTML Pages =====

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
        <style>
            .gradient-bg {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
        </style>
    </head>
    <body class="bg-gray-100">
        <div class="min-h-screen flex items-center justify-center gradient-bg">
            <div class="bg-white p-8 rounded-lg shadow-2xl w-96">
                <div class="text-center mb-8">
                    <i class="fas fa-brain text-6xl text-purple-600 mb-4"></i>
                    <h1 class="text-2xl font-bold text-gray-800">AI 코칭 플랫폼</h1>
                    <p class="text-gray-600 mt-2">보험 설계사 전문 교육 시스템</p>
                </div>
                
                <form id="loginForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-envelope mr-2"></i>이메일
                        </label>
                        <input type="email" id="email" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="example@coaching.com">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            <i class="fas fa-lock mr-2"></i>비밀번호
                        </label>
                        <input type="password" id="password" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="••••••••">
                    </div>
                    
                    <button type="submit" 
                        class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-200 font-semibold">
                        <i class="fas fa-sign-in-alt mr-2"></i>로그인
                    </button>
                </form>
                
                <div class="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
                    <p class="font-semibold text-blue-800 mb-2">데모 계정:</p>
                    <p class="text-blue-700">설계사: planner01@coaching.com / 01</p>
                    <p class="text-blue-700">관리자: admin@coaching.com / admin</p>
                </div>
                
                <div id="errorMessage" class="mt-4 p-3 bg-red-100 text-red-700 rounded-lg hidden">
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const errorDiv = document.getElementById('errorMessage');
                
                try {
                    const response = await axios.post('/api/auth/login', { email, password });
                    const { user } = response.data;
                    
                    // 사용자 정보 저장
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    // 역할에 따라 리다이렉트
                    if (user.role === 'planner') {
                        window.location.href = '/planner';
                    } else if (user.role === 'admin') {
                        window.location.href = '/admin';
                    }
                } catch (error) {
                    errorDiv.textContent = error.response?.data?.error || '로그인에 실패했습니다';
                    errorDiv.classList.remove('hidden');
                }
            });
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
    <title>설계사 대시보드</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <nav class="bg-purple-600 text-white p-4">
        <div class="container mx-auto flex justify-between items-center">
            <div class="flex items-center">
                <i class="fas fa-brain text-2xl mr-3"></i>
                <span class="text-xl font-bold">AI 코칭 플랫폼</span>
            </div>
            <div>
                <span id="userName" class="mr-4"></span>
                <button onclick="logout()" class="bg-purple-700 px-4 py-2 rounded hover:bg-purple-800">
                    <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
                </button>
            </div>
        </div>
    </nav>

    <div class="container mx-auto p-6">
        <h1 class="text-3xl font-bold mb-6">나의 대시보드</h1>
        
        <!-- 통계 카드 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="flex items-center">
                    <i class="fas fa-comments text-4xl text-blue-500 mr-4"></i>
                    <div>
                        <p class="text-gray-600">총 코칭 세션</p>
                        <p id="totalSessions" class="text-2xl font-bold">-</p>
                    </div>
                </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="flex items-center">
                    <i class="fas fa-graduation-cap text-4xl text-green-500 mr-4"></i>
                    <div>
                        <p class="text-gray-600">완료한 교육</p>
                        <p id="completedTraining" class="text-2xl font-bold">-</p>
                    </div>
                </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="flex items-center">
                    <i class="fas fa-chart-line text-4xl text-purple-500 mr-4"></i>
                    <div>
                        <p class="text-gray-600">평균 효과성</p>
                        <p id="avgEffectiveness" class="text-2xl font-bold">-</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 새 코칭 요청 버튼 -->
        <button onclick="showCoachingModal()" 
            class="bg-purple-600 text-white px-6 py-3 rounded-lg mb-6 hover:bg-purple-700 text-lg font-semibold">
            <i class="fas fa-plus-circle mr-2"></i>새 코칭 요청하기
        </button>

        <!-- 최근 코칭 세션 -->
        <div class="bg-white p-6 rounded-lg shadow mb-6">
            <h2 class="text-xl font-bold mb-4">
                <i class="fas fa-history mr-2"></i>최근 코칭 세션
            </h2>
            <div id="recentSessions" class="space-y-4">
                <!-- 동적 로딩 -->
            </div>
        </div>

        <!-- 진행 중인 교육 -->
        <div class="bg-white p-6 rounded-lg shadow mb-6">
            <h2 class="text-xl font-bold mb-4">
                <i class="fas fa-book-reader mr-2"></i>진행 중인 교육
            </h2>
            <div id="ongoingTraining" class="space-y-4">
                <!-- 동적 로딩 -->
            </div>
        </div>

        <!-- 교육 프로그램 찾아보기 -->
        <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-bold mb-4">
                <i class="fas fa-search mr-2"></i>교육 프로그램 찾아보기
            </h2>
            <div id="allPrograms" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- 동적 로딩 -->
            </div>
        </div>
    </div>

    <!-- 코칭 요청 모달 -->
    <div id="coachingModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
        <div class="bg-white p-8 rounded-lg max-w-2xl w-full mx-4">
            <h3 class="text-2xl font-bold mb-4">AI 코칭 요청</h3>
            <form id="coachingForm">
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">상황 유형</label>
                    <select id="situationType" class="w-full p-2 border rounded">
                        <option value="신규고객">신규 고객 개척</option>
                        <option value="기존고객">기존 고객 관리</option>
                        <option value="계약체결">계약 체결</option>
                        <option value="클레임처리">클레임 처리</option>
                        <option value="고객불만">고객 불만 처리</option>
                        <option value="대형계약">대형 계약</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">상황 설명</label>
                    <textarea id="context" rows="6" required
                        class="w-full p-2 border rounded"
                        placeholder="현재 직면한 상황을 자세히 설명해주세요..."></textarea>
                </div>
                <div class="flex justify-end space-x-2">
                    <button type="button" onclick="hideCoachingModal()" 
                        class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">취소</button>
                    <button type="submit" 
                        class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                        코칭 받기
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- 코칭 결과 모달 -->
    <div id="coachingResultModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
        <div class="bg-white p-8 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 class="text-2xl font-bold mb-4">AI 코칭 결과</h3>
            <div id="coachingResult" class="space-y-4">
                <!-- 동적 로딩 -->
            </div>
            <div class="mt-6">
                <label class="block text-sm font-medium mb-2">피드백 및 평가</label>
                <textarea id="feedbackText" rows="3" 
                    class="w-full p-2 border rounded mb-2"
                    placeholder="이 코칭이 도움이 되었나요? 피드백을 남겨주세요..."></textarea>
                <div class="flex items-center justify-between">
                    <div>
                        <label class="text-sm font-medium mr-2">효과성 평가:</label>
                        <select id="effectivenessRating" class="p-2 border rounded">
                            <option value="5">⭐⭐⭐⭐⭐ 매우 도움됨</option>
                            <option value="4">⭐⭐⭐⭐ 도움됨</option>
                            <option value="3">⭐⭐⭐ 보통</option>
                            <option value="2">⭐⭐ 별로</option>
                            <option value="1">⭐ 도움 안됨</option>
                        </select>
                    </div>
                    <label class="flex items-center">
                        <input type="checkbox" id="shareWithAdmin" class="mr-2">
                        <span class="text-sm">관리자와 공유</span>
                    </label>
                </div>
            </div>
            <div class="flex justify-end space-x-2 mt-4">
                <button onclick="hideCoachingResultModal()" 
                    class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">닫기</button>
                <button onclick="submitFeedback()" 
                    class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                    피드백 제출
                </button>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script>
        let currentUser = null;
        let currentSessionId = null;

        // 인증 체크
        function checkAuth() {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                window.location.href = '/';
                return null;
            }
            return JSON.parse(userStr);
        }

        function logout() {
            localStorage.removeItem('user');
            window.location.href = '/';
        }

        function showCoachingModal() {
            document.getElementById('coachingModal').classList.remove('hidden');
            document.getElementById('coachingModal').classList.add('flex');
        }

        function hideCoachingModal() {
            document.getElementById('coachingModal').classList.add('hidden');
            document.getElementById('coachingModal').classList.remove('flex');
        }

        function hideCoachingResultModal() {
            document.getElementById('coachingResultModal').classList.add('hidden');
            document.getElementById('coachingResultModal').classList.remove('flex');
        }

        async function loadDashboard() {
            const response = await axios.get(\`/api/planner/dashboard/\${currentUser.id}\`);
            const data = response.data;

            document.getElementById('totalSessions').textContent = data.stats.totalCoachingSessions;
            document.getElementById('completedTraining').textContent = data.stats.completedTraining;
            
            // 최근 세션
            const sessionsHtml = data.recentSessions.map(s => \`
                <div class="p-4 border rounded">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mb-2">
                                \${s.situation_type}
                            </span>
                            <p class="text-sm text-gray-600 mb-2">\${s.context.substring(0, 100)}...</p>
                            <p class="text-xs text-gray-500">\${new Date(s.session_date).toLocaleString('ko-KR')}</p>
                        </div>
                        \${s.effectiveness_rating ? \`<span class="text-yellow-500">\${'⭐'.repeat(s.effectiveness_rating)}</span>\` : ''}
                    </div>
                </div>
            \`).join('');
            document.getElementById('recentSessions').innerHTML = sessionsHtml || '<p class="text-gray-500">아직 코칭 세션이 없습니다</p>';

            // 진행 중인 교육
            const trainingHtml = data.ongoingTraining.map(t => \`
                <div class="p-4 border rounded">
                    <h4 class="font-semibold mb-2">\${t.title}</h4>
                    <div class="flex items-center mb-2">
                        <div class="flex-1 bg-gray-200 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full" style="width: \${t.progress_percent}%"></div>
                        </div>
                        <span class="ml-2 text-sm">\${t.progress_percent}%</span>
                    </div>
                    <span class="text-xs text-gray-500">\${t.category} • \${t.duration_minutes}분</span>
                </div>
            \`).join('');
            document.getElementById('ongoingTraining').innerHTML = trainingHtml || '<p class="text-gray-500">진행 중인 교육이 없습니다</p>';
        }

        async function loadPrograms() {
            const response = await axios.get('/api/training/programs');
            const programs = response.data.programs;

            const programsHtml = programs.map(p => \`
                <div class="p-4 border rounded">
                    <h4 class="font-semibold mb-2">\${p.title}</h4>
                    <p class="text-sm text-gray-600 mb-2">\${p.description}</p>
                    <div class="flex justify-between items-center">
                        <div class="text-xs text-gray-500">
                            <span class="mr-2">\${p.category}</span>
                            <span>\${p.duration_minutes}분</span>
                        </div>
                        <button onclick="enrollProgram(\${p.id})" 
                            class="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                            수강신청
                        </button>
                    </div>
                </div>
            \`).join('');
            document.getElementById('allPrograms').innerHTML = programsHtml;
        }

        async function enrollProgram(programId) {
            try {
                await axios.post('/api/training/enroll', {
                    planner_id: currentUser.id,
                    program_id: programId
                });
                alert('수강 신청이 완료되었습니다!');
                loadDashboard();
            } catch (error) {
                alert(error.response?.data?.error || '수강 신청에 실패했습니다');
            }
        }

        document.getElementById('coachingForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const context = document.getElementById('context').value;
            const situationType = document.getElementById('situationType').value;

            try {
                const response = await axios.post('/api/coaching/new', {
                    planner_id: currentUser.id,
                    context,
                    situation_type: situationType
                });

                currentSessionId = response.data.sessionId;
                const coaching = response.data.coaching;

                document.getElementById('coachingResult').innerHTML = \`
                    <div class="bg-blue-50 p-4 rounded">
                        <h4 class="font-semibold mb-2"><i class="fas fa-robot mr-2"></i>AI 상황 분석</h4>
                        <p>\${coaching.ai_analysis}</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded">
                        <h4 class="font-semibold mb-2"><i class="fas fa-lightbulb mr-2"></i>코칭 조언</h4>
                        <p class="whitespace-pre-line">\${coaching.coaching_advice}</p>
                    </div>
                    <div class="bg-purple-50 p-4 rounded">
                        <h4 class="font-semibold mb-2"><i class="fas fa-tasks mr-2"></i>추천 접근법</h4>
                        <p class="whitespace-pre-line">\${coaching.recommended_approach}</p>
                    </div>
                    <div class="bg-yellow-50 p-4 rounded">
                        <h4 class="font-semibold mb-2"><i class="fas fa-user-tie mr-2"></i>30년 현장 노하우</h4>
                        <p class="whitespace-pre-line">\${coaching.tacit_knowledge_applied}</p>
                    </div>
                \`;

                hideCoachingModal();
                document.getElementById('coachingResultModal').classList.remove('hidden');
                document.getElementById('coachingResultModal').classList.add('flex');
                
                // 폼 리셋
                document.getElementById('coachingForm').reset();
            } catch (error) {
                alert('코칭 요청에 실패했습니다');
            }
        });

        async function submitFeedback() {
            const feedback = document.getElementById('feedbackText').value;
            const rating = document.getElementById('effectivenessRating').value;
            const isShared = document.getElementById('shareWithAdmin').checked;

            await axios.post('/api/coaching/feedback', {
                session_id: currentSessionId,
                feedback,
                rating: parseInt(rating),
                is_shared: isShared
            });

            alert('피드백이 제출되었습니다!');
            hideCoachingResultModal();
            loadDashboard();
        }

        // 초기화
        currentUser = checkAuth();
        if (currentUser) {
            document.getElementById('userName').textContent = currentUser.name;
            loadDashboard();
            loadPrograms();
        }
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
    <title>관리자 대시보드</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <nav class="bg-indigo-600 text-white p-4">
        <div class="container mx-auto flex justify-between items-center">
            <div class="flex items-center">
                <i class="fas fa-user-shield text-2xl mr-3"></i>
                <span class="text-xl font-bold">관리자 대시보드</span>
            </div>
            <div>
                <span id="userName" class="mr-4"></span>
                <button onclick="logout()" class="bg-indigo-700 px-4 py-2 rounded hover:bg-indigo-800">
                    <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
                </button>
            </div>
        </div>
    </nav>

    <div class="container mx-auto p-6">
        <h1 class="text-3xl font-bold mb-6">플랫폼 관리</h1>
        
        <!-- 전체 통계 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="flex items-center">
                    <i class="fas fa-users text-4xl text-blue-500 mr-4"></i>
                    <div>
                        <p class="text-gray-600">총 설계사</p>
                        <p id="totalPlanners" class="text-2xl font-bold">-</p>
                    </div>
                </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="flex items-center">
                    <i class="fas fa-comments text-4xl text-green-500 mr-4"></i>
                    <div>
                        <p class="text-gray-600">총 코칭 세션</p>
                        <p id="totalSessions" class="text-2xl font-bold">-</p>
                    </div>
                </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="flex items-center">
                    <i class="fas fa-star text-4xl text-yellow-500 mr-4"></i>
                    <div>
                        <p class="text-gray-600">평균 효과성</p>
                        <p id="avgEffectiveness" class="text-2xl font-bold">-</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 탭 네비게이션 -->
        <div class="bg-white rounded-lg shadow mb-6">
            <div class="border-b">
                <nav class="flex">
                    <button onclick="showTab('shared')" id="tab-shared"
                        class="tab-button px-6 py-3 font-semibold border-b-2 border-indigo-600">
                        <i class="fas fa-share-alt mr-2"></i>공유된 세션
                    </button>
                    <button onclick="showTab('insights')" id="tab-insights"
                        class="tab-button px-6 py-3 font-semibold text-gray-600 hover:text-gray-800">
                        <i class="fas fa-lightbulb mr-2"></i>인사이트
                    </button>
                    <button onclick="showTab('planners')" id="tab-planners"
                        class="tab-button px-6 py-3 font-semibold text-gray-600 hover:text-gray-800">
                        <i class="fas fa-users mr-2"></i>설계사 목록
                    </button>
                </nav>
            </div>

            <div id="content-shared" class="p-6">
                <h2 class="text-xl font-bold mb-4">공유된 코칭 세션</h2>
                <div id="sharedSessions" class="space-y-4">
                    <!-- 동적 로딩 -->
                </div>
            </div>

            <div id="content-insights" class="p-6 hidden">
                <h2 class="text-xl font-bold mb-4">관리자 인사이트</h2>
                <div id="insights" class="space-y-4">
                    <!-- 동적 로딩 -->
                </div>
            </div>

            <div id="content-planners" class="p-6 hidden">
                <h2 class="text-xl font-bold mb-4">등록된 설계사</h2>
                <div id="planners" class="overflow-x-auto">
                    <!-- 동적 로딩 -->
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script>
        let currentUser = null;

        function checkAuth() {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                window.location.href = '/';
                return null;
            }
            const user = JSON.parse(userStr);
            if (user.role !== 'admin') {
                window.location.href = '/planner';
                return null;
            }
            return user;
        }

        function logout() {
            localStorage.removeItem('user');
            window.location.href = '/';
        }

        function showTab(tabName) {
            // 모든 탭 버튼 스타일 리셋
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('border-indigo-600', 'text-gray-800');
                btn.classList.add('text-gray-600');
            });
            
            // 현재 탭 활성화
            document.getElementById(\`tab-\${tabName}\`).classList.add('border-indigo-600', 'text-gray-800');
            document.getElementById(\`tab-\${tabName}\`).classList.remove('text-gray-600');

            // 모든 콘텐츠 숨기기
            document.getElementById('content-shared').classList.add('hidden');
            document.getElementById('content-insights').classList.add('hidden');
            document.getElementById('content-planners').classList.add('hidden');

            // 현재 콘텐츠 보이기
            document.getElementById(\`content-\${tabName}\`).classList.remove('hidden');
        }

        async function loadDashboard() {
            const response = await axios.get('/api/admin/dashboard');
            const data = response.data;

            // 통계
            document.getElementById('totalPlanners').textContent = data.stats.totalPlanners;
            document.getElementById('totalSessions').textContent = data.stats.totalCoachingSessions;
            document.getElementById('avgEffectiveness').textContent = 
                (data.stats.averageEffectiveness || 0).toFixed(1) + '⭐';

            // 공유된 세션
            const sessionsHtml = data.sharedSessions.map(s => \`
                <div class="p-4 border rounded bg-white">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="font-semibold">\${s.planner_name}</span>
                            <span class="ml-2 text-sm text-gray-500">(\${s.email})</span>
                        </div>
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            \${s.situation_type}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 mb-2">\${s.context.substring(0, 150)}...</p>
                    <div class="flex justify-between items-center text-xs text-gray-500">
                        <span>\${new Date(s.session_date).toLocaleString('ko-KR')}</span>
                        \${s.effectiveness_rating ? \`<span class="text-yellow-500">\${'⭐'.repeat(s.effectiveness_rating)}</span>\` : ''}
                    </div>
                </div>
            \`).join('');
            document.getElementById('sharedSessions').innerHTML = sessionsHtml || 
                '<p class="text-gray-500">공유된 세션이 없습니다</p>';

            // 인사이트
            const insightsHtml = data.insights.map(i => \`
                <div class="p-4 border rounded bg-white">
                    <div class="flex justify-between items-start mb-2">
                        <span class="font-semibold">\${i.planner_name}</span>
                        <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            \${i.insight_type}
                        </span>
                    </div>
                    <p class="text-sm text-gray-700 mb-2">\${i.insight_content}</p>
                    <span class="text-xs text-gray-500">
                        \${new Date(i.created_at).toLocaleString('ko-KR')}
                    </span>
                </div>
            \`).join('');
            document.getElementById('insights').innerHTML = insightsHtml || 
                '<p class="text-gray-500">인사이트가 없습니다</p>';
        }

        async function loadPlanners() {
            const response = await axios.get('/api/admin/planners');
            const planners = response.data.planners;

            const plannersHtml = \`
                <table class="min-w-full bg-white">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-4 py-2 text-left">이름</th>
                            <th class="px-4 py-2 text-left">이메일</th>
                            <th class="px-4 py-2 text-left">영업 스타일</th>
                            <th class="px-4 py-2 text-left">경력</th>
                            <th class="px-4 py-2 text-left">코칭 세션</th>
                            <th class="px-4 py-2 text-left">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${planners.map(p => \`
                            <tr class="border-b">
                                <td class="px-4 py-2">\${p.name}</td>
                                <td class="px-4 py-2">\${p.email}</td>
                                <td class="px-4 py-2">\${p.sales_style || '-'}</td>
                                <td class="px-4 py-2">\${p.experience_years || 0}년</td>
                                <td class="px-4 py-2">\${p.total_coaching_sessions || 0}회</td>
                                <td class="px-4 py-2">
                                    <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                        \${p.status === 'active' ? '활성' : '비활성'}
                                    </span>
                                </td>
                            </tr>
                        \`).join('')}
                    </tbody>
                </table>
            \`;
            document.getElementById('planners').innerHTML = plannersHtml;
        }

        // 초기화
        currentUser = checkAuth();
        if (currentUser) {
            document.getElementById('userName').textContent = currentUser.name;
            loadDashboard();
            loadPlanners();
        }
    </script>
</body>
</html>
  `)
})

export default app
