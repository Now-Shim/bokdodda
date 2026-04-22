import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { generateAICoaching } from './ai-helper'
import { generateAICoachingWithGemini } from './ai-helper-gemini'
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
    // Director가 업로드한 지식 자료 가져오기 (D1에서)
    const knowledgeResult = await c.env.DB.prepare(`
      SELECT * FROM knowledge_base WHERE priority = 1 ORDER BY uploaded_at DESC
    `).all()
    
    const directorKnowledge = knowledgeResult.results
      .map((kb: any) => `[${kb.category}] ${kb.title}\n${kb.content}`)
      .join('\n\n---\n\n')
    
    // 외부 링크에서 관련 데이터 수집 (활성화된 링크만)
    const linksResult = await c.env.DB.prepare(`
      SELECT * FROM external_links WHERE is_active = 1 ORDER BY created_at DESC LIMIT 5
    `).all()
    
    let externalLinkData = ''
    if (linksResult.results.length > 0) {
      // 키워드 추출 (간단한 키워드 매칭)
      const keywords = context.toLowerCase().match(/[가-힣]{2,}/g) || []
      
      for (const link of linksResult.results.slice(0, 3)) { // 최대 3개 링크만 크롤링
        try {
          // GenSpark Token 사용하여 크롤링
          const crawlRes = await fetch(`https://api.genspark.ai/v1/crawler`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${c.env.GENSPARK_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: (link as any).url })
          })
          
          if (crawlRes.ok) {
            const data = await crawlRes.json()
            const content = data.content || data.markdown || ''
            
            // 간단한 키워드 필터링 (관련성 있는 내용만 포함)
            let relevantContent = content
            if (keywords.length > 0) {
              const lines = content.split('\n')
              const relevantLines = lines.filter((line: string) => 
                keywords.some(kw => line.toLowerCase().includes(kw))
              )
              
              if (relevantLines.length > 0) {
                relevantContent = relevantLines.slice(0, 20).join('\n') // 최대 20줄
              } else {
                relevantContent = content.substring(0, 1000) // 관련 내용 없으면 처음 1000자
              }
            }
            
            externalLinkData += `\n\n[외부 참조: ${(link as any).name}]\nURL: ${(link as any).url}\n${relevantContent.substring(0, 1500)}\n---`
          }
        } catch (err) {
          console.error(`링크 크롤링 실패 (${(link as any).url}):`, err)
        }
      }
    }
    
    // 통합된 지식 자료
    const combinedKnowledge = directorKnowledge + externalLinkData
    
    // AI 코칭 생성 (Gemini 우선, 폴백 OpenRouter)
    let aiResponse
    try {
      console.log('[AI Coaching] Gemini API 사용 시도...')
      aiResponse = await generateAICoachingWithGemini({
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
        directorKnowledge: combinedKnowledge,
        env: c.env
      })
      console.log('[AI Coaching] ✅ Gemini API 성공')
    } catch (geminiError: any) {
      console.error('[AI Coaching] ⚠️ Gemini API 실패:', geminiError)
      console.error('[AI Coaching] 에러 상세:', JSON.stringify({
        message: geminiError?.message || 'Unknown',
        stack: geminiError?.stack?.substring(0, 500) || 'No stack',
        status: geminiError?.status,
        response: geminiError?.response
      }, null, 2))
      console.warn('[AI Coaching] OpenRouter 폴백 시작...')
      aiResponse = await generateAICoaching({
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
        directorKnowledge: combinedKnowledge,
        env: c.env
      })
      console.log('[AI Coaching] ✅ OpenRouter 폴백 성공')
    }
    
    const newSession: CoachingSession = {
      id: coachingSessions.length + 1,
      plannerId,
      sessionDate: new Date().toISOString(),
      context,
      situationType,
      
      // 1. AI 분석 (3단계 분석 시스템)
      analyzedQuestion: aiResponse.analyzedQuestion,
      category: aiResponse.category,
      keyPoints: aiResponse.keyPoints,
      
      // 2. 코칭 (근거 기반 상세 코칭)
      coachingPoint: aiResponse.coachingPoint,
      coachingEvidence: aiResponse.coachingEvidence,
      dialogue: aiResponse.dialogue,
      learningNeeds: aiResponse.learningNeeds,
      actionGuidelines: aiResponse.actionGuidelines,
      
      // 참조 자료 (근거)
      references: aiResponse.references || [],
      
      // 기존 필드 (하위 호환)
      aiAnalysis: aiResponse.aiAnalysis,
      salesProcess: aiResponse.salesProcess,
      currentStage: aiResponse.currentStage,
      productSellingPoint: aiResponse.productSellingPoint,
      coachingAdvice: aiResponse.coachingAdvice,
      dialogueScript: aiResponse.dialogueScript,
      requiredKnowledge: aiResponse.requiredKnowledge,
      managerRequest: aiResponse.managerRequest,
      recommendedApproach: aiResponse.recommendedApproach,
      tacitKnowledgeApplied: aiResponse.tacitKnowledge,
      
      isShared: false,
      isValidated: false,
      useForLearning: false,
    }
    
    coachingSessions.push(newSession)
    
    // 프로필 통계 업데이트
    profile.totalCoachingSessions++
    
    // D1 데이터베이스에 저장
    try {
      // References 직렬화 (배열의 객체들을 JSON 문자열로 변환)
      let referencesJson = '[]'
      try {
        if (Array.isArray(aiResponse.references)) {
          referencesJson = JSON.stringify(aiResponse.references)
        } else if (aiResponse.references) {
          referencesJson = JSON.stringify([aiResponse.references])
        }
      } catch (e) {
        console.error('[DB] references 직렬화 실패:', e)
      }
      
      console.log('[DB] 저장할 데이터:', JSON.stringify({
        analyzedQuestion: typeof aiResponse.analyzedQuestion,
        category: typeof aiResponse.category,
        referencesJson: referencesJson.substring(0, 100)
      }))
      
      await c.env.DB.prepare(`
        INSERT INTO coaching_sessions (
          planner_id, session_date, context, situation_type,
          analyzed_question, category, key_points,
          coaching_point, coaching_evidence, dialogue, learning_needs, action_guidelines,
          reference_sources,
          ai_analysis, coaching_advice, recommended_approach, tacit_knowledge_applied,
          is_shared, is_validated, use_for_learning
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)
      `).bind(
        plannerId,
        newSession.sessionDate,
        context,
        situationType,
        aiResponse.analyzedQuestion || '',
        aiResponse.category || '',
        aiResponse.keyPoints || '',
        aiResponse.coachingPoint || '',
        aiResponse.coachingEvidence || '',
        aiResponse.dialogue || '',
        aiResponse.learningNeeds || '',
        aiResponse.actionGuidelines || '',
        referencesJson,  // 이미 JSON 문자열로 변환됨
        aiResponse.aiAnalysis || '',
        aiResponse.coachingAdvice || '',
        aiResponse.recommendedApproach || '',
        aiResponse.tacitKnowledge || ''
      ).run()
      console.log('[DB] 세션 저장 성공:', newSession.id)
    } catch (dbError) {
      console.error('[DB] 세션 저장 실패:', dbError)
      // DB 저장 실패해도 메모리에는 있으므로 계속 진행
    }
    
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

// 코칭 세션 대화 (추가 질문)
app.post('/api/coaching-sessions/:id/conversation', async (c) => {
  const id = parseInt(c.req.param('id'))
  const { message } = await c.req.json()
  
  const session = coachingSessions.find(s => s.id === id)
  if (!session) {
    return c.json({ error: '세션을 찾을 수 없습니다.' }, 404)
  }
  
  // 설계사 프로필 가져오기
  const user = users.find(u => u.id === session.plannerId)
  const profile = plannerProfiles.find(p => p.userId === session.plannerId)
  
  if (!user || !profile) {
    return c.json({ error: '설계사를 찾을 수 없습니다.' }, 404)
  }
  
  try {
    // conversationMessages 초기화 (없으면)
    if (!session.conversationMessages) {
      session.conversationMessages = []
    }
    
    // 사용자 메시지 추가
    const userMessage = {
      id: session.conversationMessages.length + 1,
      sender: 'planner' as const,
      message,
      timestamp: new Date().toISOString()
    }
    session.conversationMessages.push(userMessage)
    
    // 기존 코칭 컨텍스트 + 대화 이력 구성
    const conversationHistory = session.conversationMessages
      .map(msg => `${msg.sender === 'planner' ? '설계사' : 'AI 코치'}: ${msg.message}`)
      .join('\n')
    
    // OpenAI API를 직접 호출하여 대화형 답변 생성
    const OPENROUTER_API_KEY = c.env.OPENROUTER_API_KEY || c.env.OPENAI_API_KEY
    
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured')
    }
    
    const conversationPrompt = `당신은 30년 경력의 보험 설계사 코치입니다.

[기존 코칭 세션]
- 원래 질문: ${session.context}
- 상황 유형: ${session.situationType}
- AI 분석: ${session.analyzedQuestion || session.aiAnalysis}
- 코칭 조언: ${session.coachingPoint || session.coachingAdvice}
${session.coachingEvidence ? `- 코칭 근거: ${session.coachingEvidence}` : ''}

[대화 이력]
${conversationHistory}

[설계사 추가 질문]
${message}

**답변 지침:**
1. 위 추가 질문에 대해 간결하고 명확하게 답변해주세요
2. 기존 코칭 내용과 연관지어 설명하세요
3. 필요하면 구체적인 근거를 제시하세요:
   - 약관: 보험사명, 상품명, 조항 (예: 제X조 X항)
   - 의료정보: KCD-10 질병코드, 치료 과정
   - 법률: 보험업법 제XX조, 금융감독원 규정
   - 통계: 출처, 연도, 구체적 수치
4. 일반 대화체로 답변하세요 (JSON 형식 사용 금지)
5. 200-400자 내외로 답변하세요

답변만 작성하고, 다른 설명은 추가하지 마세요.`

    const conversationResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://bukdotda.com',
        'X-Title': '북돋다 - AI 코칭 대화'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system', content: '당신은 30년 경력의 보험 설계사 전문 코치입니다. 간결하고 명확하게 답변하며, 필요시 구체적인 근거(약관, 의료정보, 법률, 통계)를 제시합니다.' },
          { role: 'user', content: conversationPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    })
    
    if (!conversationResponse.ok) {
      throw new Error(`OpenRouter API 오류: ${conversationResponse.status}`)
    }
    
    const conversationData = await conversationResponse.json()
    const aiMessageText = conversationData.choices[0]?.message?.content || '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.'
    
    // AI 메시지 추가
    const aiMessage = {
      id: session.conversationMessages.length + 1,
      sender: 'ai' as const,
      message: aiMessageText,
      timestamp: new Date().toISOString()
    }
    session.conversationMessages.push(aiMessage)
    
    return c.json({ 
      success: true, 
      aiResponse: aiMessageText,
      conversationMessages: session.conversationMessages
    })
  } catch (error) {
    console.error('대화 처리 오류:', error)
    return c.json({ error: '대화 처리 중 오류가 발생했습니다.' }, 500)
  }
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
  const { title, category, content, priority, fileType, fileName, fileSize } = await c.req.json()
  const { env } = c
  
  try {
    const result = await env.DB.prepare(`
      INSERT INTO knowledge_base (title, category, content, file_type, file_name, file_size, priority, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title,
      category,
      content,
      fileType || 'text',
      fileName || null,
      fileSize || null,
      priority ? 1 : 0,
      1 // Director ID
    ).run()
    
    const newKnowledge = {
      id: result.meta.last_row_id,
      title,
      category,
      content,
      fileType: fileType || 'text',
      fileName,
      fileSize,
      priority: priority || false,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 1
    }
    
    return c.json({ success: true, knowledge: newKnowledge })
  } catch (error) {
    console.error('자료 업로드 오류:', error)
    return c.json({ error: '자료 업로드 중 오류가 발생했습니다.' }, 500)
  }
})

// Director - 자료 목록 조회
app.get('/api/director/knowledge', async (c) => {
  const { env } = c
  
  try {
    const result = await env.DB.prepare(`
      SELECT * FROM knowledge_base ORDER BY uploaded_at DESC
    `).all()
    
    const knowledge = result.results.map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      content: row.content,
      fileType: row.file_type,
      fileName: row.file_name,
      fileSize: row.file_size,
      priority: row.priority === 1,
      uploadedAt: row.uploaded_at,
      uploadedBy: row.uploaded_by
    }))
    
    return c.json({ knowledge })
  } catch (error) {
    console.error('자료 조회 오류:', error)
    return c.json({ error: '자료 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// Director - 자료 삭제
app.delete('/api/director/knowledge/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const { env } = c
  
  try {
    await env.DB.prepare(`
      DELETE FROM knowledge_base WHERE id = ?
    `).bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('자료 삭제 오류:', error)
    return c.json({ error: '자료 삭제 중 오류가 발생했습니다.' }, 500)
  }
})

// Director - 자료 수정
app.put('/api/director/knowledge/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const { title, category, content, priority } = await c.req.json()
  const { env } = c
  
  try {
    await env.DB.prepare(`
      UPDATE knowledge_base 
      SET title = ?, category = ?, content = ?, priority = ?
      WHERE id = ?
    `).bind(
      title,
      category,
      content,
      priority ? 1 : 0,
      id
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('자료 수정 오류:', error)
    return c.json({ error: '자료 수정 중 오류가 발생했습니다.' }, 500)
  }
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
  const { env } = c
  const { sessionId, directorFeedback, director30YearsKnowledge, directorRating, useForLearning } = await c.req.json()
  
  // 메모리 배열 업데이트
  const session = coachingSessions.find(s => s.id === sessionId)
  if (!session) {
    return c.json({ error: '세션을 찾을 수 없습니다.' }, 404)
  }
  
  session.directorFeedback = directorFeedback
  session.director30YearsKnowledge = director30YearsKnowledge // 30년 노하우 저장
  session.directorRating = directorRating
  session.isValidated = true
  session.useForLearning = useForLearning || false
  
  // D1 데이터베이스에 저장
  try {
    await env.DB.prepare(`
      UPDATE coaching_sessions 
      SET 
        director_feedback = ?,
        director_30years_knowledge = ?,
        director_rating = ?,
        is_validated = 1,
        use_for_learning = ?
      WHERE id = ?
    `).bind(
      directorFeedback,
      director30YearsKnowledge || null,
      directorRating,
      useForLearning ? 1 : 0,
      sessionId
    ).run()
    
    console.log('[DB] Director 피드백 저장 성공:', sessionId)
  } catch (error) {
    console.error('[DB] Director 피드백 저장 실패:', error)
    // DB 저장 실패해도 메모리 배열은 업데이트되었으므로 일단 성공 응답
  }
  
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

// ============== 외부 링크 관리 API ==============

// Director - 외부 링크 목록 조회
app.get('/api/director/links', async (c) => {
  const { env } = c
  
  try {
    const result = await env.DB.prepare(`
      SELECT * FROM external_links ORDER BY created_at DESC
    `).all()
    
    const links = result.results.map((row: any) => ({
      id: row.id,
      name: row.name,
      url: row.url,
      description: row.description,
      category: row.category,
      isActive: row.is_active === 1,
      authRequired: row.auth_required === 1,
      username: row.username,
      password: row.password,
      loginUrl: row.login_url,
      lastCrawledAt: row.last_crawled_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
    
    return c.json({ links })
  } catch (error) {
    console.error('링크 조회 오류:', error)
    return c.json({ error: '링크 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// Director - 외부 링크 추가
app.post('/api/director/links', async (c) => {
  const { name, url, description, category, isActive, authRequired, username, password, loginUrl } = await c.req.json()
  const { env } = c
  
  try {
    const result = await env.DB.prepare(`
      INSERT INTO external_links (name, url, description, category, is_active, auth_required, username, password, login_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name,
      url,
      description || null,
      category || null,
      isActive ? 1 : 0,
      authRequired ? 1 : 0,
      username || null,
      password || null,
      loginUrl || null
    ).run()
    
    const newLink = {
      id: result.meta.last_row_id,
      name,
      url,
      description,
      category,
      isActive: isActive || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return c.json({ success: true, link: newLink })
  } catch (error) {
    console.error('링크 추가 오류:', error)
    return c.json({ error: '링크 추가 중 오류가 발생했습니다.' }, 500)
  }
})

// Director - 외부 링크 수정
app.put('/api/director/links/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const { name, url, description, category, isActive, authRequired, username, password, loginUrl } = await c.req.json()
  const { env } = c
  
  try {
    await env.DB.prepare(`
      UPDATE external_links 
      SET name = ?, url = ?, description = ?, category = ?, is_active = ?, 
          auth_required = ?, username = ?, password = ?, login_url = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name,
      url,
      description || null,
      category || null,
      isActive ? 1 : 0,
      authRequired ? 1 : 0,
      username || null,
      password || null,
      loginUrl || null,
      id
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('링크 수정 오류:', error)
    return c.json({ error: '링크 수정 중 오류가 발생했습니다.' }, 500)
  }
})

// Director - 외부 링크 삭제
app.delete('/api/director/links/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const { env } = c
  
  try {
    await env.DB.prepare(`
      DELETE FROM external_links WHERE id = ?
    `).bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('링크 삭제 오류:', error)
    return c.json({ error: '링크 삭제 중 오류가 발생했습니다.' }, 500)
  }
})

// Director - 외부 링크 활성화/비활성화 토글
app.patch('/api/director/links/:id/toggle', async (c) => {
  const id = parseInt(c.req.param('id'))
  const { env } = c
  
  try {
    // 현재 상태 조회
    const linkResult = await env.DB.prepare(`
      SELECT is_active FROM external_links WHERE id = ?
    `).bind(id).first()
    
    if (!linkResult) {
      return c.json({ error: '링크를 찾을 수 없습니다.' }, 404)
    }
    
    const newStatus = linkResult.is_active === 1 ? 0 : 1
    
    await env.DB.prepare(`
      UPDATE external_links SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(newStatus, id).run()
    
    return c.json({ success: true, isActive: newStatus === 1 })
  } catch (error) {
    console.error('링크 상태 변경 오류:', error)
    return c.json({ error: '링크 상태 변경 중 오류가 발생했습니다.' }, 500)
  }
})

// 웹 크롤링 (링크 내용 수집)
app.post('/api/crawl', async (c) => {
  const { url } = await c.req.json()
  const { env } = c
  
  try {
    // GenSpark의 crawler tool을 사용
    const response = await fetch(`${env.GENSPARK_API_BASE_URL || 'https://api.genspark.ai'}/v1/crawler`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GENSPARK_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    })
    
    if (!response.ok) {
      throw new Error(`크롤링 실패: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    return c.json({ 
      success: true, 
      content: data.content || data.markdown || '',
      title: data.title || ''
    })
  } catch (error) {
    console.error('크롤링 오류:', error)
    return c.json({ error: '웹 페이지를 가져오는 중 오류가 발생했습니다.' }, 500)
  }
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
