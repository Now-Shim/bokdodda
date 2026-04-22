// AI 코칭 헬퍼 함수 (Google Gemini 사용 - Gemini 수준 답변 품질)
// Cloudflare Workers 환경에서는 REST API 직접 호출 (SDK 대신)
import type { CoachingRequest, CoachingResponse, CoachingReference } from './ai-helper'

/**
 * Google Gemini를 사용한 고품질 AI 코칭 생성
 * 
 * Gemini의 장점:
 * 1. 긴 컨텍스트 처리 (128K tokens)
 * 2. 구조화된 JSON 출력
 * 3. 의료/법률 정보 정확도 높음
 * 4. 한국어 성능 우수
 */
export async function generateAICoachingWithGemini(request: CoachingRequest): Promise<CoachingResponse> {
  const { context, situationType, plannerProfile, directorKnowledge, env } = request

  // Gemini API 키 가져오기
  const apiKey = env?.GEMINI_API_KEY || process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.')
  }

  // SDK는 Cloudflare Workers와 호환되지 않으므로 REST API 사용

  // Director 지식 자료 섹션
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
Google Gemini 수준의 체계적이고 전문적인 3단계 분석 시스템으로 설계사에게 코칭을 제공합니다.

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

📋 **응답 형식 (JSON Schema):**

{
  "analyzedQuestion": "설계사가 궁금해하는 핵심 질문 명확히 정리",
  "category": "세일즈프로세스|상품내용|약관조항|보험업법등법률|의료정보|사례검토|동기부여|통계자료|보험비즈니스|기타",
  "keyPoints": "핵심 포인트 3-5개 bullet points (\\n구분)",
  "coachingPoint": "카테고리별 핵심 코칭 포인트 (200-400자)",
  "coachingEvidence": "카테고리별 구체적 근거 (300-500자):\\n- 약관: 보험사+상품명+약관 제X조\\n- 법률: 법령명+조항\\n- 의료: KCD-10 코드+질병명+치료법\\n- 통계: 출처+연도+수치",
  "dialogue": "실전 대화 스크립트 (4-5번 주고받기, 600-800자):\\n\\n설계사: \\"...\\"\\n고객: \\"...\\"\\n설계사: \\"...\\"\\n고객: \\"...\\"\\n...",
  "learningNeeds": "추가 학습 필요 내용 (상품지식, 약관, 법률, 화법)",
  "actionGuidelines": "구체적 행동지침 3가지:\\n\\n[방법A - 명확한 제목]:\\n구체적 설명 (100-200자)\\n\\n[방법B - 명확한 제목]:\\n구체적 설명 (100-200자)\\n\\n[방법C - 명확한 제목]:\\n구체적 설명 (100-200자)",
  "references": [
    {
      "source": "출처명 (보험사, 법령, 학회 등)",
      "content": "인용 내용 (100-300자)",
      "url": "URL (선택사항)"
    }
  ],
  "aiAnalysis": "전체 상황 요약",
  "coachingAdvice": "핵심 조언 요약",
  "recommendedApproach": "설계사 성향 맞춤 접근법",
  "tacitKnowledge": "30년 노하우 적용 내역"
}

🔥 **카테고리별 근거 제시 가이드 (CRITICAL):**

📌 **1. 약관조항** ⭐:
- **필수**: 보험사 + 상품명 + 약관 조항(제X조 X항) + 구체적 내용
- 예: "삼성화재 실손의료비보험 표준약관 제5조 2항에 따르면, '방사성리간드치료(RLT)'는 방사선 치료에 해당하며, 항암 방사선 치료 담보에서 보장됩니다."

📌 **2. 의료정보** ⭐⭐:
- **질병코드**: KCD-10 코드 + 질병명 + 분류
  - 예: "C61 전립선의 악성신생물 (암)"
- **치료법**: 치료명 + 의학적 정의 + 보험 연계
  - 예: "Pluvicto 치료는 방사성리간드치료(Radioligand Therapy, RLT)로, 방사성 동위원소를 이용한 표적 치료입니다. 건강보험심사평가원 기준 '항암 방사선 치료'로 분류됩니다."
- **보험 연계**: 의료정보 → 약관 담보 연결
  - 예: "KCD-10 기준 'C61 전립선암'은 암 진단금 지급 대상이며, Pluvicto 치료는 표준약관상 '항암 방사선 치료' 담보에서 보장됩니다."

📌 **3. 보험업법등법률** ⭐:
- 법령명 + 조항 + 내용 명시
- 예: "보험업법 제97조(보험계약의 해지환급금), 금융감독원 규정 제X조..."

📌 **4. 통계자료** ⭐:
- 출처 + 연도 + 구체적 수치
- 예: "금융감독원 2024년 2분기 보험통계: 실손보험 가입률 82.3%"

🔥 **중요 지침**:
1. 추상적 답변 금지 → 구체적 근거 + 실전 스크립트
2. "약관 확인하세요" ❌ → "표준약관 제X조 X항" ✅
3. 설계사 성향 맞춤형 조언
4. dialogue는 반드시 6-8번 대화 (심리학 기반 공감 포함)
5. 모든 근거는 references에 명시`

  const userPrompt = `📋 **코칭 요청**

상황 유형: ${situationType}

설계사 질문/상황:
${context}

---

🎯 3단계 분석 시스템으로 JSON 응답 생성:

**1단계: AI 분석**
- analyzedQuestion, category, keyPoints

**2단계: 코칭**
- coachingPoint, coachingEvidence, dialogue (6-8번 대화), learningNeeds, actionGuidelines

**3단계: 참조 자료**
- references (모든 근거 자료 명시)

JSON 형식으로 응답하세요.`

  // 503 에러 재시도 로직
  let lastError: Error | null = null
  const maxRetries = 2
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Cloudflare Workers 환경에서 REST API 직접 호출
      // gemini-2.5-flash 사용 (최신 모델, 1M tokens 입력, 65K 출력)
      // 결제 활성화 후 안정적으로 작동
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`
      
      // JSON 응답을 받기 위해 프롬프트에 명시
      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\n**IMPORTANT: 반드시 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.**` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 6000, // 4000 → 6000 (dialogue 완전 생성 보장)
          topP: 0.9,
          topK: 40,
        }
      }
      
      console.log(`[Gemini AI] REST API 호출 중... (시도 ${attempt}/${maxRetries})`)
      console.log('[Gemini AI] API URL:', apiUrl.substring(0, 80) + '...')
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('[Gemini AI] HTTP status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Gemini AI] Error response:', errorText.substring(0, 500))
        
        // 503/429 에러이고 재시도 가능하면 다시 시도
        if ((response.status === 503 || response.status === 429) && attempt < maxRetries) {
          console.log(`[Gemini AI] ⚠️ ${response.status} 에러 - ${attempt + 1}번째 시도 대기 중... (3초 후)`)
          await new Promise(resolve => setTimeout(resolve, 3000))
          lastError = new Error(`Gemini API ${response.status} error (attempt ${attempt})`)
          continue
        }
        
        throw new Error(`Gemini API error (${response.status}): ${errorText}`)
      }
      
      // 성공한 경우 파싱 진행
      const result = await response.json() as any
    console.log('[Gemini AI] Result structure:', JSON.stringify({
      hasCandidates: !!result.candidates,
      candidatesLength: result.candidates?.length,
      hasContent: !!result.candidates?.[0]?.content,
      hasParts: !!result.candidates?.[0]?.content?.parts,
      partsLength: result.candidates?.[0]?.content?.parts?.length
    }))
    
    let jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    
    console.log('[Gemini AI] Raw response (first 500 chars):', jsonText.substring(0, 500))
    console.log('[Gemini AI] Raw response (last 200 chars):', jsonText.substring(Math.max(0, jsonText.length - 200)))
    console.log('[Gemini AI] Total length:', jsonText.length)
    
    // Gemini가 코드 블록(```json ... ```)으로 감싸서 응답하는 경우 제거
    jsonText = jsonText.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      console.log('[Gemini AI] Removed markdown code block wrapper')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '')
      console.log('[Gemini AI] Removed markdown code block wrapper')
    }
    
    console.log('[Gemini AI] After cleanup (first 300):', jsonText.substring(0, 300))
    console.log('[Gemini AI] After cleanup (last 100):', jsonText.substring(Math.max(0, jsonText.length - 100)))
    
    // JSON 완결성 검증 및 자동 복구 (간소화)
    const openBraces = (jsonText.match(/{/g) || []).length
    const closeBraces = (jsonText.match(/}/g) || []).length
    const openBrackets = (jsonText.match(/\[/g) || []).length
    const closeBrackets = (jsonText.match(/]/g) || []).length
    
    console.log('[Gemini AI] 괄호 균형 검사:', { openBraces, closeBraces, openBrackets, closeBrackets })
    
    // 불완전한 JSON이면 자동 복구
    if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
      console.log('[Gemini AI] ⚠️ 불완전한 JSON 감지 - 자동 복구 시작')
      
      // 간단한 복구: 마지막 불완전한 줄 제거 + 닫는 괄호 추가
      const lines = jsonText.split('\n')
      
      // 마지막 줄이 완전한지 확인
      let lastValidIndex = lines.length - 1
      while (lastValidIndex > 0) {
        const line = lines[lastValidIndex].trim()
        // 빈 줄, 완전하지 않은 줄은 제거
        if (line === '' || (!line.endsWith(',') && !line.endsWith('{') && !line.endsWith('[') && !line.endsWith('}') && !line.endsWith(']') && !line.match(/^"[^"]+"\s*:\s*"[^"]*"$/))) {
          console.log('[Gemini AI] 불완전한 줄 제거:', line.substring(0, 100))
          lastValidIndex--
        } else {
          break
        }
      }
      
      // 마지막 유효한 줄까지만 유지
      jsonText = lines.slice(0, lastValidIndex + 1).join('\n')
      
      // 마지막 줄에 쉼표가 있으면 제거
      jsonText = jsonText.replace(/,\s*$/, '')
      
      // 필요한 닫는 괄호 추가
      const finalOpenBrackets = (jsonText.match(/\[/g) || []).length
      const finalCloseBrackets = (jsonText.match(/]/g) || []).length
      const finalOpenBraces = (jsonText.match(/{/g) || []).length
      const finalCloseBraces = (jsonText.match(/}/g) || []).length
      
      for (let i = 0; i < finalOpenBrackets - finalCloseBrackets; i++) {
        jsonText += '\n]'
        console.log('[Gemini AI] 닫는 대괄호 ] 추가')
      }
      for (let i = 0; i < finalOpenBraces - finalCloseBraces; i++) {
        jsonText += '\n}'
        console.log('[Gemini AI] 닫는 중괄호 } 추가')
      }
      
      console.log('[Gemini AI] ✅ JSON 자동 복구 완료')
      console.log('[Gemini AI] 복구된 JSON (last 300):', jsonText.substring(Math.max(0, jsonText.length - 300)))
    }
    
    // JSON 파싱 시도 (에러 복구 로직 포함)
    let parsed: any
    try {
      parsed = JSON.parse(jsonText)
    } catch (parseError: any) {
      console.error('[Gemini AI] JSON 파싱 1차 실패:', parseError.message)
      console.error('[Gemini AI] 파싱 실패 위치:', parseError.message.match(/position (\d+)/)?.[1])
      
      // 복구 시도 1: 이스케이프 처리되지 않은 따옴표 수정
      try {
        console.log('[Gemini AI] 복구 시도 1: 이스케이프 처리')
        // 필드명을 제외한 값 내부의 따옴표를 이스케이프
        let fixedText = jsonText
        
        // 복구 시도 2: 불완전한 JSON 종료 처리
        const lines = fixedText.split('\n')
        if (!fixedText.trim().endsWith('}') && !fixedText.trim().endsWith(']')) {
          console.log('[Gemini AI] 복구 시도 2: 불완전한 마지막 줄 제거')
          
          // 마지막 불완전한 줄 찾기
          let lastValidIndex = lines.length - 1
          while (lastValidIndex >= 0) {
            const line = lines[lastValidIndex].trim()
            // 완전한 필드를 찾으면 중단
            if (line.endsWith(',') || line.endsWith('}') || line.endsWith(']')) {
              break
            }
            lastValidIndex--
          }
          
          fixedText = lines.slice(0, lastValidIndex + 1).join('\n')
          
          // 닫는 중괄호 추가
          const openBraces = (fixedText.match(/{/g) || []).length
          const closeBraces = (fixedText.match(/}/g) || []).length
          const openBrackets = (fixedText.match(/\[/g) || []).length
          const closeBrackets = (fixedText.match(/]/g) || []).length
          
          console.log('[Gemini AI] 괄호 균형:', { openBraces, closeBraces, openBrackets, closeBrackets })
          
          // 필요한 만큼 닫는 괄호 추가
          for (let i = 0; i < openBrackets - closeBrackets; i++) {
            fixedText += '\n]'
          }
          for (let i = 0; i < openBraces - closeBraces; i++) {
            fixedText += '\n}'
          }
        }
        
        parsed = JSON.parse(fixedText)
        console.log('[Gemini AI] ✅ JSON 복구 성공')
      } catch (retryError: any) {
        console.error('[Gemini AI] JSON 복구 실패:', retryError.message)
        
        // 복구 시도 3: 기본 구조만 반환
        console.log('[Gemini AI] 복구 시도 3: 기본 구조 반환')
        parsed = {
          analyzedQuestion: '파싱 실패 - 원본 응답 확인 필요',
          category: '기타',
          keyPoints: '응답을 파싱할 수 없습니다.',
          coachingPoint: '기술적 문제로 코칭을 생성할 수 없습니다. 다시 시도해주세요.',
          coachingEvidence: `원본 응답 (처음 500자):\n${jsonText.substring(0, 500)}`,
          dialogue: '대화 스크립트 생성 실패',
          learningNeeds: '다시 시도 필요',
          actionGuidelines: '1. 잠시 후 다시 시도\n2. 질문을 더 간단하게 수정\n3. 관리자에게 문의',
          references: []
        }
      }
    }
    
    // dialogue 문자열 변환
    let dialogueText = parsed.dialogue || '대화 시나리오 생성 중...'
    if (Array.isArray(dialogueText)) {
      dialogueText = dialogueText.join('\n\n')
    }
    
    // keyPoints 문자열 변환 (배열인 경우)
    let keyPointsText = parsed.keyPoints || '핵심 포인트 분석 중...'
    if (Array.isArray(keyPointsText)) {
      keyPointsText = keyPointsText.join('\n')
    }
    
      // 성공 시 결과 반환
      return {
        // 새 구조 (3단계 분석 시스템)
        analyzedQuestion: parsed.analyzedQuestion || '질문 분석 중...',
        category: parsed.category || '기타',
        keyPoints: keyPointsText,
        
        coachingPoint: parsed.coachingPoint || '코칭 포인트 생성 중...',
        coachingEvidence: parsed.coachingEvidence || '근거 분석 중...',
        dialogue: dialogueText,
        learningNeeds: parsed.learningNeeds || '추가 학습 없음',
        actionGuidelines: parsed.actionGuidelines || '행동지침 생성 중...',
        
        references: parsed.references || [],
        
        // 기존 필드 (하위 호환)
        aiAnalysis: parsed.aiAnalysis || parsed.analyzedQuestion,
        salesProcess: parsed.salesProcess,
        currentStage: parsed.currentStage,
        productSellingPoint: parsed.productSellingPoint,
        
        coachingAdvice: parsed.coachingAdvice || parsed.coachingPoint,
        dialogueScript: parsed.dialogueScript || dialogueText,
        requiredKnowledge: parsed.requiredKnowledge || parsed.learningNeeds,
        managerRequest: parsed.managerRequest,
        
        recommendedApproach: parsed.recommendedApproach || parsed.actionGuidelines,
        tacitKnowledge: '[Gemini AI - 30년 노하우 기반 코칭]',
      }
    } catch (attemptError) {
      console.error(`[Gemini AI] 시도 ${attempt} 실패:`, attemptError)
      lastError = attemptError as Error
      
      // 마지막 시도가 아니면 재시도
      if (attempt < maxRetries) {
        console.log(`[Gemini AI] ⚠️ ${attempt + 1}번째 시도 대기 중... (3초 후)`)
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }
  }
  
  // 모든 시도 실패
  console.error('[Gemini AI] 모든 재시도 실패')
  throw lastError || new Error('Gemini API 호출 실패')
}
