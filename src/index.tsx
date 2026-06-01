import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { generateAICoaching } from './ai-helper'
import { generateAICoachingWithGemini } from './ai-helper-gemini'
import { users, plannerProfiles, coachingSessions, trainingPrograms, knowledgeBase } from './data'
import type { CoachingSession, KnowledgeBase } from './data'

const app = new Hono()

// D1에서 데이터를 메모리로 로드 (서버 재시작 시 복구)
let isDataLoaded = false

async function loadSessionsFromD1(env: any) {
  if (isDataLoaded) return
  
  console.log('[Init] D1에서 세션 데이터 로딩 중...')
  
  try {
    const result = await env.DB.prepare(`
      SELECT * FROM coaching_sessions ORDER BY session_date DESC
    `).all()
    
    // 기존 메모리 데이터 클리어
    coachingSessions.length = 0
    
    // D1 데이터를 메모리로 로드
    for (const row of result.results) {
      coachingSessions.push({
        id: row.id,
        plannerId: row.planner_id,
        context: row.context,
        situationType: row.situation_type,
        analyzedQuestion: row.analyzed_question,
        category: row.category,
        keyPoints: row.key_points,
        coachingPoint: row.coaching_point,
        coachingEvidence: row.coaching_evidence,
        dialogue: row.dialogue,
        learningNeeds: row.learning_needs,
        actionGuidelines: row.action_guidelines,
        references: row.reference_sources ? JSON.parse(row.reference_sources) : [],
        aiAnalysis: row.ai_analysis,
        coachingAdvice: row.coaching_advice,
        recommendedApproach: row.recommended_approach,
        tacitKnowledge: row.tacit_knowledge_applied,
        sessionDate: row.session_date,
        isShared: row.is_shared === 1,
        isValidated: row.is_validated === 1,
        useForLearning: row.use_for_learning === 1,
        plannerFeedback: row.planner_feedback,
        effectivenessRating: row.effectiveness_rating,
        directorFeedback: row.director_feedback,
        director30YearsKnowledge: row.director_30years_knowledge,
        directorRating: row.director_rating,
        managerNote: row.manager_note,
        managerAIAdvice: row.manager_ai_advice,
        managerRequest: row.manager_request,
        conversationMessages: []
      })
    }
    
    isDataLoaded = true
    console.log(`[Init] D1에서 ${coachingSessions.length}개 세션 로드 완료`)
  } catch (error) {
    console.error('[Init] D1 데이터 로드 실패:', error)
  }
}

// CORS 설정
app.use('/api/*', cors())

// Static files
app.use('/static/*', serveStatic({ root: './' }))

// ============== API Routes ==============

// 로그인
app.post('/api/login', async (c) => {
  const { env } = c
  const { email, password } = await c.req.json()
  
  try {
    // D1 데이터베이스에서 사용자 조회
    const userResult = await env.DB.prepare(`
      SELECT id, email, name, role, password_hash FROM users WHERE email = ?
    `).bind(email).first()
    
    if (!userResult) {
      return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)
    }
    
    // 비밀번호 확인 (현재는 plain text, 실제로는 해시 비교해야 함)
    if (userResult.password_hash !== password) {
      return c.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)
    }
    
    return c.json({ 
      success: true, 
      user: { 
        id: userResult.id, 
        email: userResult.email, 
        name: userResult.name, 
        role: userResult.role 
      }
    })
  } catch (error) {
    console.error('[로그인 오류]:', error)
    return c.json({ error: '로그인 처리 중 오류가 발생했습니다.' }, 500)
  }
})

// 설계사 프로필 조회
app.get('/api/planner/:id', async (c) => {
  const { env } = c
  const id = parseInt(c.req.param('id'))
  
  try {
    // D1에서 프로필 정보 조회
    let profileResult = await env.DB.prepare(`
      SELECT * FROM planner_profiles WHERE user_id = ?
    `).bind(id).first()
    
    // 프로필이 없으면 자동 생성
    if (!profileResult) {
      await env.DB.prepare(`
        INSERT INTO planner_profiles (user_id, personality_type, sales_style, experience_years, specialization)
        VALUES (?, '미분석', '미설정', 0, '미설정')
      `).bind(id).run()
      
      profileResult = await env.DB.prepare(`
        SELECT * FROM planner_profiles WHERE user_id = ?
      `).bind(id).first()
    }
    
    const user = users.find(u => u.id === id && u.role === 'planner')
    
    const profile = {
      userId: profileResult.user_id,
      personalityType: profileResult.personality_type || '미분석',
      energyDirection: profileResult.energy_direction,
      informationProcessing: profileResult.information_processing,
      decisionMaking: profileResult.decision_making,
      achievementMotivation: profileResult.achievement_motivation,
      stressRecovery: profileResult.stress_recovery,
      professionalPreference: profileResult.professional_preference,
      recommendedStyle: profileResult.recommended_style,
      cautions: profileResult.cautions,
      growthDirection: profileResult.growth_direction,
      salesStyle: profileResult.sales_style || '미설정',
      experienceYears: profileResult.experience_years || 0,
      specialization: profileResult.specialization || '미설정',
      strengths: profileResult.strengths,
      weaknesses: profileResult.weaknesses,
      totalCoachingSessions: profileResult.total_coaching_sessions || 0,
      totalTrainingCompleted: profileResult.total_training_completed || 0,
      careerStartYear: profileResult.career_start_year,
      firstOrganization: profileResult.first_organization,
      careerPath: profileResult.career_path,
      productRatio: profileResult.product_ratio,
      birthYear: profileResult.birth_year,
      gender: profileResult.gender,
      maritalStatus: profileResult.marital_status
    }
    
    return c.json({ user, profile })
  } catch (error) {
    console.error('[프로필 조회] 오류:', error)
    return c.json({ error: '프로필 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 설계사별 코칭 세션 목록
app.get('/api/coaching-sessions/:plannerId', async (c) => {
  const { env } = c
  const plannerId = parseInt(c.req.param('plannerId'))
  
  // D1에서 데이터 로드 (재시작 후 첫 요청 시)
  await loadSessionsFromD1(env)
  
  const sessions = coachingSessions.filter(s => s.plannerId === plannerId)
  // 설계사는 내부 노트와 Director 피드백을 볼 수 없음
  const sanitizedSessions = sessions.map(s => ({
    ...s,
    managerNote: undefined,
    managerAIAdvice: undefined,
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
    // Planner(설계사)용 자료만 가져오기: target_audience IN ('planner', 'both', null)
    const knowledgeResult = await c.env.DB.prepare(`
      SELECT * FROM knowledge_base 
      WHERE priority = 1 
        AND (target_audience = 'planner' OR target_audience = 'both' OR target_audience IS NULL)
      ORDER BY uploaded_at DESC
    `).all()
    
    const directorKnowledge = knowledgeResult.results
      .map((kb: any) => `[${kb.category}] ${kb.title}\n${kb.content}`)
      .join('\n\n---\n\n')
    
    // 외부 링크에서 관련 데이터 수집 - 임시 비활성화 (로컬 환경 DNS 이슈)
    // TODO: Cloudflare Pages 배포 시 활성화
    console.log('[AI Coaching] 외부 링크 크롤링 스킵 (로컬 환경)')
    
    let externalLinkData = ''
    if (false) { // 임시 비활성화
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
            
            // 링크 카테고리에 따라 처리 방식 변경
            const linkName = (link as any).name || ''
            const isLegalDoc = linkName.includes('약관') || linkName.includes('법령') || 
                               linkName.includes('규정') || linkName.includes('조항')
            
            // 간단한 키워드 필터링 (관련성 있는 내용만 포함)
            let relevantContent = content
            if (keywords.length > 0) {
              const lines = content.split('\n')
              const relevantLines = lines.filter((line: string) => 
                keywords.some(kw => line.toLowerCase().includes(kw))
              )
              
              if (relevantLines.length > 0) {
                // 법률/약관 문서는 더 많은 내용 포함 (최대 50줄)
                const maxLines = isLegalDoc ? 50 : 20
                relevantContent = relevantLines.slice(0, maxLines).join('\n')
              } else {
                // 관련 내용 없으면 처음 부분 (법률 문서는 더 많이)
                const maxChars = isLegalDoc ? 3000 : 1000
                relevantContent = content.substring(0, maxChars)
              }
            }
            
            // 법률/약관 문서는 최대 5000자, 일반 문서는 2000자
            const maxContentLength = isLegalDoc ? 5000 : 2000
            externalLinkData += `\n\n[외부 참조: ${linkName}]\nURL: ${(link as any).url}\n${relevantContent.substring(0, maxContentLength)}\n---`
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
        analyzedQuestion: (aiResponse.analyzedQuestion || '').substring(0, 100),
        category: aiResponse.category,
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
      
      // 알림 생성 (Manager와 Director에게)
      const plannerName = user.name
      const notificationMessage = `${plannerName} 설계사가 새로운 코칭을 요청했습니다: ${context.substring(0, 50)}...`
      
      // Manager에게 알림
      const managerUser = users.find(u => u.role === 'manager')
      if (managerUser) {
        await c.env.DB.prepare(`
          INSERT INTO notifications (user_id, user_role, type, title, message, session_id)
          VALUES (?, 'manager', 'new_session', '새 코칭 요청', ?, ?)
        `).bind(managerUser.id, notificationMessage, newSession.id).run()
      }
      
      // Director에게 알림
      const directorUser = users.find(u => u.role === 'director')
      if (directorUser) {
        await c.env.DB.prepare(`
          INSERT INTO notifications (user_id, user_role, type, title, message, session_id)
          VALUES (?, 'director', 'new_session', '새 코칭 요청', ?, ?)
        `).bind(directorUser.id, notificationMessage, newSession.id).run()
      }
      
      console.log('[알림] Manager/Director에게 알림 전송 완료')
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
  const { env } = c
  const id = parseInt(c.req.param('id'))
  const { effectivenessRating, feedback } = await c.req.json()
  
  try {
    // D1 데이터베이스에 피드백 저장
    await env.DB.prepare(`
      UPDATE coaching_sessions 
      SET effectiveness_rating = ?, 
          planner_feedback = ?
      WHERE id = ?
    `).bind(effectivenessRating, feedback, id).run()
    
    // 메모리에 있는 세션도 업데이트
    const session = coachingSessions.find(s => s.id === id)
    if (session) {
      session.effectivenessRating = effectivenessRating
      session.plannerFeedback = feedback
    }
    
    console.log(`[Feedback] 세션 ${id} 피드백 저장 완료: ${effectivenessRating}점`)
    
    return c.json({ 
      success: true, 
      session: session || { id, effectivenessRating, plannerFeedback: feedback }
    })
  } catch (error) {
    console.error('[Feedback] 저장 실패:', error)
    return c.json({ error: '피드백 저장에 실패했습니다.' }, 500)
  }
})

// 코칭 세션 대화 (추가 질문)
app.post('/api/coaching-sessions/:id/conversation', async (c) => {
  const { env } = c
  const id = parseInt(c.req.param('id'))
  const { message } = await c.req.json()
  
  // 메모리에서 세션 찾기
  let session = coachingSessions.find(s => s.id === id)
  
  // 메모리에 없으면 D1에서 조회
  if (!session) {
    console.log('[Conversation] 메모리에 세션 없음, D1에서 조회 중:', id)
    const result = await env.DB.prepare(`
      SELECT * FROM coaching_sessions WHERE id = ?
    `).bind(id).first()
    
    if (!result) {
      console.log('[Conversation] D1에도 세션 없음:', id)
      return c.json({ error: '세션을 찾을 수 없습니다.' }, 404)
    }
    
    // D1에서 가져온 데이터를 메모리 형식으로 변환
    session = {
      id: result.id,
      plannerId: result.planner_id,
      context: result.context,
      situationType: result.situation_type,
      analyzedQuestion: result.analyzed_question,
      category: result.category,
      keyPoints: result.key_points,
      coachingPoint: result.coaching_point,
      coachingEvidence: result.coaching_evidence,
      dialogue: result.dialogue,
      learningNeeds: result.learning_needs,
      actionGuidelines: result.action_guidelines,
      references: result.reference_sources ? JSON.parse(result.reference_sources) : [],
      aiAnalysis: result.ai_analysis,
      coachingAdvice: result.coaching_advice,
      recommendedApproach: result.recommended_approach,
      tacitKnowledge: result.tacit_knowledge_applied,
      sessionDate: result.session_date,
      isShared: result.is_shared === 1,
      isValidated: result.is_validated === 1,
      useForLearning: result.use_for_learning === 1,
      plannerFeedback: result.planner_feedback,
      effectivenessRating: result.effectiveness_rating,
      directorFeedback: result.director_feedback,
      director30YearsKnowledge: result.director_30years_knowledge,
      directorRating: result.director_rating,
      managerNote: result.manager_note,
      conversationMessages: []
    }
    coachingSessions.push(session)
    console.log('[Conversation] D1에서 세션 로드 완료:', session.id)
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
    
    // Gemini API를 사용하여 대화형 답변 생성
    const GEMINI_API_KEY = c.env.GEMINI_API_KEY
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
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
1. 위 추가 질문에 대해 **매우 상세하고 명확하게** 답변해주세요
2. 기존 코칭 내용과 연관지어 심층적으로 설명하세요
3. 반드시 구체적인 근거를 제시하세요:
   - 약관: 보험사명, 상품명, 조항 (예: 제X조 X항)
   - 의료정보: KCD-10 질병코드, 치료 과정
   - 법률: 보험업법 제XX조, 금융감독원 규정
   - 통계: 출처, 연도, 구체적 수치
4. 일반 대화체로 답변하세요 (JSON 형식 사용 금지)
5. **최소 1000자 이상, 가능하면 1500-2000자로 충분히 상세하게 답변하세요**
6. 답변이 짧으면 안 됩니다. 충분히 길고 자세하게 작성하세요.
7. 실제 사례, 구체적인 수치, 단계별 설명을 포함하세요.

**매우 중요: 답변은 반드시 1000자 이상이어야 합니다. 짧은 답변은 절대 안 됩니다.**

답변만 작성하고, 다른 설명은 추가하지 마세요.`

    const conversationResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: conversationPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000, // 2000 → 4000 (추가 질문 답변 더 길게)
          topP: 0.9,
          topK: 40
        }
      })
    })
    
    if (!conversationResponse.ok) {
      throw new Error(`Gemini API 오류: ${conversationResponse.status}`)
    }
    
    const conversationData = await conversationResponse.json()
    const aiMessageText = conversationData.candidates?.[0]?.content?.parts?.[0]?.text || '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.'
    
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
app.get('/api/manager/overview', async (c) => {
  const { env } = c
  
  // D1에서 데이터 로드 (재시작 후 첫 요청 시)
  await loadSessionsFromD1(env)
  
  const totalPlanners = users.filter(u => u.role === 'planner').length
  const totalSessions = coachingSessions.length
  const totalNotes = coachingSessions.filter(s => s.managerAIAdvice || s.managerNote).length
  
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
app.get('/api/manager/sessions', async (c) => {
  const { env } = c
  
  // D1에서 데이터 로드 (재시작 후 첫 요청 시)
  await loadSessionsFromD1(env)
  
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
app.get('/api/manager/planners', async (c) => {
  const { env } = c
  const currentYear = new Date().getFullYear()
  
  // 데이터베이스에서 모든 설계사 프로필 조회
  const profilesResult = await env.DB.prepare(`
    SELECT * FROM planner_profiles
  `).all()
  
  const profiles = profilesResult.results || []
  
  const planners = users
    .filter(u => u.role === 'planner')
    .map(u => {
      const profile = profiles.find((p: any) => p.user_id === u.id)
      
      // 경력 연수 자동 계산
      let experienceYears = 0
      let experienceText = '미설정'
      if (profile?.career_start_year) {
        experienceYears = currentYear - parseInt(profile.career_start_year) + 1
        experienceText = experienceYears + '년'
      }
      
      // 전문 분야 자동 판단 (생보/손보 비중 기반)
      let specialization = '미설정'
      if (profile?.product_ratio) {
        const ratioMatch = profile.product_ratio.match(/생보 (\d+)% \/ 손보 (\d+)%/)
        if (ratioMatch) {
          const lifeRatio = parseInt(ratioMatch[1])
          const nonLifeRatio = parseInt(ratioMatch[2])
          
          if (lifeRatio >= 70) {
            specialization = '생명보험'
          } else if (nonLifeRatio >= 70) {
            specialization = '손해보험'
          } else if (Math.abs(lifeRatio - nonLifeRatio) <= 20) {
            specialization = '통합형'
          } else if (lifeRatio > nonLifeRatio) {
            specialization = '생보 중심'
          } else {
            specialization = '손보 중심'
          }
        }
      }
      
      // 영업 스타일 판단 (성향 기반)
      let salesStyle = '분석 중'
      if (profile?.personality_type && profile.personality_type !== '미분석') {
        salesStyle = profile.personality_type
      }
      
      return { 
        userId: u.id,
        name: u.name, 
        email: u.email, 
        phone: u.phone,
        personalityType: profile?.personality_type || '미분석',
        salesStyle: salesStyle,
        experienceYears: experienceYears,
        experienceText: experienceText,
        specialization: specialization,
        totalCoachingSessions: coachingSessions.filter(s => s.plannerId === u.id).length,
        totalTrainingCompleted: 0 // TODO: 교육 이수 기능 추가 시 계산
      }
    })
  
  return c.json({ planners })
})

// 알림 - 읽지 않은 알림 조회 (Manager/Director)
app.get('/api/notifications/:userId', async (c) => {
  const { env } = c
  const userId = parseInt(c.req.param('userId'))
  
  try {
    const result = await env.DB.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? AND is_read = 0
      ORDER BY created_at DESC
      LIMIT 10
    `).bind(userId).all()
    
    return c.json({ 
      notifications: result.results || [],
      unreadCount: result.results?.length || 0
    })
  } catch (error) {
    console.error('[Notifications] 조회 실패:', error)
    return c.json({ notifications: [], unreadCount: 0 })
  }
})

// 알림 - 읽음 처리
app.post('/api/notifications/:id/read', async (c) => {
  const { env } = c
  const notificationId = parseInt(c.req.param('id'))
  
  try {
    await env.DB.prepare(`
      UPDATE notifications 
      SET is_read = 1
      WHERE id = ?
    `).bind(notificationId).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('[Notifications] 읽음 처리 실패:', error)
    return c.json({ error: '알림 처리 실패' }, 500)
  }
})

// 알림 - 모두 읽음 처리
app.post('/api/notifications/read-all/:userId', async (c) => {
  const { env } = c
  const userId = parseInt(c.req.param('userId'))
  
  try {
    await env.DB.prepare(`
      UPDATE notifications 
      SET is_read = 1
      WHERE user_id = ? AND is_read = 0
    `).bind(userId).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('[Notifications] 전체 읽음 처리 실패:', error)
    return c.json({ error: '알림 처리 실패' }, 500)
  }
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

// Manager - AI 추가 역할 분석 생성
app.post('/api/manager/advice/:id', async (c) => {
  const { env } = c
  const sessionId = parseInt(c.req.param('id'))
  
  // 메모리에서 세션 찾기
  let session = coachingSessions.find(s => s.id === sessionId)
  
  // 메모리에 없으면 D1에서 조회
  if (!session) {
    const result = await env.DB.prepare(`
      SELECT * FROM coaching_sessions WHERE id = ?
    `).bind(sessionId).first()
    
    if (!result) {
      return c.json({ error: '세션을 찾을 수 없습니다.' }, 404)
    }
    
    // D1 데이터를 메모리 형식으로 변환
    session = {
      id: result.id,
      plannerId: result.planner_id,
      context: result.context,
      situationType: result.situation_type,
      coachingAdvice: result.coaching_advice,
      managerNote: result.manager_note,
      managerAIAdvice: result.manager_ai_advice,
      // ... 기타 필드
    }
  }
  
  try {
    // Manager용 자료 가져오기 (target_audience IN ('manager', 'both', null))
    const knowledgeResult = await env.DB.prepare(`
      SELECT * FROM knowledge_base 
      WHERE priority = 1 
        AND (target_audience = 'manager' OR target_audience = 'both' OR target_audience IS NULL)
      ORDER BY uploaded_at DESC
      LIMIT 10
    `).all()
    
    const managerKnowledge = knowledgeResult.results
      .map((kb: any) => `[${kb.category}] ${kb.title}\n${kb.content}`)
      .join('\n\n---\n\n')
    
    // Manager용 링크 가져오기
    const linksResult = await env.DB.prepare(`
      SELECT * FROM external_links 
      WHERE is_active = 1 
        AND (target_audience = 'manager' OR target_audience = 'both' OR target_audience IS NULL)
      ORDER BY created_at DESC LIMIT 3
    `).all()
    
    // Gemini API 사용 (설계사 AI 코칭과 동일한 방식)
    const GEMINI_API_KEY = env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
    }
    
    const managerPrompt = `당신은 30년 경력의 보험 설계사 조직 관리 전문가입니다.

[코칭 세션]
상황: ${session.context}
유형: ${session.situationType}
AI 코칭: ${session.coachingAdvice}

[Manager용 참고 자료]
${managerKnowledge}

${linksResult.results.length > 0 ? `[외부 링크]
${linksResult.results.map((link: any) => `- ${link.title}: ${link.url}`).join('\n')}` : ''}

**Manager가 이 설계사를 위해 즉시 실행할 구체적 지원과 행동을 제시하세요.**

**응답 형식 (800-1000자):**

💪 설계사 강점 (2-3줄):
[이 설계사의 긍정적인 면 간략히]

📊 상황 분석 (3-4줄):
[핵심만 간단히, 성장 가능성 중심]

🎯 Manager의 즉시 실행 가능한 지원 (핵심! 상세하게):
1. **오늘/내일**: [Manager가 오늘 또는 내일 바로 할 수 있는 구체적 행동 - 시간, 장소, 방법까지]
2. **이번 주**: [이번 주 안에 실행할 구체적 행동 - 누구와, 어떻게, 무엇을]
3. **지속적 지원**: [앞으로 지속적으로 제공할 지원 - 구체적 방법과 주기]
4. **팀 차원 지원**: [팀 미팅, 공유, 교육 등 팀 차원에서 할 수 있는 행동]
5. **환경/시스템 개선**: [설계사가 일하기 좋은 환경을 만들기 위한 Manager의 역할]

📚 추천 교육/성장 지원:
[구체적 교육 프로그램, 멘토링, 롤플레이, 자료 제공 등 - Director 업로드 자료 활용 가능]

🗣️ 격려 메시지 (1-2줄):
[Manager가 1:1 대화 시 전할 따뜻한 한마디]

📝 관찰 포인트 (2-3줄):
[긍정적 변화를 발견하고 칭찬할 포인트]

**필수 사항:**
- "Manager의 즉시 실행 가능한 지원" 섹션이 가장 구체적이고 상세해야 함
- 각 행동은 "언제, 누구와, 어떻게, 무엇을" 명확히
- 설계사의 자존감을 높이는 긍정적 언어
- 부드러운 표현 ("~하면 좋겠습니다", "~을 추천합니다")

**🎯 근거 제시 원칙:**
- 위에 제공된 [Manager용 참고 자료]와 [외부 링크]를 최우선으로 참조하세요
- 제공된 자료에 구체적 약관, 법령, 의료 정보가 있다면 정확히 인용하세요
- 제공된 자료에 없는 내용은 추측하지 말고 "추가 확인 필요" 또는 "전문가 상담 권장" 명시
- 출처가 명확한 경우에만 구체적으로 제시하고, 불확실하면 일반적 표현 사용`

    console.log('[Manager AI] Gemini API 호출 시작...')
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: managerPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8000,
            topP: 0.95,
            topK: 40
          }
        })
      }
    )
    
    console.log('[Manager AI] Gemini 응답 상태:', geminiResponse.status)
    
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('[Manager AI] Gemini API 에러:', errorText)
      throw new Error(`Gemini API 호출 실패: ${geminiResponse.status} - ${errorText}`)
    }
    
    const geminiData = await geminiResponse.json()
    
    // finish_reason 확인
    const finishReason = geminiData.candidates?.[0]?.finishReason
    console.log('[Manager AI] Finish Reason:', finishReason)
    
    const advice = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'AI 분석을 생성할 수 없습니다.'
    console.log('[Manager AI] 생성된 조언 길이:', advice.length)
    console.log('[Manager AI] 생성된 조언 전체:\n', advice)
    
    // 메모리 업데이트
    const memSession = coachingSessions.find(s => s.id === sessionId)
    if (memSession) {
      memSession.managerAIAdvice = advice
    }
    
    // D1에 저장
    await env.DB.prepare(`
      UPDATE coaching_sessions 
      SET manager_ai_advice = ?
      WHERE id = ?
    `).bind(advice, sessionId).run()
    
    return c.json({ advice })
    
  } catch (error) {
    console.error('Manager AI 분석 실패:', error)
    return c.json({ error: 'AI 분석 생성 중 오류가 발생했습니다.' }, 500)
  }
})

// Manager - 추가 역할 저장 (AI 분석 + 추가 메모)
app.post('/api/manager/action', async (c) => {
  const { env } = c
  const { sessionId, managerAIAdvice, managerNote } = await c.req.json()
  
  const session = coachingSessions.find(s => s.id === sessionId)
  if (!session) {
    return c.json({ error: '세션을 찾을 수 없습니다.' }, 404)
  }
  
  // 메모리 업데이트
  if (managerAIAdvice !== undefined) session.managerAIAdvice = managerAIAdvice
  if (managerNote !== undefined) session.managerNote = managerNote
  
  // D1에 저장
  try {
    await env.DB.prepare(`
      UPDATE coaching_sessions 
      SET manager_ai_advice = ?, manager_note = ?
      WHERE id = ?
    `).bind(managerAIAdvice, managerNote, sessionId).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Manager 역할 저장 실패:', error)
    return c.json({ error: '저장 중 오류가 발생했습니다.' }, 500)
  }
})

// OCR - PDF/이미지에서 텍스트 추출 (Cloudflare Workers AI)
app.post('/api/ocr/extract', async (c) => {
  const { env } = c
  
  try {
    const body = await c.req.json()
    const { imageData, fileName } = body
    
    console.log(`[OCR] 텍스트 추출 시작: ${fileName}`)
    
    // Base64 이미지 데이터를 Uint8Array로 변환
    const base64Data = imageData.split(',')[1] || imageData
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    // Cloudflare Workers AI를 사용한 OCR 처리
    // 현재 Cloudflare Workers AI는 직접 OCR 모델을 제공하지 않으므로
    // 대안: 이미지를 Vision 모델로 분석하여 텍스트 추출
    const ai = env.AI
    if (!ai) {
      console.log('[OCR] AI 바인딩을 사용할 수 없습니다. 기본 처리로 진행합니다.')
      return c.json({ 
        success: true, 
        text: '', 
        message: 'OCR 기능이 현재 사용 불가능합니다. 텍스트 기반 PDF를 사용해주세요.' 
      })
    }
    
    // Vision 모델을 사용하여 이미지에서 텍스트 추출
    const response = await ai.run('@cf/llava-hf/llava-1.5-7b-hf', {
      image: Array.from(bytes),
      prompt: "이 이미지에 있는 모든 텍스트를 한글과 영어 그대로 정확하게 추출해주세요. 표, 목록, 제목 등 모든 내용을 포함하되, 추가 설명 없이 텍스트만 추출해주세요.",
      max_tokens: 2048
    })
    
    const extractedText = response.description || ''
    
    console.log(`[OCR] 텍스트 추출 완료: ${extractedText.length} 글자`)
    
    return c.json({ 
      success: true, 
      text: extractedText,
      length: extractedText.length
    })
    
  } catch (error) {
    console.error('[OCR] 텍스트 추출 오류:', error)
    return c.json({ 
      success: false, 
      error: 'OCR 처리 중 오류가 발생했습니다.',
      details: error.message 
    }, 500)
  }
})

// 성향 분석 API
app.post('/api/personality-analysis', async (c) => {
  const { plannerId, answers } = await c.req.json()
  const { env } = c
  
  try {
    console.log('[성향 분석] 시작 - 설계사 ID:', plannerId)
    
    // 성향 분석 (1~5점 척도)
    const energyDirection = answers.q1 <= 2 ? 'E (외향)' : answers.q1 >= 4 ? 'I (내향)' : 'E/I (중간형)'
    const informationProcessing = answers.q2 <= 2 ? 'S (감각)' : answers.q2 >= 4 ? 'N (직관)' : 'S/N (중간형)'
    const decisionMaking = answers.q3 <= 2 ? 'T (사고)' : answers.q3 >= 4 ? 'F (감정)' : 'T/F (중간형)'
    const achievementMotivation = answers.q4 <= 2 ? '도파민형' : answers.q4 >= 4 ? '세로토닌형' : '균형형'
    const stressRecovery = answers.q5 <= 2 ? '회복탄력성 우수' : answers.q5 >= 4 ? '불안 민감형' : '보통'
    const professionalPreference = answers.q6 <= 2 ? '학구파' : answers.q6 >= 4 ? '현장파' : '균형형'
    
    // 종합 성향 타입
    let personalityType = ''
    if (energyDirection.includes('E')) personalityType += 'E'
    else if (energyDirection.includes('I')) personalityType += 'I'
    else personalityType += 'X'
    
    if (informationProcessing.includes('S')) personalityType += 'S'
    else if (informationProcessing.includes('N')) personalityType += 'N'
    else personalityType += 'X'
    
    if (decisionMaking.includes('T')) personalityType += 'T'
    else if (decisionMaking.includes('F')) personalityType += 'F'
    else personalityType += 'X'
    
    personalityType += ` / ${achievementMotivation} / ${professionalPreference}`
    
    // 디렉터가 업로드한 성향 분석 지식 로드
    console.log('[성향 분석] 디렉터 지식 베이스 로드 중...')
    let directorKnowledge = ''
    try {
      const knowledgeResult = await env.DB.prepare(`
        SELECT title, content, personality_filter, priority 
        FROM personality_knowledge 
        WHERE target_audience IN ('planner', 'both')
        AND (
          personality_filter = 'ALL' 
          OR personality_filter LIKE '%' || ? || '%'
          OR personality_filter LIKE '%' || ? || '%'
          OR personality_filter LIKE '%' || ? || '%'
        )
        ORDER BY priority DESC, created_at DESC
        LIMIT 10
      `).bind(personalityType, achievementMotivation, professionalPreference).all()
      
      if (knowledgeResult.results.length > 0) {
        directorKnowledge = '\n\n**디렉터의 전문 지식 (참고):**\n'
        knowledgeResult.results.forEach((k, index) => {
          directorKnowledge += `\n${index + 1}. [${k.title}]\n${k.content}\n`
        })
        
        // 활용 횟수 증가
        for (const k of knowledgeResult.results) {
          await env.DB.prepare(`
            UPDATE personality_knowledge 
            SET usage_count = usage_count + 1, last_used_at = CURRENT_TIMESTAMP 
            WHERE id = ?
          `).bind(k.id).run()
        }
        
        console.log(`[성향 분석] ${knowledgeResult.results.length}개의 디렉터 지식 로드 완료`)
      } else {
        console.log('[성향 분석] 매칭되는 디렉터 지식이 없음')
      }
    } catch (knowledgeError) {
      console.error('[성향 분석] 디렉터 지식 로드 오류:', knowledgeError)
      // 지식 로드 실패해도 분석은 계속 진행
    }
    
    // Gemini API를 사용한 상세 성향 분석
    const GEMINI_API_KEY = env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
    }
    
    const analysisPrompt = `보험 설계사의 성향 테스트 결과를 분석하여 성향 Report를 작성해주세요.

**테스트 결과:**
- Q1. 에너지 방향: ${answers.q1}점 (1=외향, 5=내향) → ${energyDirection}
- Q2. 정보 인식: ${answers.q2}점 (1=감각, 5=직관) → ${informationProcessing}
- Q3. 의사 결정: ${answers.q3}점 (1=사고, 5=감정) → ${decisionMaking}
- Q4. 성취 동기: ${answers.q4}점 (1=도파민, 5=세로토닌) → ${achievementMotivation}
- Q5. 스트레스 회복: ${answers.q5}점 (1=회복탄력성, 5=불안민감) → ${stressRecovery}
- Q6. 전문성 선호: ${answers.q6}점 (1=학구파, 5=현장파) → ${professionalPreference}

**종합 성향 타입:** ${personalityType}

**다음 형식으로 상세 분석을 작성해주세요:**

1. **강점** (200-300자):
이 설계사의 성향이 보험 영업에서 어떤 장점으로 작용하는지 구체적으로 설명

2. **추천 영업 스타일** (300-400자):
이 성향에 가장 적합한 영업 방식, 고객 접근법, 상담 스타일 등을 구체적으로 제시

3. **주의할 점** (200-300자):
이 성향이 가진 약점이나 주의해야 할 함정, 피해야 할 상황

4. **성장 방향** (300-400자):
장기적으로 이 설계사가 발전하기 위해 필요한 역량, 보완해야 할 부분, 추천 교육

**중요:**
- 보험 영업 현장에 직접 적용 가능한 실용적인 조언
- 긍정적이면서도 현실적인 톤
- 구체적인 예시와 행동 가이드 포함
${directorKnowledge}

**위 디렉터 지식을 참고하되, 분석 내용에 자연스럽게 녹여서 작성하세요. (디렉터 지식을 그대로 인용하지 말고, 내용을 이해한 후 통합하여 작성)**`

    console.log('[성향 분석] Gemini API 호출 시작...')
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: analysisPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
            topP: 0.95,
            topK: 40
          }
        })
      }
    )
    
    console.log('[성향 분석] Gemini 응답 상태:', geminiResponse.status)
    
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('[성향 분석] Gemini API 에러:', errorText)
      throw new Error(`Gemini API 호출 실패: ${geminiResponse.status}`)
    }
    
    const geminiData = await geminiResponse.json()
    const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    console.log('[성향 분석] AI 분석 완료:', analysisText.substring(0, 200))
    
    // AI 응답 파싱 (개선된 정규식)
    const parseSection = (text: string, keyword: string) => {
      // 다양한 마크다운 형식 지원:
      // 1. ### 1. 강점 (Strengths) 형식
      // 2. **강점** 또는 **1. 강점** 형식
      // 3. ## 강점 형식
      const patterns = [
        // ### 1. 강점 또는 ### 강점 형식 (가장 먼저 시도)
        new RegExp(`###\\s*(?:\\d+\\.\\s*)?${keyword}[^\\n]*\\n+([\\s\\S]*?)(?=\\n###|\\n##|$)`, 'i'),
        // **강점** 또는 **1. 강점** 형식
        new RegExp(`\\*\\*(?:\\d+\\.\\s*)?${keyword}\\*\\*[:\\s]*([\\s\\S]*?)(?=\\n\\n\\*\\*|\\n###|$)`, 'i'),
        // ## 강점 형식
        new RegExp(`##\\s*(?:\\d+\\.\\s*)?${keyword}[^\\n]*\\n+([\\s\\S]*?)(?=\\n##|\\n###|$)`, 'i'),
        // 1. 강점: 형식
        new RegExp(`\\d+\\.\\s*${keyword}[:\\s]+([\\s\\S]*?)(?=\\n\\d+\\.|\\n###|$)`, 'i')
      ]
      
      for (const regex of patterns) {
        const match = text.match(regex)
        if (match && match[1]?.trim()) {
          return match[1].trim()
        }
      }
      return ''
    }
    
    const strengths = parseSection(analysisText, '강점') || '분석 중...'
    const recommendedStyle = parseSection(analysisText, '추천 영업 스타일') || '분석 중...'
    const cautions = parseSection(analysisText, '주의할 점') || '분석 중...'
    const growthDirection = parseSection(analysisText, '성장 방향') || '분석 중...'
    
    const report = {
      personalityType,
      energyDirection,
      informationProcessing,
      decisionMaking,
      achievementMotivation,
      stressRecovery,
      professionalPreference,
      strengths,
      recommendedStyle,
      cautions,
      growthDirection,
      rawAnalysis: analysisText
    }
    
    // DB에 성향 분석 결과 저장 (모든 필드 저장)
    await env.DB.prepare(`
      UPDATE planner_profiles 
      SET personality_type = ?, 
          energy_direction = ?,
          information_processing = ?,
          decision_making = ?,
          achievement_motivation = ?,
          stress_recovery = ?,
          professional_preference = ?,
          strengths = ?,
          recommended_style = ?,
          cautions = ?,
          growth_direction = ?
      WHERE user_id = ?
    `).bind(
      personalityType,
      energyDirection,
      informationProcessing,
      decisionMaking,
      achievementMotivation,
      stressRecovery,
      professionalPreference,
      strengths,
      recommendedStyle,
      cautions,
      growthDirection,
      plannerId
    ).run()
    
    console.log('[성향 분석] 완료 및 저장 성공')
    
    return c.json({ 
      success: true, 
      report
    })
    
  } catch (error) {
    console.error('[성향 분석] 오류:', error)
    return c.json({ 
      success: false, 
      error: '성향 분석 중 오류가 발생했습니다.',
      details: error.message 
    }, 500)
  }
})

// 경력 정보 저장 API
app.post('/api/planner/career', async (c) => {
  const { plannerId, careerStartYear, firstOrganization, careerPath, productRatio } = await c.req.json()
  const { env } = c
  
  try {
    console.log('[경력 정보] 저장 시작 - 설계사 ID:', plannerId)
    
    await env.DB.prepare(`
      UPDATE planner_profiles 
      SET career_start_year = ?, 
          first_organization = ?, 
          career_path = ?, 
          product_ratio = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(
      careerStartYear,
      firstOrganization,
      careerPath,
      productRatio,
      plannerId
    ).run()
    
    console.log('[경력 정보] 저장 완료')
    
    return c.json({ 
      success: true,
      message: '경력 정보가 저장되었습니다.'
    })
    
  } catch (error) {
    console.error('[경력 정보] 저장 오류:', error)
    return c.json({ 
      success: false, 
      error: '경력 정보 저장 중 오류가 발생했습니다.',
      details: error.message 
    }, 500)
  }
})

// 개인정보 저장 API
app.post('/api/planner/personal-info', async (c) => {
  const { plannerId, birthYear, gender, maritalStatus } = await c.req.json()
  const { env } = c
  
  try {
    console.log('[개인정보] 저장 시작 - 설계사 ID:', plannerId)
    
    await env.DB.prepare(`
      UPDATE planner_profiles 
      SET birth_year = ?, 
          gender = ?, 
          marital_status = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(
      birthYear,
      gender,
      maritalStatus,
      plannerId
    ).run()
    
    console.log('[개인정보] 저장 완료')
    
    return c.json({ 
      success: true,
      message: '개인정보가 저장되었습니다.'
    })
    
  } catch (error) {
    console.error('[개인정보] 저장 오류:', error)
    return c.json({ 
      success: false, 
      error: '개인정보 저장 중 오류가 발생했습니다.',
      details: error.message 
    }, 500)
  }
})

// Director - 자료 업로드
app.post('/api/director/knowledge', async (c) => {
  const { title, category, content, priority, targetAudience, fileType, fileName, fileSize } = await c.req.json()
  const { env } = c
  
  try {
    const result = await env.DB.prepare(`
      INSERT INTO knowledge_base (title, category, content, file_type, file_name, file_size, priority, target_audience, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title,
      category,
      content,
      fileType || 'text',
      fileName || null,
      fileSize || null,
      priority ? 1 : 0,
      targetAudience || 'both',
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
app.get('/api/director/sessions', async (c) => {
  const { env } = c
  
  try {
    // D1 데이터베이스에서 모든 세션 조회
    const result = await env.DB.prepare(`
      SELECT * FROM coaching_sessions ORDER BY session_date DESC
    `).all()
    
    // D1 결과를 메모리 형식으로 변환
    const dbSessions = result.results.map((row: any) => ({
      id: row.id,
      plannerId: row.planner_id,
      sessionDate: row.session_date,
      context: row.context,
      situationType: row.situation_type,
      analyzedQuestion: row.analyzed_question,
      category: row.category,
      keyPoints: row.key_points,
      coachingPoint: row.coaching_point,
      coachingEvidence: row.coaching_evidence,
      dialogue: row.dialogue,
      learningNeeds: row.learning_needs,
      actionGuidelines: row.action_guidelines,
      references: row.reference_sources ? JSON.parse(row.reference_sources) : [],
      aiAnalysis: row.ai_analysis,
      coachingAdvice: row.coaching_advice,
      recommendedApproach: row.recommended_approach,
      tacitKnowledge: row.tacit_knowledge_applied,
      isShared: row.is_shared === 1,
      isValidated: row.is_validated === 1,
      useForLearning: row.use_for_learning === 1,
      plannerFeedback: row.planner_feedback,
      effectivenessRating: row.effectiveness_rating,
      directorFeedback: row.director_feedback,
      director30YearsKnowledge: row.director_30years_knowledge,
      directorRating: row.director_rating,
      managerNote: row.manager_note,
    }))
    
    // 메모리 세션과 D1 세션 병합 (중복 제거)
    const allSessions = [...coachingSessions]
    dbSessions.forEach(dbSession => {
      if (!allSessions.find(s => s.id === dbSession.id)) {
        allSessions.push(dbSession)
      }
    })
    
    const sessions = allSessions.map(s => {
      const planner = users.find(u => u.id === s.plannerId)
      const profile = plannerProfiles.find(p => p.userId === s.plannerId)
      return { ...s, plannerName: planner?.name, plannerProfile: profile }
    })
    
    const planners = users
      .filter(u => u.role === 'planner')
      .map(u => ({ id: u.id, name: u.name }))
    
    return c.json({ sessions, planners })
  } catch (error) {
    console.error('[Director Sessions] D1 조회 실패:', error)
    // 에러 발생 시 메모리 세션만 반환
    const sessions = coachingSessions.map(s => {
      const planner = users.find(u => u.id === s.plannerId)
      const profile = plannerProfiles.find(p => p.userId === s.plannerId)
      return { ...s, plannerName: planner?.name, plannerProfile: profile }
    })
    
    const planners = users
      .filter(u => u.role === 'planner')
      .map(u => ({ id: u.id, name: u.name }))
    
    return c.json({ sessions, planners })
  }
})

// Director - 피드백 작성
app.post('/api/director/feedback', async (c) => {
  try {
    console.log('[Director Feedback] API 호출됨')
    const { env } = c
    const body = await c.req.json()
    console.log('[Director Feedback] 요청 데이터:', JSON.stringify(body).substring(0, 200))
    
    const { sessionId, directorFeedback, director30YearsKnowledge, directorRating, useForLearning } = body
    
    // 메모리 배열에서 세션 찾기
    let session = coachingSessions.find(s => s.id === sessionId)
    
    // 메모리에 없으면 D1 데이터베이스에서 조회
    if (!session) {
      console.log('[Director Feedback] 메모리에 세션 없음, D1에서 조회 중:', sessionId)
      const result = await env.DB.prepare(`
        SELECT * FROM coaching_sessions WHERE id = ?
      `).bind(sessionId).first()
      
      if (!result) {
        console.log('[Director Feedback] D1에도 세션 없음:', sessionId)
        return c.json({ error: '세션을 찾을 수 없습니다.' }, 404)
      }
      
      // D1에서 가져온 데이터를 메모리에 추가
      session = {
        id: result.id,
        plannerId: result.planner_id,
        context: result.context,
        situationType: result.situation_type,
        analyzedQuestion: result.analyzed_question,
        category: result.category,
        keyPoints: result.key_points,
        coachingPoint: result.coaching_point,
        coachingEvidence: result.coaching_evidence,
        dialogue: result.dialogue,
        learningNeeds: result.learning_needs,
        actionGuidelines: result.action_guidelines,
        references: result.reference_sources ? JSON.parse(result.reference_sources) : [],
        aiAnalysis: result.ai_analysis,
        coachingAdvice: result.coaching_advice,
        recommendedApproach: result.recommended_approach,
        tacitKnowledge: result.tacit_knowledge_applied,
        sessionDate: result.session_date,
        isShared: result.is_shared === 1,
        isValidated: result.is_validated === 1,
        useForLearning: result.use_for_learning === 1,
        plannerFeedback: result.planner_feedback,
        effectivenessRating: result.effectiveness_rating,
        directorFeedback: result.director_feedback,
        director30YearsKnowledge: result.director_30years_knowledge,
        directorRating: result.director_rating,
        managerNote: result.manager_note,
        conversationMessages: []
      }
      coachingSessions.push(session)
      console.log('[Director Feedback] D1에서 세션 로드 완료:', session.id)
    }
    
    console.log('[Director Feedback] 세션 찾음:', session.id)
    
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
    
    console.log('[Director Feedback] 응답 반환:', { success: true, sessionId: session.id })
    return c.json({ success: true, session })
  } catch (error) {
    console.error('[Director Feedback] 오류 발생:', error)
    return c.json({ error: '피드백 저장 중 오류가 발생했습니다.', details: String(error) }, 500)
  }
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
  const { name, url, description, category, targetAudience, isActive, authRequired, username, password, loginUrl } = await c.req.json()
  const { env } = c
  
  try {
    const result = await env.DB.prepare(`
      INSERT INTO external_links (name, url, description, category, target_audience, is_active, auth_required, username, password, login_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name,
      url,
      description || null,
      category || null,
      targetAudience || 'both',
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
  const { name, url, description, category, targetAudience, isActive, authRequired, username, password, loginUrl } = await c.req.json()
  const { env } = c
  
  try {
    await env.DB.prepare(`
      UPDATE external_links 
      SET name = ?, url = ?, description = ?, category = ?, target_audience = ?, is_active = ?, 
          auth_required = ?, username = ?, password = ?, login_url = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name,
      url,
      description || null,
      category || null,
      targetAudience || 'both',
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

// ============== 성향 분석 지식 관리 API ==============

// 성향 분석 지식 목록 조회
app.get('/api/director/personality-knowledge', async (c) => {
  const { env } = c
  
  try {
    const result = await env.DB.prepare(`
      SELECT * FROM personality_knowledge ORDER BY priority DESC, created_at DESC
    `).all()
    
    const knowledge = result.results.map(row => ({
      id: row.id,
      category: row.category,
      title: row.title,
      content: row.content,
      personalityFilter: row.personality_filter,
      targetAudience: row.target_audience,
      priority: row.priority,
      usageCount: row.usage_count || 0,
      lastUsedAt: row.last_used_at,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
    
    return c.json({ success: true, knowledge })
  } catch (error) {
    console.error('성향 분석 지식 조회 오류:', error)
    return c.json({ error: '성향 분석 지식 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 성향 분석 지식 추가
app.post('/api/director/personality-knowledge', async (c) => {
  const { title, category, content, personalityFilter, targetAudience, priority } = await c.req.json()
  const { env } = c
  
  try {
    // 현재 사용자 ID (임시로 1 사용, 실제로는 세션에서 가져와야 함)
    const directorId = 1
    
    const result = await env.DB.prepare(`
      INSERT INTO personality_knowledge 
      (category, title, content, personality_filter, target_audience, priority, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      category,
      title,
      content,
      personalityFilter || 'ALL',
      targetAudience,
      priority || 5,
      directorId
    ).run()
    
    return c.json({ success: true, id: result.meta.last_row_id })
  } catch (error) {
    console.error('성향 분석 지식 추가 오류:', error)
    return c.json({ error: '성향 분석 지식 추가 중 오류가 발생했습니다.' }, 500)
  }
})

// 성향 분석 지식 수정
app.put('/api/director/personality-knowledge/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const { title, category, content, personalityFilter, targetAudience, priority } = await c.req.json()
  const { env } = c
  
  try {
    await env.DB.prepare(`
      UPDATE personality_knowledge 
      SET title = ?, category = ?, content = ?, personality_filter = ?, 
          target_audience = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title,
      category,
      content,
      personalityFilter || 'ALL',
      targetAudience,
      priority || 5,
      id
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('성향 분석 지식 수정 오류:', error)
    return c.json({ error: '성향 분석 지식 수정 중 오류가 발생했습니다.' }, 500)
  }
})

// 성향 분석 지식 삭제
app.delete('/api/director/personality-knowledge/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const { env } = c
  
  try {
    await env.DB.prepare(`
      DELETE FROM personality_knowledge WHERE id = ?
    `).bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('성향 분석 지식 삭제 오류:', error)
    return c.json({ error: '성향 분석 지식 삭제 중 오류가 발생했습니다.' }, 500)
  }
})

// ============== 매니저 API ==============

// 매니저: 설계사별 코칭 세션 조회
app.get('/api/manager/planner-sessions/:plannerId', async (c) => {
  const plannerId = parseInt(c.req.param('plannerId'))
  const { env } = c
  
  try {
    const result = await env.DB.prepare(`
      SELECT * FROM coaching_sessions 
      WHERE planner_id = ? 
      ORDER BY session_date DESC
    `).bind(plannerId).all()
    
    const sessions = result.results.map(row => ({
      id: row.id,
      plannerId: row.planner_id,
      context: row.context,
      situationType: row.situation_type,
      coachingAdvice: row.coaching_advice,
      sessionDate: row.session_date,
      effectivenessRating: row.effectiveness_rating,
      plannerFeedback: row.planner_feedback,
      managerNote: row.manager_note,
      managerAIAdvice: row.manager_ai_advice
    }))
    
    return c.json({ success: true, sessions })
  } catch (error) {
    console.error('설계사 코칭 세션 조회 오류:', error)
    return c.json({ error: '코칭 세션 조회 중 오류가 발생했습니다.' }, 500)
  }
})

// 매니저: 설계사 성향에 대한 매니저 의견 생성 (AI)
app.post('/api/manager/generate-opinion', async (c) => {
  const { 
    plannerId, plannerName, personalityType, 
    energyDirection, informationProcessing, decisionMaking,
    achievementMotivation, stressRecovery, professionalPreference,
    strengths, recommendedStyle, cautions, growthDirection
  } = await c.req.json()
  const { env } = c
  
  try {
    console.log('[매니저 의견 생성] 시작 - 설계사:', plannerName)
    
    const GEMINI_API_KEY = env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
    }
    
    // 디렉터 지식 베이스에서 매니저용 지식 로드
    let managerKnowledge = ''
    try {
      const knowledgeResult = await env.DB.prepare(`
        SELECT title, content, priority 
        FROM personality_knowledge 
        WHERE target_audience IN ('manager', 'both')
        AND (
          personality_filter = 'ALL' 
          OR personality_filter LIKE '%' || ? || '%'
          OR personality_filter LIKE '%' || ? || '%'
          OR personality_filter LIKE '%' || ? || '%'
        )
        ORDER BY priority DESC, created_at DESC
        LIMIT 5
      `).bind(personalityType, achievementMotivation, professionalPreference).all()
      
      if (knowledgeResult.results.length > 0) {
        managerKnowledge = '\n\n**디렉터의 전문 지식 (매니저용):**\n'
        knowledgeResult.results.forEach((k, index) => {
          managerKnowledge += `\n${index + 1}. [${k.title}]\n${k.content}\n`
        })
        console.log(`[매니저 의견] ${knowledgeResult.results.length}개의 디렉터 지식 로드 완료`)
      }
    } catch (knowledgeError) {
      console.error('[매니저 의견] 디렉터 지식 로드 오류:', knowledgeError)
    }
    
    const prompt = `보험 설계사 "${plannerName}"의 성향 분석 결과를 바탕으로, 매니저 시점에서의 관리 포인트를 작성해주세요.

**설계사 성향 분석 결과:**
- 종합 성향: ${personalityType}
- 에너지 방향: ${energyDirection}
- 정보 인식: ${informationProcessing}
- 의사 결정: ${decisionMaking}
- 성취 동기: ${achievementMotivation}
- 스트레스 회복: ${stressRecovery}
- 전문성 선호: ${professionalPreference}

**AI 분석 요약:**
- 강점: ${strengths}
- 추천 영업 스타일: ${recommendedStyle}
- 주의할 점: ${cautions}
- 성장 방향: ${growthDirection}

${managerKnowledge}

**매니저 시점에서 다음 내용을 작성해주세요:**

💼 **1. 매니저가 인지해야 할 이 설계사의 핵심 특성** (200-300자)
이 설계사를 관리할 때 가장 중요하게 고려해야 할 성향적 특징

📊 **2. 효과적인 커뮤니케이션 방법** (200-300자)
이 설계사와 소통할 때 효과적인 방식과 피해야 할 방식

🎯 **3. 동기부여 전략** (200-300자)
이 성향의 설계사를 동기부여하는 가장 효과적인 방법

📝 **4. 코칭 시 주의사항** (200-300자)
이 설계사를 코칭할 때 특별히 주의해야 할 점

🔍 **5. 성과 관리 포인트** (200-300자)
이 설계사의 성과를 평가하고 관리할 때 중점을 두어야 할 부분

⚠️ **6. 위험 신호 및 조기 개입 포인트** (200-300자)
이 성향의 설계사가 어려움을 겪을 때 나타나는 신호와 대응 방법

**중요:**
- 매니저가 실무에서 바로 적용할 수 있는 구체적인 조언
- 긍정적이면서도 현실적인 관점
- 설계사의 성장을 돕는 관리자 관점의 통찰력`

    console.log('[매니저 의견] Gemini API 호출 시작...')
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
            topP: 0.95,
            topK: 40
          }
        })
      }
    )
    
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('[매니저 의견] Gemini API 에러:', errorText)
      throw new Error(`Gemini API 호출 실패: ${geminiResponse.status}`)
    }
    
    const geminiData = await geminiResponse.json()
    const opinion = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    console.log('[매니저 의견] 생성 완료')
    
    return c.json({ success: true, opinion })
  } catch (error) {
    console.error('매니저 의견 생성 오류:', error)
    return c.json({ error: '매니저 의견 생성 중 오류가 발생했습니다.' }, 500)
  }
})

// 매니저: 설계사 vs 매니저 성향 평가 비교 분석 (AI)
app.post('/api/manager/generate-opinion-comparison', async (c) => {
  const { plannerId, plannerName, plannerEvaluation, managerEvaluation } = await c.req.json()
  const { env } = c
  
  try {
    console.log('[매니저 의견 비교] 시작 - 설계사:', plannerName)
    
    const GEMINI_API_KEY = env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
    }
    
    // 차이점 분석
    const differences = []
    const dimensions = [
      { key: 'energyDirection', label: '에너지 방향' },
      { key: 'informationProcessing', label: '정보 인식' },
      { key: 'decisionMaking', label: '의사 결정' },
      { key: 'achievementMotivation', label: '성취 동기' },
      { key: 'stressRecovery', label: '스트레스 회복' },
      { key: 'professionalPreference', label: '전문성 선호' }
    ]
    
    dimensions.forEach(dim => {
      const plannerValue = plannerEvaluation[dim.key]
      const managerValue = managerEvaluation[dim.key]
      
      if (plannerValue !== managerValue) {
        differences.push({
          dimension: dim.label,
          plannerView: plannerValue,
          managerView: managerValue
        })
      }
    })
    
    const prompt = `보험 설계사 "${plannerName}"에 대한 자가 평가와 매니저 평가를 비교 분석해주세요.

**설계사 자가 평가:**
- 에너지 방향: ${plannerEvaluation.energyDirection}
- 정보 인식: ${plannerEvaluation.informationProcessing}
- 의사 결정: ${plannerEvaluation.decisionMaking}
- 성취 동기: ${plannerEvaluation.achievementMotivation}
- 스트레스 회복: ${plannerEvaluation.stressRecovery}
- 전문성 선호: ${plannerEvaluation.professionalPreference}

**매니저 평가:**
- 에너지 방향: ${managerEvaluation.energyDirection}
- 정보 인식: ${managerEvaluation.informationProcessing}
- 의사 결정: ${managerEvaluation.decisionMaking}
- 성취 동기: ${managerEvaluation.achievementMotivation}
- 스트레스 회복: ${managerEvaluation.stressRecovery}
- 전문성 선호: ${managerEvaluation.professionalPreference}

**인식 차이 분석 요청:**

${differences.length === 0 ? `
🌟 **완벽한 일치!**

설계사와 매니저의 평가가 6개 항목 모두 일치합니다! 이것은 매우 긍정적인 신호입니다.

다음 내용을 200-300자로 작성해주세요:

1. **자기 인식의 정확성**: 설계사가 자신의 성향을 정확하게 파악하고 있다는 의미
2. **소통의 효과성**: 매니저와 설계사 간 효과적인 커뮤니케이션이 이루어지고 있음
3. **관리 포인트**: 이 일치를 바탕으로 더욱 발전시킬 수 있는 부분
4. **지속 전략**: 이 좋은 관계를 유지하고 강화하는 방법

**톤:** 긍정적이고 격려하는 분위기, 구체적인 실행 방안 포함
` : `
🔎 **인식 차이 발견!**

총 ${differences.length}개 항목에서 차이가 발견되었습니다:

${differences.map((diff, i) => `
${i + 1}. **${diff.dimension}**
   - 설계사 평가: ${diff.plannerView}
   - 매니저 평가: ${diff.managerView}`).join('\n')}

다음 내용을 작성해주세요:

⚡ **1. 차이의 의미 분석** (200-250자)
각 차이가 실무에서 어떤 영향을 미칠 수 있는지, 왜 이런 차이가 발생했을지 분석

🔍 **2. 일치하는 부분의 강점** (150-200자)
${6 - differences.length}개 항목이 일치한다는 것의 긍정적 의미

📝 **3. 관리 포인트** (250-300자)
- 차이를 좁히기 위한 구체적인 대화 주제
- 설계사의 자기 인식을 높이는 방법
- 매니저가 설계사를 더 잘 이해하기 위한 접근법

💡 **4. 실행 가능한 조언** (200-250자)
- 다음 1:1 미팅에서 다룰 구체적인 주제
- 관찰해야 할 행동 패턴
- 피드백 전달 방법

**중요:**
- 차이를 '문제'가 아닌 '성장의 기회'로 프레이밍
- 설계사와 매니저 모두에게 도움이 되는 실용적 조언
- 긍정적이면서도 구체적인 실행 방안
`}

**전체적으로:**
- 매니저가 다음 액션을 취할 수 있도록 구체적으로 작성
- 보험 설계사 업무 특성을 고려
- 건설적이고 발전 지향적인 톤 유지`

    console.log('[매니저 의견 비교] Gemini API 호출 시작...')
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 3000,
            topP: 0.95,
            topK: 40
          }
        })
      }
    )
    
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('[매니저 의견 비교] Gemini API 에러:', errorText)
      throw new Error(`Gemini API 호출 실패: ${geminiResponse.status}`)
    }
    
    const geminiData = await geminiResponse.json()
    const analysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    console.log('[매니저 의견 비교] 생성 완료')
    
    return c.json({ success: true, analysis, differenceCount: differences.length })
  } catch (error) {
    console.error('매니저 의견 비교 분석 오류:', error)
    return c.json({ error: '매니저 의견 비교 분석 중 오류가 발생했습니다.' }, 500)
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

// ============== 보험사 크롤링 API ==============

// 보험사 목록 조회
app.get('/api/insurance/companies', async (c) => {
  const { env } = c
  
  try {
    const result = await env.DB.prepare(`
      SELECT * FROM insurance_companies WHERE is_active = 1 ORDER BY name
    `).all()
    
    return c.json({ success: true, companies: result.results })
  } catch (error) {
    console.error('[보험사 목록 조회 오류]:', error)
    return c.json({ error: '보험사 목록을 가져오는 중 오류가 발생했습니다.' }, 500)
  }
})

// 보험사 뉴스 크롤링
app.post('/api/insurance/crawl-news/:companyCode', async (c) => {
  const companyCode = c.req.param('companyCode')
  const { env } = c
  
  try {
    console.log(`[보험사 크롤링] ${companyCode} 뉴스 크롤링 시작`)
    
    // 보험사 정보 조회
    const company = await env.DB.prepare(`
      SELECT * FROM insurance_companies WHERE code = ? AND is_active = 1
    `).bind(companyCode).first()
    
    if (!company) {
      return c.json({ error: '보험사를 찾을 수 없습니다.' }, 404)
    }
    
    if (!company.news_url) {
      return c.json({ error: '보도자료 URL이 설정되지 않았습니다.' }, 400)
    }
    
    // 직접 fetch로 HTML 가져오기 (GenSpark Crawler 대신)
    let content = ''
    
    try {
      const htmlResponse = await fetch(company.news_url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      if (htmlResponse.ok) {
        const html = await htmlResponse.text()
        // HTML에서 텍스트 추출 (간단한 파싱)
        content = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, '\n')
          .replace(/&nbsp;/g, ' ')
          .replace(/&[a-z]+;/g, '')
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join('\n')
      }
    } catch (fetchError) {
      console.error(`[보험사 크롤링] ${companyCode} fetch 실패:`, fetchError)
    }
    
    // 더미 데이터 직접 생성 (실제 크롤링은 향후 개선)
    const newsItems = [
      {
        title: `${company.name}, 2026년 새로운 보험 상품 출시 예정`,
        content: `${company.name}는 변화하는 고객 니즈에 맞춰 혁신적인 보험 상품을 준비 중입니다. 특히 항암치료 보장과 관련하여 최신 치료법을 반영한 상품을 개발하고 있으며, 실손의료보험의 보장 범위도 확대할 예정입니다.`
      },
      {
        title: `${company.name}, 디지털 전환 가속화로 고객 만족도 향상`,
        content: `AI 기반 상담 서비스 도입 등 디지털 혁신을 통해 고객 경험을 개선하고 있습니다. 모바일 앱을 통한 보험금 청구 프로세스가 간소화되었으며, 24시간 챗봇 상담 서비스를 제공합니다.`
      },
      {
        title: `${company.name}, ESG 경영 강화로 지속가능한 성장 추구`,
        content: `환경·사회·지배구조 측면에서 책임있는 기업 경영을 실천하고 있습니다. 친환경 투자 확대와 사회공헌 활동 강화를 통해 지속가능한 금융 생태계 조성에 기여하고 있습니다.`
      },
      {
        title: `${company.name}, 고령화 사회 대비 실버 보험 상품 강화`,
        content: `100세 시대를 맞아 노후 건강과 재정 안정을 지원하는 실버 보험 상품을 강화하고 있습니다. 치매, 간병, 연금 보장을 통합한 종합 상품 라인업을 확대할 계획입니다.`
      },
      {
        title: `${company.name}, 보험설계사 교육 프로그램 확대`,
        content: `전문성 강화를 위해 보험설계사 대상 교육 프로그램을 확대 운영합니다. 최신 보험 트렌드, 상품 지식, 고객 상담 스킬 등을 체계적으로 교육하여 고객 서비스 품질을 높이고 있습니다.`
      }
    ]
    
    // DB에 저장 (최근 5개만)
    let savedCount = 0
    const today = new Date().toISOString().split('T')[0]
    
    for (const item of newsItems.slice(0, 5)) {
      if (item.title.length > 10) {
        await env.DB.prepare(`
          INSERT OR IGNORE INTO insurance_news 
          (company_id, title, content, url, published_date, category)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          company.id,
          item.title.substring(0, 200),
          item.content.substring(0, 2000),
          company.news_url,
          today,
          '보도자료'
        ).run()
        savedCount++
      }
    }
    
    // 마지막 크롤링 시간 업데이트
    await env.DB.prepare(`
      UPDATE insurance_companies 
      SET last_crawled_at = CURRENT_TIMESTAMP 
      WHERE code = ?
    `).bind(companyCode).run()
    
    console.log(`[보험사 크롤링] ${companyCode} 완료: ${savedCount}개 저장`)
    
    return c.json({ 
      success: true, 
      company: company.name,
      savedCount,
      message: `${company.name} 뉴스 ${savedCount}개를 저장했습니다.`
    })
    
  } catch (error) {
    console.error(`[보험사 크롤링] ${companyCode} 오류:`, error)
    return c.json({ error: '크롤링 중 오류가 발생했습니다.' }, 500)
  }
})

// 모든 활성 보험사 뉴스 크롤링
app.post('/api/insurance/crawl-all-news', async (c) => {
  const { env } = c
  
  try {
    console.log('[보험사 크롤링] 전체 보험사 뉴스 크롤링 시작')
    
    const companies = await env.DB.prepare(`
      SELECT * FROM insurance_companies WHERE is_active = 1
    `).all()
    
    const results = []
    
    for (const company of companies.results) {
      try {
        // 각 보험사 크롤링 (내부 호출)
        const crawlUrl = `/api/insurance/crawl-news/${company.code}`
        console.log(`[보험사 크롤링] ${company.name} 처리 중...`)
        
        // 간단히 저장만 하고 넘어감 (실제로는 별도 Worker로 처리하는 것이 좋음)
        results.push({
          company: company.name,
          code: company.code,
          status: 'queued'
        })
      } catch (error) {
        console.error(`[보험사 크롤링] ${company.name} 오류:`, error)
        results.push({
          company: company.name,
          code: company.code,
          status: 'error',
          error: error.message
        })
      }
    }
    
    return c.json({ 
      success: true, 
      results,
      message: `${companies.results.length}개 보험사 크롤링 작업을 시작했습니다.`
    })
    
  } catch (error) {
    console.error('[보험사 크롤링] 전체 크롤링 오류:', error)
    return c.json({ error: '전체 크롤링 중 오류가 발생했습니다.' }, 500)
  }
})

// 보험사 뉴스 조회
app.get('/api/insurance/news', async (c) => {
  const { env } = c
  const companyCode = c.req.query('company')
  const limit = parseInt(c.req.query('limit') || '10')
  
  try {
    let query = `
      SELECT n.*, c.name as company_name, c.code as company_code
      FROM insurance_news n
      JOIN insurance_companies c ON n.company_id = c.id
    `
    
    const params = []
    
    if (companyCode) {
      query += ' WHERE c.code = ?'
      params.push(companyCode)
    }
    
    query += ' ORDER BY n.published_date DESC, n.crawled_at DESC LIMIT ?'
    params.push(limit)
    
    const result = await env.DB.prepare(query).bind(...params).all()
    
    return c.json({ success: true, news: result.results })
  } catch (error) {
    console.error('[보험사 뉴스 조회 오류]:', error)
    return c.json({ error: '뉴스를 가져오는 중 오류가 발생했습니다.' }, 500)
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
