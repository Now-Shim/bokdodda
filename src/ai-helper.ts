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

export interface CoachingReference {
  source: string      // 출처명 (예: 금융감독원 보험약관, 의료가이드라인)
  content: string     // 인용한 내용 발췌
  url?: string        // 참조 URL (있는 경우)
}

export type CoachingCategory = 
  | '세일즈프로세스' 
  | '상품내용' 
  | '약관조항' 
  | '보험업법등법률' 
  | '의료정보' // 질병코드, 의료상식, 치료과정
  | '사례검토' 
  | '동기부여' 
  | '통계자료' 
  | '보험비즈니스' 
  | '기타'

export interface CoachingResponse {
  // 1. AI 분석
  analyzedQuestion: string        // 파악된 질문
  category: CoachingCategory      // 카테고리
  keyPoints: string               // 핵심 포인트
  
  // 2. 코칭
  coachingPoint: string           // 코칭 포인트
  coachingEvidence: string        // 코칭 근거 (약관/법률/인문학)
  dialogue: string                // 화법 (4~5번 대화)
  learningNeeds: string           // 학습 필요 내용
  actionGuidelines: string        // 구체적 행동지침
  
  // 참조 자료
  references: CoachingReference[]
  
  // 기존 필드 (하위 호환)
  aiAnalysis: string
  salesProcess?: string
  currentStage?: string
  productSellingPoint?: string
  coachingAdvice: string
  dialogueScript?: string
  requiredKnowledge?: string
  managerRequest?: string
  recommendedApproach: string
  tacitKnowledge: string
}

export async function generateAICoaching(request: CoachingRequest): Promise<CoachingResponse> {
  const { context, situationType, plannerProfile, directorKnowledge, env } = request

  // API 키 가져오기 (GenSpark LLM Proxy)
  const apiKey = env?.OPENAI_API_KEY || env?.GENSPARK_TOKEN || process.env.OPENAI_API_KEY || process.env.GENSPARK_TOKEN
  const baseURL = env?.OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1'
  
  console.log('[AI Helper] GenSpark LLM Proxy 설정:', {
    hasEnv: !!env,
    hasApiKey: !!apiKey,
    keyPrefix: apiKey?.substring(0, 15),
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
  // 최우선 검토 자료를 먼저 배치
  let directorKnowledgeSection = ''
  if (directorKnowledge) {
    directorKnowledgeSection = `

[Director 업로드 자료 - 최우선 검토]
${directorKnowledge}

※ 위 자료는 센터장이 직접 업로드한 핵심 노하우입니다.
※ AI 코칭 생성 시 위 자료를 최우선으로 참조하여 구체적이고 실전적인 조언을 제공하세요.
`
  }
  
  const tacitKnowledgeBase = `
[변방의 장수 30년 현장 노하우 - AI 기본 참조 자료]

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
${directorKnowledgeSection}
  `

  const systemPrompt = `당신은 30년 경력의 보험 영업 교육 전문가 '변방의 장수'입니다.
Gemini 수준의 체계적이고 전문적인 3단계 분석 시스템으로 설계사에게 코칭을 제공합니다.

설계사 프로필:
- 이름: ${plannerProfile.name}
- 성향: ${plannerProfile.personalityType} (${plannerProfile.salesStyle})
- 경력: ${plannerProfile.experienceYears}년 (${plannerProfile.specialization})
- 강점: ${plannerProfile.strengths}
- 약점: ${plannerProfile.weaknesses}

참조 자료 우선순위:
1️⃣ **최우선**: Director가 업로드한 "최우선 검토" 자료 (있는 경우)
2️⃣ 기본 참조: 30년 현장 노하우

참조 자료 (내부용):
${tacitKnowledgeBase}

⚠️ 코칭 생성 시 반드시 다음 순서로 참조하세요:
1. Director 업로드 자료(최우선 검토)가 있으면 이를 **최우선**으로 반영
2. 해당 자료의 구체적인 사례, 수치, 스크립트를 **그대로 인용**하여 활용
3. 기본 30년 노하우는 보조적으로 참조

📋 **응답 형식 (3단계 분석 시스템 - 반드시 순수 JSON, 주석 금지):**

{
  "analyzedQuestion": "질문의 요지를 명확히 정리 (설계사가 궁금해하는 핵심이 무엇인지)",
  "category": "세일즈프로세스|상품내용|약관조항|보험업법등법률|의료정보|사례검토|동기부여|통계자료|보험비즈니스|기타 중 하나 선택",
  "keyPoints": "질문의 핵심 포인트를 3-5개 bullet point로 정리",
  "coachingPoint": "카테고리와 관련된 핵심 코칭 포인트 (왜 이 답변을 하는지 논리)",
  "coachingEvidence": "카테고리별 구체적 근거 제시:\n- 약관: 00보험사 00상품 약관 제X조 X항 + 구체적 내용\n- 법률: 보험업법 제XX조, 금감원 규정 등\n- 동기부여: 심리학/철학/행동경제학/게임이론 등 인문학적 근거\n- 통계: 출처 + 구체적 수치",
  "dialogue": "⚠️ 반드시 문자열 형식! 고객과의 실제 대화 시나리오 (6~8번 대화 주고받기):\n\n[심리학/인문학 기반 공감 대화 필수]\n- 고객의 불안, 두려움, 걱정을 먼저 공감\n- 심리학 이론 기반 대응 (예: 손실회피, 확증편향 등)\n- 감정 → 논리 → 해결책 순서로 전개\n\n설계사: \\\"(1. 고객 감정 공감 - 불안/두려움 이해)\\\"\n고객: \\\"(예상 반응 - 감정 표현)\\\"\n설계사: \\\"(2. 심리적 안정 제공 - 공감 심화)\\\"\n고객: \\\"(예상 반응 - 신뢰 형성)\\\"\n설계사: \\\"(3. 논리적 근거 제시 - 약관/의료정보 등)\\\"\n고객: \\\"(예상 반응 - 이해 단계)\\\"\n설계사: \\\"(4. 구체적 해결책 제안)\\\"\n고객: \\\"(예상 반응 - 추가 질문)\\\"\n설계사: \\\"(5. 추가 설명 및 안심)\\\"\n고객: \\\"(예상 반응 - 긍정적 반응)\\\"\n설계사: \\\"(6. 마무리 - 후속 조치 안내)\\\"",
  "learningNeeds": "설계사가 추가로 학습해야 할 내용 (상품지식, 약관, 법률, 화법 등)",
  "actionGuidelines": "구체적 행동지침 - 다양한 시도 방법을 창의적으로 제시:\n1. [방법A]: 구체적 설명\n2. [방법B]: 구체적 설명\n3. [방법C]: 구체적 설명\n※ 30년 노하우와 업로드 자료 기반 차별화된 스킬",
  "references": [
    {
      "source": "출처명",
      "content": "인용 내용 (100-300자)",
      "url": "URL (선택)"
    }
  ],
  "aiAnalysis": "[1. AI 분석] 전체 요약",
  "coachingAdvice": "[2. 코칭] 전체 요약",
  "recommendedApproach": "설계사 성향 맞춤 접근법",
  "dialogueScript": "dialogue 필드와 동일",
  "requiredKnowledge": "learningNeeds와 동일",
  "tacitKnowledge": "30년 노하우 적용 내역"
}

🔥 **카테고리별 근거 제시 가이드 (CRITICAL):**

📌 **1. 세일즈프로세스**: 
- 프로세스 단계와 전략 명시 (Prospecting → Approach → Fact Finding → Planning → Presentation → Closing → Delivery)
- 30년 노하우 + Director 업로드 자료 인용
- 예: "신규 고객은 1차 관계구축 → 2차 니즈파악 → 3차 제안 순서로..."

📌 **2. 상품내용**:
- 보험사명 + 상품명 + 담보 내용 구체적 제시
- 경쟁 상품 비교 (장단점)
- 예: "00생명 프로텍트종신보험의 암진단금은..."

📌 **3. 약관조항** ⭐:
- **필수**: 보험사 + 상품명 + 약관 조항(제X조 X항) + 구체적 내용
- 예: "삼성화재 실손의료비보험 표준약관 제5조 2항에 따르면, '방사성리간드치료(RLT)'는 항암 방사선 치료 담보에 포함됩니다."
- ❌ "약관을 확인하세요" → ✅ "표준약관 제X조"

📌 **4. 보험업법등법률** ⭐:
- 법령명 + 조항 + 내용 명시
- 예: "보험업법 제97조(보험계약의 해지환급금), 시행령 제43조..."
- 금융감독원 규정, 유권해석 인용

📌 **5. 의료정보** ⭐⭐ (NEW):
- **질병코드**: KCD-10 코드 + 질병명 + 분류
  - 예: "C61 전립선의 악성신생물 (암 분류)"
- **의료상식**: 치료 방법, 의학 용어 설명
  - 예: "프로빅토 치료(방사성리간드치료, RLT)는 방사성 물질을 이용하여 암세포를 공격하는 치료법입니다."
- **치료과정**: 일반적인 치료 흐름, 기간, 비용
  - 예: "항암 방사선 치료는 통상 6~8주 과정으로 진행되며..."
- **의료 가이드라인**: 대한의학회, 건강보험심사평가원 기준
  - 예: "건강보험심사평가원 기준, 프로빅토 치료는 '방사선 치료' 항목으로 분류됩니다."
- ⚠️ **보험 연계**: 의료정보와 보험 약관의 연결고리 명확히 제시
  - 예: "KCD-10 C61(전립선암) → 암 진단금 지급 대상"

📌 **6. 사례검토**:
- 유사 사례 + 결과 + 교훈
- 과거 성공/실패 사례 분석
- 예: "작년 00설계사의 대형계약 사례를 보면..."

📌 **7. 동기부여** ⭐:
- **인문학적 근거 필수**: 심리학/철학/행동경제학/게임이론 등
- 예: "행동경제학의 '손실회피 편향'에 따르면..."
- 예: "게임이론의 '최후통첩게임'을 적용하면..."
- 예: "칼 융의 성격 유형론에서 ESTJ 유형은..."

📌 **8. 통계자료** ⭐:
- 출처 + 연도/분기 + 구체적 수치
- 예: "금융감독원 2024년 2분기 보험통계에 따르면, 실손보험 가입률은 82.3%..."
- 예: "생명보험협회 통계 기준, 보장성보험 해약률은..."

📌 **9. 보험비즈니스**:
- 영업 전략, 조직 관리, 고객 관리 등
- 시장 동향, 트렌드 분석
- 예: "디지털 마케팅 활용 전략..."

📌 **🔟 기타**:
- 위 카테고리에 속하지 않는 질문
- 일반적인 커리어 조언 등

🔥 **중요 지침**:
1. 추상적/이상적 답변 금지 → 구체적 실전 스크립트 + 근거 제공
2. 표준화된 답변 금지 → 설계사 성향 맞춤형 조언
3. 실제 대화 사례를 포함하여 대화 흐름 구성
4. 설계사의 약점을 보완하는 구체적 방법 제시
5. 매니저 지원이 필요한 부분을 명확히 지적
6. ⚠️ 예시 텍스트를 그대로 복사하지 말고, 주어진 상황에 맞는 실제 분석과 조언을 제공하세요
7. dialogueScript는 반드시 실제 대화문 형식(설계사: "..." / 고객: "...")으로 작성
8. 🌟 Director 업로드 자료의 구체적 수치, 사례, 스크립트를 **반드시 인용**하여 사용
9. 🔥 **모든 조언에는 반드시 구체적 근거를 references에 포함** (약관 조항, 의료 가이드라인, 통계 등)

💬 **화법(dialogue) 작성 시 필수 요구사항**:
1. **최소 6~8번 대화 주고받기** (설계사 4~5번, 고객 3~4번)
2. **심리학/인문학 기반 공감 대화 필수**:
   - 1~2번째 턴: 고객의 불안, 두려움, 걱정을 먼저 공감
   - 3~4번째 턴: 심리적 안정 제공 후 논리적 근거 제시
   - 5~6번째 턴: 구체적 해결책 + 후속 조치
3. **대화 흐름**: 감정 공감 → 심리적 안정 → 논리적 근거 → 해결책 → 마무리
4. **심리학 이론 활용 예시**:
   - 손실회피 편향: "지금 해지하시면 ○○만원 손실이..."
   - 확증편향: "고객님 생각이 맞습니다. 다만 한 가지 놓친 부분이..."
   - 프레이밍 효과: "보험료가 아니라 건강 지킴이 비용이라고..."
5. **고객 감정 상태별 대응**:
   - 불안: "걱정되시는 마음 충분히 이해합니다..."
   - 두려움: "많이 무서우셨겠어요. 제가 도와드리겠습니다..."
   - 회의: "그런 생각 하실 수 있습니다. 실제로는..."`

  const userPrompt = `📋 **코칭 요청 정보**

상황 유형: ${situationType}

설계사 정보:
- 이름: ${plannerProfile.name}
- 성향: ${plannerProfile.personalityType}
- 경력: ${plannerProfile.experienceYears}년
- 강점: ${plannerProfile.strengths}
- 약점: ${plannerProfile.weaknesses}

설계사 질문/상황:
${context}

---

🎯 **3단계 분석 시스템으로 코칭하세요:**

**1단계: AI 분석**
- analyzedQuestion: 질문의 요지 파악 (설계사가 정말 궁금한 것이 무엇인지)
- category: 9가지 카테고리 중 선택
- keyPoints: 핵심 포인트 3-5개

**2단계: 코칭**
- coachingPoint: 카테고리별 핵심 코칭 포인트
- coachingEvidence: 구체적 근거 (약관 조항/법률/인문학/통계)
- dialogue: 고객과의 대화 4~5번 주고받기
- learningNeeds: 추가 학습 필요 내용
- actionGuidelines: 다양한 시도 방법 (창의적으로!)

**3단계: 참조 자료**
- references: 모든 근거 자료 명시

⚠️ **필수 요구사항:**
1. 카테고리별 근거 제시 가이드 준수
2. 추상적 답변 금지 ("약관 확인" ❌ → "표준약관 제X조" ✅)
3. 설계사 성향(${plannerProfile.personalityType}) 맞춤 조언
4. dialogue는 반드시 4~5번 대화 형식
5. 인문학적 근거 (심리학/철학/행동경제학) 활용

JSON 형식으로 응답하세요.`

  try {
    const completion = await client.chat.completions.create({
      model: 'deep-seek-v4-flash', // GenSpark LLM Proxy allowed model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 5000, // 화법 섹션 강화(6~8번 대화) + 의료정보 카테고리 추가 + 충분한 응답 길이 확보
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    
    console.log('[AI Helper] Raw AI response (first 500 chars):', responseText.substring(0, 500))
    
    // JSON 마크다운 코드 블록 제거 (```json ... ```)
    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/,  '').replace(/```\s*$/, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/```\s*$/, '')
    }
    
    // 제어 문자 제거 (줄바꿈은 유지)
    cleanedResponse = cleanedResponse.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    
    // JSON 주석 제거 (// ...)
    cleanedResponse = cleanedResponse.replace(/\/\/[^\n]*/g, '')
    
    console.log('[AI Helper] Cleaned response (first 500 chars):', cleanedResponse.substring(0, 500))
    
    // JSON 파싱 시도
    try {
      const parsed = JSON.parse(cleanedResponse)
      
      // dialogue 배열을 문자열로 변환
      let dialogueText = parsed.dialogue || parsed.dialogueScript || '대화 시나리오 생성 중...'
      if (Array.isArray(dialogueText)) {
        dialogueText = dialogueText.map((turn: any) => {
          if (typeof turn === 'string') return turn
          const entries = Object.entries(turn)
          return entries.map(([speaker, text]) => `${speaker}: "${text}"`).join('\n')
        }).join('\n\n')
      }
      
      return {
        // 새 구조 (3단계 분석 시스템)
        analyzedQuestion: parsed.analyzedQuestion || parsed.aiAnalysis || '질문 분석 중...',
        category: parsed.category || '기타',
        keyPoints: parsed.keyPoints || parsed.aiAnalysis || '핵심 포인트 분석 중...',
        
        coachingPoint: parsed.coachingPoint || parsed.coachingAdvice || '코칭 포인트 생성 중...',
        coachingEvidence: parsed.coachingEvidence || '근거 분석 중...',
        dialogue: dialogueText,
        learningNeeds: parsed.learningNeeds || parsed.requiredKnowledge || '추가 학습 없음',
        actionGuidelines: parsed.actionGuidelines || parsed.recommendedApproach || '행동지침 생성 중...',
        
        references: parsed.references || [],
        
        // 기존 필드 (하위 호환)
        aiAnalysis: parsed.aiAnalysis || '상황을 분석 중입니다.',
        salesProcess: parsed.salesProcess,
        currentStage: parsed.currentStage,
        productSellingPoint: parsed.productSellingPoint,
        
        coachingAdvice: parsed.coachingAdvice || '조언을 생성 중입니다.',
        dialogueScript: parsed.dialogueScript || parsed.dialogue,
        requiredKnowledge: parsed.requiredKnowledge || parsed.learningNeeds,
        managerRequest: parsed.managerRequest,
        
        recommendedApproach: parsed.recommendedApproach || parsed.actionGuidelines || '접근법을 수립 중입니다.',
        tacitKnowledge: '[내부 참조용 - 30년 노하우 기반 코칭]',
      }
    } catch (parseError) {
      console.error('[AI Helper] ⚠️ JSON 파싱 실패, 폴백 응답 반환:', parseError)
      // JSON 파싱 실패 시 폴백 - 모든 필수 필드 포함
      return {
        // 새 구조 (3단계 분석 시스템) - 필수 필드
        analyzedQuestion: `${plannerProfile.name} 설계사의 ${situationType} 관련 질문 분석 중입니다.`,
        category: '기타',
        keyPoints: responseText.substring(0, 300) || '핵심 포인트 분석 중...',
        
        coachingPoint: '코칭 포인트 생성 중입니다.',
        coachingEvidence: '근거 자료를 분석 중입니다.',
        dialogue: `설계사: "고객님, ${context.substring(0, 50)}... 관련하여 상담 도와드리겠습니다."\n고객: "네, 자세히 설명해주세요."`,
        learningNeeds: '추가 학습 내용을 분석 중입니다.',
        actionGuidelines: '1. 현재 상황 파악\n2. 고객 니즈 이해\n3. 맞춤 솔루션 제시',
        
        references: [],
        
        // 기존 필드 (하위 호환)
        aiAnalysis: '보험 세일즈 프로세스 분석 중입니다.',
        salesProcess: '분석 중',
        currentStage: '상황 파악 단계',
        productSellingPoint: responseText.substring(0, 200),
        
        coachingAdvice: responseText.substring(0, 300) || '조언을 생성 중입니다.',
        dialogueScript: `설계사: "고객님, ${context.substring(0, 50)}... 관련하여 상담 도와드리겠습니다."\n고객: "네, 자세히 설명해주세요."`,
        requiredKnowledge: undefined,
        managerRequest: undefined,
        
        recommendedApproach: '1. 현재 상황 파악\n2. 고객 니즈 이해\n3. 맞춤 솔루션 제시',
        tacitKnowledge: '[내부 참조용 - 30년 노하우 기반 코칭]',
      }
    }
  } catch (error) {
    console.error('[AI Helper] ⚠️ AI 코칭 생성 오류:', error)
    
    // 폴백: 기본 응답 - 모든 필수 필드 포함
    return {
      // 새 구조 (3단계 분석 시스템) - 필수 필드
      analyzedQuestion: `${plannerProfile.name} 설계사의 ${situationType} 상황 분석`,
      category: '기타',
      keyPoints: `${plannerProfile.personalityType} 성향 맞춤 코칭이 필요합니다.\n강점: ${plannerProfile.strengths}\n약점: ${plannerProfile.weaknesses}`,
      
      coachingPoint: '현재 AI 서비스에 일시적인 문제가 있습니다. 기본 분석을 제공합니다.',
      coachingEvidence: '30년 노하우 기반 기본 코칭을 제공합니다.',
      dialogue: `설계사: "고객님, 안녕하세요. ${context.substring(0, 50)}... 관련하여 도움을 드리고자 합니다."\n고객: "네, 궁금한 점이 많습니다."\n설계사: "천천히 하나씩 설명드리겠습니다."`,
      learningNeeds: `${plannerProfile.specialization} 분야 심화 학습`,
      actionGuidelines: '1. 고객과의 신뢰 관계 구축\n2. 니즈 파악 및 경청\n3. 맞춤형 솔루션 제안',
      
      references: [],
      
      // 기존 필드 (하위 호환)
      aiAnalysis: '현재 AI 서비스에 일시적인 문제가 있습니다. 기본 분석을 제공합니다.',
      salesProcess: undefined,
      currentStage: undefined,
      productSellingPoint: undefined,
      
      coachingAdvice: `${plannerProfile.personalityType} 성향의 ${plannerProfile.name}님께서는 ${plannerProfile.strengths}을 활용하시되, ${plannerProfile.weaknesses} 부분에 주의하시면 좋겠습니다.`,
      dialogueScript: `설계사: "고객님, 안녕하세요. ${context.substring(0, 50)}... 관련하여 도움을 드리고자 합니다."\n고객: "네, 궁금한 점이 많습니다."\n설계사: "천천히 하나씩 설명드리겠습니다."`,
      requiredKnowledge: undefined,
      managerRequest: undefined,
      
      recommendedApproach: '1. 고객과의 신뢰 관계 구축\n2. 니즈 파악 및 경청\n3. 맞춤형 솔루션 제안',
      tacitKnowledge: '[내부 참조용 - 30년 노하우 기반]',
    }
  }
}
