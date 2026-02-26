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
  // AI 분석 (보험 세일즈 프로세스 & 현 단계 & 컨셉 & 상품)
  aiAnalysis: string
  salesProcess?: string
  currentStage?: string
  productSellingPoint?: string
  
  // 코칭 조언 (구체적 대화 흐름 & 필요 지식 & 매니저 요청)
  coachingAdvice: string
  dialogueScript?: string
  requiredKnowledge?: string
  managerRequest?: string
  
  // 추천 접근법 (설계사 성향 기반 참신한 아이디어)
  recommendedApproach: string
  
  // 30년 노하우 (AI 내부 참조용)
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
      'X-Title': 'Bukdotda AI Coaching Platform'
    }
  })

  // 30년 노하우 + Director 업로드 자료 (AI 내부 참조용)
  const tacitKnowledgeBase = `
[변방의 장수 30년 현장 노하우 - AI 참조 자료]

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

${directorKnowledge ? '\n[Director 업로드 자료]\n' + directorKnowledge : ''}
  `

  const systemPrompt = `당신은 30년 경력의 보험 영업 교육 전문가 '변방의 장수'입니다. 
설계사에게 구체적이고 실전에 바로 적용 가능한 코칭을 제공합니다.

설계사 프로필:
- 이름: ${plannerProfile.name}
- 성향: ${plannerProfile.personalityType} (${plannerProfile.salesStyle})
- 경력: ${plannerProfile.experienceYears}년 (${plannerProfile.specialization})
- 강점: ${plannerProfile.strengths}
- 약점: ${plannerProfile.weaknesses}

참조 자료 (내부용):
${tacitKnowledgeBase}

응답 형식 (반드시 JSON, 예시 텍스트 그대로 복사하지 말고 실제 분석 내용으로 채워서 응답):
{
  "aiAnalysis": "실제 보험 세일즈 프로세스 분석을 여기에 작성",
  "salesProcess": "관계구축 또는 니즈파악 또는 제안 또는 클로징 등 실제 단계명",
  "currentStage": "현재 상황의 실제 분석 내용",
  "productSellingPoint": "실제 상품 판매 포인트를 구체적으로",
  
  "coachingAdvice": "실제 코칭 조언 요약",
  "dialogueScript": "실제 대화 스크립트를 대화문 형식으로",
  "requiredKnowledge": "설계사가 실제로 알아야 할 지식",
  "managerRequest": "매니저에게 실제로 요청할 사항",
  
  "recommendedApproach": "설계사 성향에 맞는 실제 접근 아이디어"
}

중요 지침:
1. 추상적/이상적 답변 금지 → 구체적 실전 스크립트 제공
2. 표준화된 답변 금지 → 설계사 성향 맞춤형 조언
3. 실제 대화 사례를 포함하여 대화 흐름 구성
4. 설계사의 약점을 보완하는 구체적 방법 제시
5. 매니저 지원이 필요한 부분을 명확히 지적
6. ⚠️ 예시 텍스트를 그대로 복사하지 말고, 주어진 상황에 맞는 실제 분석과 조언을 제공하세요
7. dialogueScript는 반드시 실제 대화문 형식(설계사: "..." / 고객: "...")으로 작성`

  const userPrompt = `상황 유형: ${situationType}

설계사 질문/상황:
${context}

위 상황에 대해:
1. 보험 세일즈 프로세스 상 어느 단계인지 분석
2. 구체적이고 실전에 바로 쓸 수 있는 대화 스크립트 제공
3. ${plannerProfile.name}(${plannerProfile.personalityType})의 성향에 맞는 참신한 아이디어 제시
4. 매니저에게 요청할 사항 명확히 제시

JSON 형식으로 응답하세요.`

  try {
    const completion = await client.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500, // 임시 감소: 2000 → 1500 (크레딧 부족 임시 해결, 26일 이후 복구)
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    
    // JSON 마크다운 코드 블록 제거 (```json ... ```)
    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/,  '').replace(/```\s*$/, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/```\s*$/, '')
    }
    
    // JSON 파싱 시도
    try {
      const parsed = JSON.parse(cleanedResponse)
      return {
        aiAnalysis: parsed.aiAnalysis || '상황을 분석 중입니다.',
        salesProcess: parsed.salesProcess,
        currentStage: parsed.currentStage,
        productSellingPoint: parsed.productSellingPoint,
        
        coachingAdvice: parsed.coachingAdvice || '조언을 생성 중입니다.',
        dialogueScript: parsed.dialogueScript,
        requiredKnowledge: parsed.requiredKnowledge,
        managerRequest: parsed.managerRequest,
        
        recommendedApproach: parsed.recommendedApproach || '접근법을 수립 중입니다.',
        tacitKnowledge: '[내부 참조용 - 30년 노하우 기반 코칭]',
      }
    } catch (parseError) {
      // JSON 파싱 실패 시 폴백
      return {
        aiAnalysis: '보험 세일즈 프로세스 분석 중입니다.',
        salesProcess: '분석 중',
        currentStage: '상황 파악 단계',
        productSellingPoint: responseText.substring(0, 200),
        
        coachingAdvice: responseText.substring(0, 300),
        dialogueScript: undefined,
        requiredKnowledge: undefined,
        managerRequest: undefined,
        
        recommendedApproach: '1. 현재 상황 파악\n2. 고객 니즈 이해\n3. 맞춤 솔루션 제시',
        tacitKnowledge: '[내부 참조용 - 30년 노하우 기반 코칭]',
      }
    }
  } catch (error) {
    console.error('AI 코칭 생성 오류:', error)
    
    // 폴백: 기본 응답
    return {
      aiAnalysis: '현재 AI 서비스에 일시적인 문제가 있습니다. 기본 분석을 제공합니다.',
      salesProcess: undefined,
      currentStage: undefined,
      productSellingPoint: undefined,
      
      coachingAdvice: `${plannerProfile.personalityType} 성향의 ${plannerProfile.name}님께서는 ${plannerProfile.strengths}을 활용하시되, ${plannerProfile.weaknesses} 부분에 주의하시면 좋겠습니다.`,
      dialogueScript: undefined,
      requiredKnowledge: undefined,
      managerRequest: undefined,
      
      recommendedApproach: '1. 고객과의 신뢰 관계 구축\n2. 니즈 파악 및 경청\n3. 맞춤형 솔루션 제안',
      tacitKnowledge: '[내부 참조용 - 30년 노하우 기반]',
    }
  }
}
