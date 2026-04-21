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

// 코칭 카테고리 타입
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

export interface CoachingSession {
  id: number
  plannerId: number
  sessionDate: string
  context: string
  situationType: string
  
  // 1. AI 분석 (새 구조 - 3단계 분석 시스템)
  analyzedQuestion?: string // 파악된 질문 (질문의 요지)
  category?: CoachingCategory // 카테고리
  keyPoints?: string // 핵심 포인트
  
  // 2. 코칭 (근거 기반 상세 코칭)
  coachingPoint?: string // 코칭 포인트 (카테고리별 핵심)
  coachingEvidence?: string // 코칭 근거 (약관/법률/인문학적 근거)
  dialogue?: string // 화법 (고객과의 4~5번 대화)
  learningNeeds?: string // 학습 필요 내용
  actionGuidelines?: string // 구체적인 행동지침 (다양한 시도 방법)
  
  // 3. 설계사 Feedback (대화창 형태)
  conversationMessages?: Array<{
    id: number
    sender: 'planner' | 'ai'
    message: string
    timestamp: string
  }>
  
  // 참조 자료 (근거)
  references?: Array<{ source: string, content: string, url?: string }>
  
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
  tacitKnowledgeApplied: string
  
  isShared: boolean
  effectivenessRating?: number
  plannerFeedback?: string
  
  // Director 관련
  managerNote?: string
  directorFeedback?: string // Director 피드백
  director30YearsKnowledge?: string // Director 30년 노하우 추가 (Relearning용)
  directorRating?: number
  isValidated: boolean
  useForLearning: boolean
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
  category: CoachingCategory // 카테고리 타입 통일
  content: string
  fileType?: 'text' | 'file' | 'pdf' // 'text': 직접 입력, 'file': 파일 업로드, 'pdf': PDF 업로드
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
  // 이영수 설계사 (plannerId: 11) 코칭 세션들
  {
    id: 1,
    plannerId: 11,
    sessionDate: '2025-01-20T10:30:00',
    context: '신규 고객과 첫 만남에서 보험 이야기를 꺼내자마자 거부감을 보였습니다. 어떻게 접근해야 할까요?',
    situationType: '신규고객',
    
    // 3단계 분석 필드
    analyzedQuestion: '신규 고객이 보험 이야기에 거부감을 보일 때 효과적인 접근 방법',
    category: '세일즈프로세스',
    keyPoints: '• 첫 만남에서의 관계 형성 중요성\n• 고객의 거부감 원인 파악\n• 단계별 신뢰 구축 전략',
    coachingPoint: '첫 만남에서는 보험 상품을 언급하지 말고, 고객의 현재 상황과 고민을 경청하는 것에 집중하세요.',
    coachingEvidence: '**심리학적 근거**: 초기 인상 형성 이론(Primacy Effect)에 따르면 첫 만남에서 형성된 이미지는 이후 관계에 지속적 영향을 미칩니다. (출처: 솔로몬 애쉬의 인상형성 연구, 1946)\n\n**행동경제학**: 손실회피 편향으로 인해 고객은 보험료 지출을 손실로 인식하기 쉽습니다. 관계 형성 후 보장의 가치를 먼저 인식시켜야 합니다.',
    dialogue: '**[1차 만남]**\n설계사: "오늘 시간 내주셔서 감사합니다. 요즘 가장 걱정되시는 부분이 있으신가요?"\n고객: "음... 아이 교육비랑 노후 준비가 걱정이네요."\n설계사: "그렇군요. 자녀분이 몇 살이신가요?"\n\n**[2차 만남]**\n설계사: "지난번 말씀하신 교육비 준비, 구체적으로 어떤 계획을 갖고 계신가요?"\n고객: "아직 뚜렷한 계획은 없어요."\n설계사: "그렇다면 제가 몇 가지 방법을 정리해서 다음에 보여드릴게요. 부담 갖지 마시고요."\n\n**[3차 만남]**\n설계사: "교육비 준비 방법 중에 보험도 하나의 옵션이 될 수 있어요. 한번 살펴보실래요?"',
    learningNeeds: '• 고객 심리학 기초\n• 초기 관계 형성 기법\n• 열린 질문 기법',
    actionGuidelines: '**방법 A - 경청 중심**: 첫 만남 30분 중 80%는 고객 이야기 듣기\n**방법 B - 공통 관심사**: 보험 외 공통 화제로 유대감 형성\n**방법 C - 3회 원칙**: 최소 3번 만남 후 상품 제안',
    references: [
      { source: '초기 인상 형성 이론', content: '첫 만남에서 형성된 이미지는 이후 관계에 70% 이상 영향을 미친다는 연구 결과', url: 'https://scholar.google.com' },
      { source: '행동경제학 - 손실회피 편향', content: '사람들은 이득보다 손실에 2.5배 더 민감하게 반응 (Kahneman & Tversky, 1979)' }
    ],
    
    // 기존 필드
    aiAnalysis: '고객이 보험에 대한 선입견이나 부정적 경험이 있을 가능성. 직접적인 상품 제안보다는 관계 형성 우선 필요.',
    coachingAdvice: '첫 만남에서는 보험 이야기를 최소화하고, 고객의 현재 상황과 걱정거리를 경청하세요.',
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
    plannerId: 11,
    sessionDate: '2025-02-05T15:20:00',
    context: '고객이 암보험 약관에서 "상피내암"이 일반 암과 다르게 보장된다고 하는데, 어떻게 설명해야 할까요?',
    situationType: '상품설명',
    
    analyzedQuestion: '상피내암과 일반 암의 보장 차이를 고객에게 명확히 설명하는 방법',
    category: '약관조항',
    keyPoints: '• 상피내암의 의학적 정의\n• 약관상 보장 금액 차이\n• 고객이 이해하기 쉬운 설명 방법',
    coachingPoint: '상피내암은 암세포가 상피층에만 국한되어 전이 위험이 낮기 때문에, 약관상 일반 암 진단금의 10-20% 수준으로 보장됩니다.',
    coachingEvidence: '**약관 근거**: 삼성화재 암보험 표준약관 제5조 2항\n"상피내암(Carcinoma in situ)은 기저막을 침범하지 않은 암으로, 일반암 진단금의 20%를 지급한다."\n\n**의료 정보**: 상피내암(KCD-10: D00-D09)은 Stage 0 암으로, 5년 생존율 95% 이상. 일반 침윤암과 달리 전이 가능성이 거의 없음. (대한의학회 가이드라인, 2024)',
    dialogue: '설계사: "고객님, 상피내암이라는 용어 들어보셨어요?"\n고객: "네, 들어는 봤는데 정확히 뭔지 모르겠어요."\n설계사: "상피내암은 암세포가 아직 깊숙이 침투하지 않은 초기 단계예요. 수술로 완치 가능하고 전이 위험도 거의 없죠."\n고객: "그럼 일반 암이랑 똑같이 보장되나요?"\n설계사: "약관상으로는 일반 암 진단금의 20% 수준으로 보장돼요. 치료 비용이 적게 들고 완치율이 높아서 그렇습니다."\n고객: "아, 그래서 보장 금액이 다르군요."\n설계사: "네, 하지만 상피내암도 조기 발견의 중요성을 보여주는 거니까, 정기검진을 꼭 받으시는 게 중요해요."',
    learningNeeds: '• 암보험 약관 조항 숙지\n• 상피내암, 경계성종양 등 특수 암 분류\n• 의학 용어의 쉬운 설명 기법',
    actionGuidelines: '**방법 A - 비유 활용**: "상피내암은 씨앗이 겉에만 붙어있는 상태, 일반 암은 뿌리를 내린 상태"\n**방법 B - 약관 제시**: 해당 조항을 고객과 함께 읽으며 설명\n**방법 C - 사례 공유**: "저희 고객 중 상피내암으로 조기 치료받고 완치하신 분 많아요"',
    references: [
      { source: '삼성화재 암보험 표준약관', content: '제5조 2항 - 상피내암은 일반암 진단금의 20% 지급', url: 'https://www.samsungfire.com' },
      { source: 'KCD-10 질병코드', content: '상피내암 코드: D00-D09, 생존율 95% 이상' }
    ],
    
    aiAnalysis: '약관상 상피내암과 일반암의 보장 차이를 명확히 설명 필요',
    coachingAdvice: '의학적 근거와 약관 조항을 함께 제시하여 설명하세요',
    recommendedApproach: '1. 상피내암 정의 설명\n2. 약관 조항 확인\n3. 보장 금액 차이 이유 설명',
    tacitKnowledgeApplied: '[30년 노하우] 약관 설명 시 전문 용어만 나열하면 고객은 이해하지 못합니다. 비유와 사례를 활용하세요.',
    isShared: true,
    effectivenessRating: 5,
    isValidated: true,
    useForLearning: true,
  },
  {
    id: 3,
    plannerId: 11,
    sessionDate: '2025-03-10T09:15:00',
    context: '고객님이 전립선암(C61) 진단을 받고 불안해하시며, 암 진단금 청구가 가능한지 문의하고 있습니다.',
    situationType: '클레임처리',
    
    analyzedQuestion: '전립선암 진단 고객의 암 진단금 청구 가능 여부 확인 및 안내',
    category: '의료정보',
    keyPoints: '• 전립선암 질병코드 확인 (KCD-10: C61)\n• 암 진단금 청구 가능 여부\n• 고객 불안감 해소 및 신속한 처리',
    coachingPoint: '전립선암(C61)은 악성신생물(암)에 해당하므로 암 진단금 청구가 가능합니다. 고객의 불안을 먼저 공감하고, 보험 보장 내용을 명확히 안내하세요.',
    coachingEvidence: '**질병코드**: KCD-10 C61 - 전립선의 악성신생물 (Malignant neoplasm of prostate)\n\n**약관 근거**: 암보험 표준약관 제5조\n"악성신생물(암)로 진단 확정된 경우 암 진단금을 지급한다. 단, 상피내암, 경계성종양, 전암상태 등은 제외"\n→ 전립선암(C61)은 일반암에 해당하여 100% 보장\n\n**의료 정보**: 전립선암은 남성 암 발생률 4위 (2023년 국가암등록통계), PSA 검사로 조기 발견 가능, 5년 생존율 95%',
    dialogue: '설계사: "고객님, 전립선암 진단 받으셨다니 많이 놀라셨겠어요. 괜찮으세요?"\n고객: "네... 걱정이 많이 되네요. 보험금 받을 수 있을까요?"\n설계사: "네, 물론입니다. 전립선암은 정식 암 진단에 해당해서 가입하신 암 진단금 전액을 받으실 수 있어요."\n고객: "정말요? 다행이네요..."\n설계사: "네, 진단서와 조직검사 결과지만 준비해 주시면 제가 바로 청구 도와드릴게요. 보통 1주일 내로 지급됩니다."\n고객: "고맙습니다. 필요한 서류가 뭐예요?"\n설계사: "1) 진단서, 2) 조직검사 결과지, 3) 신분증 사본 이렇게 세 가지만 있으면 돼요. 제가 방문해서 도와드릴게요."\n고객: "정말 큰 도움이 됩니다. 감사합니다."',
    learningNeeds: '• KCD-10 질병코드 체계\n• 암 진단금 청구 절차 및 필요 서류\n• 고객 심리 안정 화법',
    actionGuidelines: '**방법 A - 즉시 안심**: "보장 가능합니다" 먼저 명확히 전달\n**방법 B - 구체적 안내**: 필요 서류와 청구 절차 단계별 설명\n**방법 C - 신속 처리**: 방문 약속 잡고 직접 도움 제공',
    references: [
      { source: 'KCD-10 질병분류', content: 'C61 - 전립선의 악성신생물, 일반암에 해당', url: 'https://www.kcd.go.kr' },
      { source: '국가암등록통계 2023', content: '전립선암 남성 발생률 4위, 5년 생존율 95%', url: 'https://www.cancer.go.kr' },
      { source: '암보험 표준약관', content: '제5조 - 악성신생물 진단 시 암 진단금 지급' }
    ],
    
    aiAnalysis: '전립선암 진단 고객의 불안을 해소하고 암 진단금 청구를 신속히 처리 필요',
    coachingAdvice: '질병코드와 약관을 근거로 보장 가능 여부를 명확히 전달하고, 필요 서류를 안내하세요',
    recommendedApproach: '1. 고객 공감 및 안심\n2. 보장 내용 확인\n3. 청구 절차 안내',
    tacitKnowledgeApplied: '[30년 노하우] 암 진단 고객은 경제적 불안보다 심리적 불안이 더 큽니다. 먼저 보장 가능하다는 확신을 주고, 절차는 천천히 설명하세요.',
    isShared: true,
    effectivenessRating: 5,
    isValidated: true,
    useForLearning: true,
  },
  {
    id: 4,
    plannerId: 11,
    sessionDate: '2025-03-25T14:30:00',
    context: '50대 고객이 "나이가 많아서 보험 가입이 어렵지 않냐"고 물어보는데, 어떻게 답변해야 할까요?',
    situationType: '상품설명',
    
    analyzedQuestion: '50대 고객의 나이에 따른 보험 가입 가능성 및 유리한 상품 안내',
    category: '세일즈프로세스',
    keyPoints: '• 50대도 가입 가능한 보험 상품 존재\n• 연령대별 보험의 필요성\n• 보험료와 보장의 균형',
    coachingPoint: '50대는 오히려 보험이 가장 필요한 시기입니다. 건강이 악화되기 전에 가입하는 것이 유리하며, 연령별 맞춤 상품이 존재합니다.',
    coachingEvidence: '**통계 자료**: 생명보험협회 2024년 통계\n- 50대 보험 가입률: 72.3%\n- 50대 평균 보험료: 월 35만원\n- 질병 발생률: 50대 이후 급증 (40대 대비 2.8배)\n\n**상품 정보**: 50세 이상 전용 실버보험, 간편심사 보험 등 다양한 옵션 존재',
    dialogue: '고객: "제 나이가 벌써 55인데, 이제 보험 가입하기엔 늦지 않았나요?"\n설계사: "아니요, 전혀 늦지 않으셨어요. 오히려 지금이 중요한 시기예요."\n고객: "그래요? 보험료가 너무 비싸지 않을까요?"\n설계사: "나이가 드시면 보험료는 조금 올라가지만, 50대 전용 상품들도 있어요. 더 중요한 건, 건강할 때 가입하셔야 나중에 보장받을 수 있다는 거죠."\n고객: "그것도 그렇네요... 어떤 보험이 좋을까요?"\n설계사: "먼저 고객님 건강 상태를 확인하고, 필요하신 보장을 맞춤으로 설계해 드릴게요. 암보험, 실손보험, 간병보험 중에서 우선순위를 정해보시죠."\n고객: "좋아요, 상담 받아볼게요."',
    learningNeeds: '• 연령별 보험 상품 종류\n• 50대 이상 맞춤 보험 설계\n• 통계 자료 활용한 설득 기법',
    actionGuidelines: '**방법 A - 긍정 프레이밍**: "늦지 않았다" 강조\n**방법 B - 통계 제시**: 동년배 가입률과 필요성 데이터 활용\n**방법 C - 맞춤 제안**: 연령별 최적 상품 제시',
    references: [
      { source: '생명보험협회 통계 2024', content: '50대 보험 가입률 72.3%, 평균 보험료 월 35만원' },
      { source: '질병 발생 통계', content: '50대 질병 발생률 40대 대비 2.8배 증가' }
    ],
    
    aiAnalysis: '50대 고객의 나이에 대한 우려를 해소하고 맞춤 상품 제안 필요',
    coachingAdvice: '통계 자료를 활용하여 50대 보험 가입의 필요성을 설명하세요',
    recommendedApproach: '1. 긍정 메시지 전달\n2. 통계 제시\n3. 맞춤 상품 제안',
    tacitKnowledgeApplied: '[30년 노하우] 나이 많은 고객은 "늦었다"는 생각에 스스로 포기합니다. 오히려 "지금이 적기"라는 확신을 주세요.',
    isShared: true,
    effectivenessRating: 4,
    isValidated: true,
    useForLearning: true,
  },
  
  // 박민지 설계사 (plannerId: 12)
  {
    id: 5,
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
    category: '세일즈프로세스',
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
    category: '세일즈프로세스',
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
  },
  {
    id: 3,
    title: '암보험 약관 핵심 정리',
    category: '약관조항',
    content: `## 암보험 약관 핵심 정리

### 암의 분류
1. **일반암 (악성신생물)**: 진단금 100% 지급
   - KCD-10: C00-C97 (단, 아래 제외)
2. **상피내암**: 진단금 20% 지급
   - KCD-10: D00-D09
   - 암세포가 상피층에만 국한, 전이 위험 낮음
3. **경계성종양**: 진단금 10-20% 지급
   - KCD-10: D37-D48
4. **기타피부암**: 진단금 10-20% 지급
   - KCD-10: C44

### 표준약관 제5조 (암 진단금)
"피보험자가 보험기간 중 암(악성신생물)으로 진단 확정된 경우 암 진단금을 지급한다.
단, 상피내암, 경계성종양, 기타피부암, 전암상태 등은 별도 지급률 적용"

### 30년 노하우
- 약관 설명 시 전문 용어만 나열하지 말고, 비유를 활용하세요
- "상피내암은 씨앗이 겉에만 붙어있는 상태, 일반 암은 뿌리를 내린 상태"
- 고객이 이해했는지 확인하는 질문을 던지세요`,
    priority: true,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 1
  },
  {
    id: 4,
    title: '주요 질병 코드 (KCD-10) 정리',
    category: '의료정보',
    content: `## 주요 질병 코드 (KCD-10) 정리

### 암 (악성신생물) - C00~C97
- **C61**: 전립선의 악성신생물 (전립선암)
- **C50**: 유방의 악성신생물 (유방암)
- **C34**: 기관지 및 폐의 악성신생물 (폐암)
- **C16**: 위의 악성신생물 (위암)
- **C18**: 결장의 악성신생물 (대장암)
- **C22**: 간 및 간내 담관의 악성신생물 (간암)

### 상피내암 - D00~D09
- **D05**: 유방의 상피내암
- **D06**: 자궁경부의 상피내암

### 뇌혈관질환 - I60~I69
- **I63**: 뇌경색증 (뇌졸중)
- **I61**: 뇌내출혈

### 심장질환 - I20~I25
- **I21**: 급성 심근경색증
- **I25**: 만성 허혈성 심장질환

### 30년 노하우
- 질병코드는 청구 시 필수이므로, 주요 코드는 암기하세요
- 진단서에 정확한 코드가 없으면 청구가 지연될 수 있습니다
- 고객에게는 "암 진단코드"라는 표현보다 "정식 진단명"이라는 표현을 사용하세요`,
    priority: true,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 1
  }
]
