# Gemini AI + 디렉터 피드백 재학습 시스템

## 📋 개요

북돋다 플랫폼의 AI 코칭 품질을 **Gemini 수준**으로 높이고, **디렉터 피드백을 통한 지속적 개선** 시스템을 구축했습니다.

---

## 🎯 1단계: Gemini API 통합

### **왜 Gemini인가?**

| 기능 | GPT-4 | Gemini 2.0 Flash |
|------|-------|------------------|
| 한국어 품질 | 우수 | **매우 우수** |
| 의료/법률 정확도 | 우수 | **매우 우수** |
| 긴 컨텍스트 | 128K | **128K** |
| JSON 출력 | 가능 | **Native 지원** |
| 비용 | $$ | **$ (저렴)** |

### **구현 완료**

- ✅ `ai-helper-gemini.ts` 생성
- ✅ Google Generative AI SDK 사용
- ✅ `gemini-2.0-flash-exp` 모델 사용
- ✅ JSON 스키마 기반 응답 생성
- ✅ 기존 프롬프트 100% 재사용

---

## 🔄 2단계: 디렉터 피드백 재학습 시스템

### **작동 원리**

```
1. 설계사 코칭 요청
   ↓
2. AI 답변 생성 (Gemini)
   ↓
3. 디렉터 검토 & 평가
   ├─ 평점: 1-5
   ├─ 피드백: 텍스트
   ├─ 개선 영역: 배열
   └─ 잘한 점: 배열
   ↓
4. 학습 패턴 추출
   ├─ 평점 4-5: "좋은 예시"로 저장
   ├─ 평점 1-2: "개선 필요"로 저장
   └─ 피드백 텍스트: "디렉터 지침"으로 저장
   ↓
5. 다음 답변 생성 시 자동 반영
   ├─ 같은 카테고리의 학습 패턴 로드
   ├─ 프롬프트에 통합
   └─ 품질 향상된 답변 생성
```

### **구현 완료**

- ✅ `feedback-learning.ts` 생성
- ✅ `feedback_learning` 테이블 (D1 마이그레이션)
- ✅ 학습 패턴 추출 함수
- ✅ 프롬프트 자동 개선 함수
- ✅ 카테고리별 학습 패턴 로드

---

## 🚀 3단계: 통합 및 사용법

### **환경 변수 설정 (.dev.vars)**

```bash
# Gemini API 키 추가
GEMINI_API_KEY=your-gemini-api-key-here

# 기존 OpenRouter 키 (폴백용)
OPENAI_API_KEY=sk-or-v1-...
OPENAI_BASE_URL=https://openrouter.ai/api/v1
```

### **Gemini API 키 발급 방법**

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. "Get API Key" 클릭
3. 새 프로젝트 생성 또는 기존 프로젝트 선택
4. API 키 복사
5. `.dev.vars` 파일에 추가

### **데이터베이스 마이그레이션 실행**

```bash
# 로컬 D1 데이터베이스에 마이그레이션 적용
cd /home/user/webapp
npx wrangler d1 migrations apply webapp-production --local

# 프로덕션에도 적용 (배포 전)
npx wrangler d1 migrations apply webapp-production
```

---

## 📊 사용 예시

### **1. Gemini로 코칭 생성**

```typescript
import { generateAICoachingWithGemini } from './ai-helper-gemini'

const response = await generateAICoachingWithGemini({
  context: "고객이 Pluvicto 치료가 항암약물치료인지 방사선치료인지 궁금해합니다",
  situationType: "상품설명",
  plannerProfile: { ... },
  directorKnowledge: "...",
  env: c.env
})
```

### **2. 디렉터 피드백 저장**

```typescript
import { extractLearningPattern, saveFeedbackLearning } from './feedback-learning'

const feedback = {
  sessionId: 123,
  rating: 5,
  feedbackText: "의료정보와 약관 연계가 매우 명확했습니다.",
  improvementAreas: [],
  strengths: ["KCD-10 코드 명시", "건강보험심사평가원 기준 인용"],
  category: "의료정보"
}

const pattern = extractLearningPattern(feedback, originalCoaching)
await saveFeedbackLearning(c.env.DB, 123, feedback, pattern)
```

### **3. 학습 패턴 반영**

```typescript
import { loadLearningPatterns, buildImprovedPrompt } from './feedback-learning'

// 카테고리별 학습 패턴 로드
const patterns = await loadLearningPatterns(c.env.DB, "의료정보", 10)

// 프롬프트에 학습 패턴 통합
const improvedPrompt = buildImprovedPrompt(basePrompt, patterns, "의료정보")

// Gemini에 전달하여 개선된 답변 생성
const response = await model.generateContent(improvedPrompt)
```

---

## 📈 기대 효과

### **즉시 효과**
- ✅ Gemini 수준의 고품질 답변
- ✅ 의료/법률 정보 정확도 향상
- ✅ 한국어 자연스러움 개선
- ✅ 구조화된 JSON 응답

### **장기 효과 (재학습 시스템)**
- 📊 디렉터 피드백 축적 (누적 데이터)
- 🎓 카테고리별 전문성 강화
- 🔄 자동 품질 개선 (피드백 → 학습 → 개선)
- 📈 답변 일관성 향상

---

## 🔧 다음 단계

1. **Gemini API 키 발급 및 설정**
2. **D1 마이그레이션 실행**
3. **index.tsx에 Gemini 통합**
4. **디렉터 페이지에 피드백 UI 추가**
5. **학습 패턴 자동 반영 구현**

---

## 📝 주요 파일

| 파일 | 역할 |
|------|------|
| `ai-helper-gemini.ts` | Gemini API 통합 |
| `feedback-learning.ts` | 재학습 시스템 |
| `migrations/0002_feedback_learning.sql` | D1 마이그레이션 |
| `.dev.vars` | 환경 변수 (GEMINI_API_KEY) |

---

**변방의 장수 30년 노하우 + Gemini AI + 디렉터 피드백 = 최고의 AI 코칭 플랫폼** 🚀
