// 데이터 타입 정의
export interface User {
  id: number
  email: string
  name: string
  password: string
  role: 'planner' | 'manager' | 'director'
  phone?: string
}

export interface PlannerProfile {
  id: number
  userId: number
  personalityType: string
  salesStyle: string
  experienceYears: number
  specialization: string
  strengths: string
  weaknesses: string
  totalCoachingSessions: number
  totalTrainingCompleted: number
}

export interface CoachingSession {
  id: number
  plannerId: number
  sessionDate: string
  context: string
  situationType: string
  
  // AI 코칭 응답 (새 구조)
  aiAnalysis: string // 보험 세일즈 프로세스 & 현 단계 & 컨셉 & 상품 selling point
  salesProcess?: string // 보험 세일즈 프로세스
  currentStage?: string // 현재 단계
  productSellingPoint?: string // 상품 판매 포인트
  
  coachingAdvice: string // 구체적 대화 흐름 & 필요 지식 & 매니저 요청
  dialogueScript?: string // 구체적 대화 흐름/스크립트
  requiredKnowledge?: string // 설계사에게 필요한 지식
  managerRequest?: string // 매니저에게 요청할 사항
  
  recommendedApproach: string // 설계사 성향 기반 참신한 아이디어
  tacitKnowledgeApplied: string // 30년 노하우 (AI 내부 참조용)
  references?: Array<{ source: string, content: string, url?: string }> // 참조 자료 (근거)
  
  isShared: boolean
  effectivenessRating?: number
  plannerFeedback?: string
  
  // 관리자/Director 관련
  managerNote?: string // 관리자 내부 노트
  directorFeedback?: string // Director 피드백
  directorRating?: number // Director 평가 (1-5)
  isValidated: boolean // Director 검증 여부
  useForLearning: boolean // 재학습 데이터로 사용 여부
}

export interface TrainingProgram {
  id: number
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  durationMinutes: number
  enrollmentCount: number
  completionCount: number
}

export interface KnowledgeBase {
  id: number
  title: string
  category: string
  content: string
  fileType?: 'text' | 'file' // 'text': 직접 입력, 'file': 파일 업로드
  fileName?: string // 업로드된 파일명
  fileSize?: number // 파일 크기 (bytes)
  priority: boolean
  uploadedAt: string
  uploadedBy: number // Director ID
}

// Mock Database
export const users: User[] = [
  // Director
  { id: 1, email: 'director@bukdotda.com', name: '최호석 센터장', password: 'director123', role: 'director', phone: '010-4652-8936' },
  
  // Manager
  { id: 2, email: 'manager@bukdotda.com', name: '김관리', password: 'manager123', role: 'manager', phone: '010-1111-2222' },
  
  // Planners (10명)
  { id: 11, email: 'planner01@bukdotda.com', name: '이영수', password: 'demo123', role: 'planner', phone: '010-2001-0001' },
  { id: 12, email: 'planner02@bukdotda.com', name: '박민지', password: 'demo123', role: 'planner', phone: '010-2002-0002' },
  { id: 13, email: 'planner03@bukdotda.com', name: '김철수', password: 'demo123', role: 'planner', phone: '010-2003-0003' },
  { id: 14, email: 'planner04@bukdotda.com', name: '정수연', password: 'demo123', role: 'planner', phone: '010-2004-0004' },
  { id: 15, email: 'planner05@bukdotda.com', name: '최동훈', password: 'demo123', role: 'planner', phone: '010-2005-0005' },
  { id: 16, email: 'planner06@bukdotda.com', name: '강미래', password: 'demo123', role: 'planner', phone: '010-2006-0006' },
  { id: 17, email: 'planner07@bukdotda.com', name: '윤서진', password: 'demo123', role: 'planner', phone: '010-2007-0007' },
  { id: 18, email: 'planner08@bukdotda.com', name: '장현우', password: 'demo123', role: 'planner', phone: '010-2008-0008' },
  { id: 19, email: 'planner09@bukdotda.com', name: '오지혜', password: 'demo123', role: 'planner', phone: '010-2009-0009' },
  { id: 20, email: 'planner10@bukdotda.com', name: '서준호', password: 'demo123', role: 'planner', phone: '010-2010-0010' },
]

export const plannerProfiles: PlannerProfile[] = [
  { id: 1, userId: 11, personalityType: 'ESTJ', salesStyle: '분석적', experienceYears: 5, specialization: '생명보험', strengths: '체계적인 상품 설명, 논리적 설득', weaknesses: '감성적 공감 부족', totalCoachingSessions: 15, totalTrainingCompleted: 3 },
  { id: 2, userId: 12, personalityType: 'ENFP', salesStyle: '관계중심', experienceYears: 3, specialization: '손해보험', strengths: '친근한 관계 형성, 고객 니즈 파악', weaknesses: '계약 클로징 약함', totalCoachingSessions: 8, totalTrainingCompleted: 2 },
  { id: 3, userId: 13, personalityType: 'ISTJ', salesStyle: '공격적', experienceYears: 8, specialization: '생명보험', strengths: '빠른 계약 체결, 목표 달성력', weaknesses: '장기 관계 유지 어려움', totalCoachingSessions: 22, totalTrainingCompleted: 4 },
  { id: 4, userId: 14, personalityType: 'INFJ', salesStyle: '관계중심', experienceYears: 2, specialization: '종합보험', strengths: '고객 신뢰 구축, 세심한 관리', weaknesses: '신규 고객 개척 소극적', totalCoachingSessions: 5, totalTrainingCompleted: 1 },
  { id: 5, userId: 15, personalityType: 'ENTJ', salesStyle: '공격적', experienceYears: 7, specialization: '생명보험', strengths: '강한 추진력, 대형 계약 성사', weaknesses: '고객 거부감 발생 가능', totalCoachingSessions: 18, totalTrainingCompleted: 5 },
  { id: 6, userId: 16, personalityType: 'ISFP', salesStyle: '관계중심', experienceYears: 4, specialization: '손해보험', strengths: '따뜻한 서비스, 고객 만족도 높음', weaknesses: '영업 실적 압박 스트레스', totalCoachingSessions: 12, totalTrainingCompleted: 2 },
  { id: 7, userId: 17, personalityType: 'ESTP', salesStyle: '분석적', experienceYears: 6, specialization: '종합보험', strengths: '시장 트렌드 파악, 상품 지식 우수', weaknesses: '서류 작업 지연', totalCoachingSessions: 16, totalTrainingCompleted: 3 },
  { id: 8, userId: 18, personalityType: 'INFP', salesStyle: '관계중심', experienceYears: 1, specialization: '생명보험', strengths: '진정성 있는 상담, 고객 공감', weaknesses: '자신감 부족, 영업 경험 부족', totalCoachingSessions: 3, totalTrainingCompleted: 1 },
  { id: 9, userId: 19, personalityType: 'ENFJ', salesStyle: '공격적', experienceYears: 5, specialization: '손해보험', strengths: '카리스마, 리더십, 팀 협력', weaknesses: '개인 성과 집착', totalCoachingSessions: 14, totalTrainingCompleted: 4 },
  { id: 10, userId: 20, personalityType: 'INTP', salesStyle: '분석적', experienceYears: 9, specialization: '종합보험', strengths: '복잡한 상품 설계, 문제 해결 능력', weaknesses: '고객 소통 어려움', totalCoachingSessions: 25, totalTrainingCompleted: 6 },
]

export const coachingSessions: CoachingSession[] = [
  {
    id: 1,
    plannerId: 11,
    sessionDate: '2025-01-20T10:30:00',
    context: '신규 고객과 첫 만남에서 보험 이야기를 꺼내자마자 거부감을 보였습니다. 어떻게 접근해야 할까요?',
    situationType: '신규고객',
    aiAnalysis: '고객이 보험에 대한 선입견이나 부정적 경험이 있을 가능성. 직접적인 상품 제안보다는 관계 형성 우선 필요.',
    coachingAdvice: '첫 만남에서는 보험 이야기를 최소화하고, 고객의 현재 상황과 걱정거리를 경청하세요. "어떤 부분이 가장 걱정되세요?" 같은 열린 질문으로 시작하고, 2-3회 만남 후 자연스럽게 보험 이야기를 꺼내세요.',
    recommendedApproach: '1차 만남: 관계 구축 및 경청\n2차 만남: 고객 니즈 파악\n3차 만남: 솔루션으로서 보험 소개',
    tacitKnowledgeApplied: '[30년 노하우] 급하게 계약하려는 마음이 고객에게 전달되면 신뢰가 무너집니다. 진정한 관심을 보이고 천천히 접근하세요.',
    isShared: true,
    effectivenessRating: 5,
    plannerFeedback: '정말 도움되었습니다. 천천히 접근했더니 3번째 만남에서 고객이 먼저 보험 상담을 요청했어요!',
    managerNote: '이영수 설계사는 분석적 성향이 강해 첫 만남에서 너무 많은 정보를 제공하는 경향. 감성적 접근 교육 필요.',
    directorFeedback: '우수 사례. ESTJ 성향에게는 "체계적으로 천천히"가 핵심. 이 케이스를 신규 설계사 교육에 활용 가능.',
    directorRating: 5,
    isValidated: true,
    useForLearning: true,
  },
  {
    id: 2,
    plannerId: 12,
    sessionDate: '2025-01-22T14:00:00',
    context: '기존 고객이 보험료가 부담된다며 해지를 고려하고 있습니다. 어떻게 설득해야 할까요?',
    situationType: '기존고객',
    aiAnalysis: '경제적 어려움으로 인한 해지 고려. 단순 설득보다는 고객 상황 이해와 실질적 해결책 제시 필요.',
    coachingAdvice: '먼저 고객의 경제적 상황을 공감하고, 해지의 불이익을 설명하기보다는 대안을 제시하세요. 보장 축소, 보험료 감액, 납입 유예 등의 옵션을 함께 검토하세요.',
    recommendedApproach: '1. 공감 표현: "요즘 경제적으로 많이 어려우시죠?"\n2. 대안 제시: 보험료 조정 옵션 설명\n3. 핵심 보장 유지: 최소한의 보장 강조',
    tacitKnowledgeApplied: '[30년 노하우] 해지를 막으려고만 하면 고객은 더 멀어집니다. 고객 입장에서 최선의 방법을 함께 찾아주면, 나중에 상황이 나아졌을 때 다시 찾아옵니다.',
    isShared: true,
    effectivenessRating: 4,
    plannerFeedback: '고객이 감동해서 일부만 줄이고 유지하기로 했습니다. 감사합니다.',
    managerNote: '박민지 설계사는 공감 능력은 우수하나 대안 제시 시 자신감 부족. 상품 지식 보강 필요.',
    directorFeedback: 'ENFP 성향의 공감 능력이 잘 발휘된 케이스. 다만 클로징 기법 교육 추천.',
    directorRating: 4,
    isValidated: true,
    useForLearning: true,
  },
]

export const trainingPrograms: TrainingProgram[] = [
  { id: 1, title: '신규 고객 개척 전략', description: '체계적인 신규 고객 개척 방법론과 실전 기법', category: '영업기법', difficulty: 'beginner', durationMinutes: 120, enrollmentCount: 45, completionCount: 32 },
  { id: 2, title: '클로징 기법 마스터', description: '계약 성사를 위한 고급 클로징 기법', category: '영업기법', difficulty: 'advanced', durationMinutes: 180, enrollmentCount: 28, completionCount: 15 },
  { id: 3, title: '장기 고객 관계 관리', description: '고객 이탈 방지와 지속적인 관계 유지 전략', category: '고객관리', difficulty: 'intermediate', durationMinutes: 90, enrollmentCount: 52, completionCount: 38 },
  { id: 4, title: '보험 상품 지식 심화', description: '생명보험 및 손해보험 상품의 심화 이해', category: '상품지식', difficulty: 'intermediate', durationMinutes: 150, enrollmentCount: 67, completionCount: 45 },
  { id: 5, title: '감성 영업 커뮤니케이션', description: '고객의 감성을 이해하고 공감하는 커뮤니케이션', category: '고객관리', difficulty: 'beginner', durationMinutes: 100, enrollmentCount: 41, completionCount: 29 },
  { id: 6, title: '디지털 영업 도구 활용', description: '디지털 시대의 효율적인 영업 도구 활용법', category: '영업기법', difficulty: 'beginner', durationMinutes: 60, enrollmentCount: 35, completionCount: 28 },
]

export const knowledgeBase: KnowledgeBase[] = [
  {
    id: 1,
    title: '신규 고객 첫 만남 전략',
    category: '영업기법',
    content: `## 신규 고객 첫 만남 전략

### 핵심 원칙
1. 첫 만남에서는 절대 보험 이야기를 하지 마세요
2. 고객의 현재 고민을 경청하세요
3. 3번째 만남 이후 자연스럽게 솔루션 제시

### 30년 노하우
- 급하게 계약하려는 마음이 고객에게 전달되면 신뢰가 무너집니다.
- 진정한 관심을 보이고 천천히 접근하세요.
- "어떤 부분이 가장 걱정되세요?" 같은 열린 질문으로 시작하세요.

### 실전 팁
- 1차 만남: 관계 구축 및 경청
- 2차 만남: 고객 니즈 파악
- 3차 만남: 솔루션으로서 보험 소개`,
    priority: true,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 1
  },
  {
    id: 2,
    title: '거절 대응 전략',
    category: '고객관리',
    content: `## 거절 대응 전략

### 거절의 유형
1. 경제적 이유: "보험료가 부담됩니다"
2. 필요성 부족: "저는 아직 필요 없어요"
3. 불신: "보험은 믿을 수 없어요"

### 대응 방법
- 경제적 이유: 대안 제시 (보장 축소, 납입 유예)
- 필요성 부족: 사례 중심 설명
- 불신: 공감하고 투명하게 설명

### 30년 노하우
- 거절을 막으려고만 하면 고객은 더 멀어집니다.
- 고객 입장에서 최선의 방법을 함께 찾아주세요.
- 지금 계약이 안 되어도 신뢰를 쌓으면 나중에 다시 찾아옵니다.`,
    priority: true,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 1
  }
]
