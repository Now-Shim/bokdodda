// 디렉터 피드백 기반 재학습 시스템

export interface DirectorFeedback {
  sessionId: number
  rating: number  // 1-5
  feedbackText: string
  improvementAreas: string[]  // 개선 필요 영역
  strengths: string[]  // 잘한 점
  category: string
}

export interface LearningPattern {
  category: string
  goodExamples: string[]  // 디렉터가 높게 평가한 답변 패턴
  badExamples: string[]   // 개선 필요한 답변 패턴
  directorGuidelines: string[]  // 디렉터의 지침
}

/**
 * 디렉터 피드백을 학습 패턴으로 변환
 */
export function extractLearningPattern(
  feedback: DirectorFeedback,
  originalCoaching: any
): LearningPattern {
  const { rating, feedbackText, improvementAreas, strengths, category } = feedback
  
  const pattern: LearningPattern = {
    category,
    goodExamples: [],
    badExamples: [],
    directorGuidelines: []
  }
  
  // 평점 4-5: 좋은 예시로 저장
  if (rating >= 4) {
    if (originalCoaching.coachingEvidence) {
      pattern.goodExamples.push(`[근거 작성법] ${originalCoaching.coachingEvidence.substring(0, 300)}`)
    }
    if (originalCoaching.dialogue) {
      pattern.goodExamples.push(`[화법 작성법] ${originalCoaching.dialogue.substring(0, 300)}`)
    }
    if (strengths.length > 0) {
      pattern.directorGuidelines.push(`[디렉터 칭찬] ${strengths.join(', ')}`)
    }
  }
  
  // 평점 1-2: 개선 필요 예시
  if (rating <= 2 && improvementAreas.length > 0) {
    improvementAreas.forEach(area => {
      pattern.badExamples.push(`[개선 필요] ${area}`)
    })
  }
  
  // 디렉터 피드백을 지침으로 저장
  if (feedbackText) {
    pattern.directorGuidelines.push(`[디렉터 의견] ${feedbackText}`)
  }
  
  return pattern
}

/**
 * 학습 패턴을 프롬프트에 통합
 */
export function buildImprovedPrompt(
  basePrompt: string,
  learningPatterns: LearningPattern[],
  currentCategory: string
): string {
  // 현재 카테고리의 학습 패턴 필터링
  const relevantPatterns = learningPatterns.filter(p => p.category === currentCategory)
  
  if (relevantPatterns.length === 0) {
    return basePrompt
  }
  
  let learningSection = '\n\n---\n\n🎓 **디렉터 피드백 기반 학습 가이드**\n\n'
  
  // 좋은 예시
  const goodExamples = relevantPatterns.flatMap(p => p.goodExamples)
  if (goodExamples.length > 0) {
    learningSection += '✅ **디렉터가 높게 평가한 답변 패턴:**\n'
    goodExamples.slice(0, 3).forEach(ex => {
      learningSection += `\n${ex}\n`
    })
  }
  
  // 개선 필요 예시
  const badExamples = relevantPatterns.flatMap(p => p.badExamples)
  if (badExamples.length > 0) {
    learningSection += '\n❌ **디렉터가 지적한 개선 필요 패턴 (피하세요):**\n'
    badExamples.slice(0, 3).forEach(ex => {
      learningSection += `\n${ex}\n`
    })
  }
  
  // 디렉터 지침
  const guidelines = relevantPatterns.flatMap(p => p.directorGuidelines)
  if (guidelines.length > 0) {
    learningSection += '\n📌 **디렉터의 지침:**\n'
    guidelines.slice(0, 5).forEach(guide => {
      learningSection += `\n${guide}\n`
    })
  }
  
  learningSection += '\n⚠️ **위 학습 가이드를 반드시 반영하여 답변을 생성하세요.**\n'
  
  return basePrompt + learningSection
}

/**
 * 디렉터 피드백을 D1 데이터베이스에 저장
 */
export async function saveFeedbackLearning(
  db: any,
  sessionId: number,
  feedback: DirectorFeedback,
  pattern: LearningPattern
) {
  // feedback_learning 테이블에 저장
  await db.prepare(`
    INSERT INTO feedback_learning 
    (session_id, category, rating, feedback_text, good_examples, bad_examples, director_guidelines, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(
    sessionId,
    pattern.category,
    feedback.rating,
    feedback.feedbackText,
    JSON.stringify(pattern.goodExamples),
    JSON.stringify(pattern.badExamples),
    JSON.stringify(pattern.directorGuidelines)
  ).run()
}

/**
 * 카테고리별 학습 패턴 로드
 */
export async function loadLearningPatterns(
  db: any,
  category: string,
  limit: number = 10
): Promise<LearningPattern[]> {
  const result = await db.prepare(`
    SELECT * FROM feedback_learning 
    WHERE category = ? AND rating >= 4
    ORDER BY created_at DESC 
    LIMIT ?
  `).bind(category, limit).all()
  
  return result.results.map((row: any) => ({
    category: row.category,
    goodExamples: JSON.parse(row.good_examples || '[]'),
    badExamples: JSON.parse(row.bad_examples || '[]'),
    directorGuidelines: JSON.parse(row.director_guidelines || '[]')
  }))
}
