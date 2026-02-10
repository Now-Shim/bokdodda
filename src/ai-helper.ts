// AI 코칭 헬퍼 함수 (Genspark AI 사용)
import OpenAI from 'openai'

export interface CoachingRequest {
  context: string
  situationType: string
  plannerProfile: {
    name: string
    personalityType: string
    salesStyle: string
    experienceYears: number
    specialization: string
    strengths: string
    weaknesses: string
  }
  directorKnowledge?: string // Director가 업로드한 추가 지식
  env?: any // Cloudflare env binding
}

export interface CoachingResponse {
  aiAnalysis: string
  coachingAdvice: string
  recommendedApproach: string
  tacitKnowledge: string
}

export async function generateAICoaching(request: CoachingRequest): Promise<CoachingResponse> {
  const { context, situationType, plannerProfile, directorKnowledge, env } = request

  // API 키 가져오기 (OpenRouter)
  const apiKey = env?.OPENAI_API_KEY || process.env.OPENAI_API_KEY || 'sk-or-v1-15a...abf'
  const baseURL = env?.OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1'
  
  console.log('[AI Helper] OpenRouter API 설정:', {
    hasEnv: !!env,
    hasApiKey: !!apiKey,
    keyPrefix: apiKey.substring(0, 15),
    baseURL
  })

  const client = new OpenAI({
    apiKey,
    baseURL,
    defaultHeaders: {
      'HTTP-Referer': 'https://bukdotda.com',
      'X-Title': '북돋다 AI 코칭 플랫폼'
    }
  })

  // 30년 노하우 기본 지식베이스
  const tacitKnowledgeBase = `
[최호석 센터장 30년 현장 노하우]

1. 신뢰 구축의 원칙
- 급하게 계약하려는 마음이 고객에게 전달되면 신뢰가 무너집니다
- 진정한 관심을 보이고 천천히 접근하세요
- 고객이 먼저 "보험 어떤게 좋아요?"라고 물어올 때까지 기다리는 것도 전략입니다

2. 거절 대응
- 해지를 막으려고만 하면 고객은 더 멀어집니다
- 고객 입장에서 최선의 방법을 함께 찾아주면, 나중에 상황이 나아졌을 때 다시 찾아옵니다

3. 대형 계약 성사
- 큰 계약일수록 고객은 불안합니다
- 결정을 재촉하지 말고, "충분히 고민하세요. 언제든 질문 있으면 연락주세요"라고 여유를 보여주면 오히려 빨리 결정합니다

4. 성향별 접근법
- ESTJ/ISTJ (분석적): 논리와 데이터 중심, 구체적 수치 제시
- ENFP/ESFP (관계중심): 감성과 스토리 중심, 공감과 경청
- ENTJ/ENTP (공격적): 목표와 성과 중심, 빠른 결정 지원
- INFJ/INFP (신중한): 진정성과 의미 중심, 충분한 시간 제공

5. 상황별 황금률
- 신규 고객: 1차 관계, 2차 니즈, 3차 제안
- 기존 고객: 정기 접촉이 가장 중요, 생애주기별 관리
- 클레임: 최고의 관계 강화 기회, 신속하고 친절하게
- 거절: "지금은 아니다"는 "나중에 가능하다"의 의미

${directorKnowledge ? '\n[Director 추가 지식]\n' + directorKnowledge : ''}
  `

  const systemPrompt = `당신은 30년 경력의 보험 영업 교육 전문가 '최호석 센터장'입니다. 
보험 설계사들에게 현장 맥락에 맞는 실전 코칭을 제공합니다.

설계사 프로필:
- 이름: ${plannerProfile.name}
- 성향: ${plannerProfile.personalityType} (${plannerProfile.salesStyle})
- 경력: ${plannerProfile.experienceYears}년 (${plannerProfile.specialization})
- 강점: ${plannerProfile.strengths}
- 약점: ${plannerProfile.weaknesses}

현장 노하우:
${tacitKnowledgeBase}

응답 형식은 반드시 JSON으로 제공하고, 다음 구조를 따르세요:
{
  "aiAnalysis": "상황 분석 (2-3문장)",
  "coachingAdvice": "구체적인 조언 (3-4문장)",
  "recommendedApproach": "단계별 실행 방법 (3-5단계, 줄바꿈으로 구분)",
  "tacitKnowledge": "[30년 노하우] 로 시작하는 핵심 통찰 (1-2문장)"
}

중요: 설계사의 성향과 약점을 고려하여 맞춤형 조언을 제공하세요.`

  const userPrompt = `상황 유형: ${situationType}

현장 상황:
${context}

위 상황에 대해 이 설계사에게 가장 적합한 코칭을 제공해주세요.`

  try {
    const completion = await client.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    
    // JSON 파싱 시도
    try {
      const parsed = JSON.parse(responseText)
      return {
        aiAnalysis: parsed.aiAnalysis || '상황을 분석 중입니다.',
        coachingAdvice: parsed.coachingAdvice || '조언을 생성 중입니다.',
        recommendedApproach: parsed.recommendedApproach || '접근법을 수립 중입니다.',
        tacitKnowledge: parsed.tacitKnowledge || '[30년 노하우] 경험을 기반으로 조언드립니다.',
      }
    } catch (parseError) {
      // JSON 파싱 실패 시 텍스트를 적절히 분할
      return {
        aiAnalysis: '고객의 현재 상황과 심리를 분석한 결과, 신중한 접근이 필요합니다.',
        coachingAdvice: responseText.substring(0, 300),
        recommendedApproach: '1. 현재 상황 파악\n2. 고객 니즈 이해\n3. 맞춤 솔루션 제시',
        tacitKnowledge: '[30년 노하우] 고객의 입장에서 생각하면 답이 보입니다.',
      }
    }
  } catch (error) {
    console.error('AI 코칭 생성 오류:', error)
    
    // 폴백: 기본 응답
    return {
      aiAnalysis: '현재 AI 서비스에 일시적인 문제가 있습니다. 기본 분석을 제공합니다.',
      coachingAdvice: `${plannerProfile.personalityType} 성향의 ${plannerProfile.name}님께서는 ${plannerProfile.strengths}을 활용하시되, ${plannerProfile.weaknesses} 부분에 주의하시면 좋겠습니다.`,
      recommendedApproach: '1. 고객과의 신뢰 관계 구축\n2. 니즈 파악 및 경청\n3. 맞춤형 솔루션 제안',
      tacitKnowledge: '[30년 노하우] 급하지 않게, 진심으로 고객을 대하면 좋은 결과가 따라옵니다.',
    }
  }
}
