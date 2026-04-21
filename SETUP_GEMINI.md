# 🚀 Gemini API 설정 가이드 (bogamsim@gmail.com)

## 📋 빠른 설정 (5분 완료)

### **Step 1: Gemini API 키 발급**

#### **방법 1: Google AI Studio (권장)**

1. **URL 접속**: https://aistudio.google.com/apikey

2. **로그인**: `bogamsim@gmail.com`

3. **"Create API Key" 클릭**

4. **프로젝트 선택**:
   - 기존 프로젝트 선택
   - 또는 "Create API key in new project" 클릭

5. **API 키 복사** (AIza로 시작하는 긴 문자열)

#### **방법 2: Google Cloud Console**

1. **URL 접속**: https://console.cloud.google.com/apis/credentials

2. **프로젝트 선택** (또는 새 프로젝트 생성)

3. **"CREATE CREDENTIALS" → "API key"**

4. **API 키 복사**

5. **"Generative Language API" 활성화**:
   - https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com

---

### **Step 2: 환경 변수 설정**

#### **발급받은 API 키를 아래에 입력하세요:**

```bash
# 터미널에서 실행 (API 키를 발급받은 후)
cat > /home/user/webapp/.dev.vars << 'EOF'
GEMINI_API_KEY=여기에-발급받은-API-키-붙여넣기
GENSPARK_TOKEN=76ikrNLufxO1nWFA7NWzNggaMKfvP573
OPENAI_API_KEY=sk-or-v1-15a...abf
OPENAI_BASE_URL=https://openrouter.ai/api/v1
EOF
```

**예시**:
```bash
cat > /home/user/webapp/.dev.vars << 'EOF'
GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz
GENSPARK_TOKEN=76ikrNLufxO1nWFA7NWzNggaMKfvP573
OPENAI_API_KEY=sk-or-v1-15a...abf
OPENAI_BASE_URL=https://openrouter.ai/api/v1
EOF
```

---

### **Step 3: 테스트**

```bash
# 1. 빌드
cd /home/user/webapp
npm run build

# 2. 서버 재시작
pm2 restart webapp

# 3. 테스트 (새 코칭 요청)
curl -X POST http://localhost:3000/api/coaching-sessions \
  -H "Content-Type: application/json" \
  -d '{
    "plannerId": 11,
    "context": "Pluvicto 치료가 항암약물치료인지 방사선치료인지 궁금합니다",
    "situationType": "상품설명"
  }'
```

**기대 결과**: Gemini 수준의 상세한 답변 (KCD-10 코드, 약관 조항, 의료 정보 포함)

---

### **Step 4: 프로덕션 배포 (Cloudflare Pages)**

```bash
# 1. Cloudflare에 Gemini API 키 등록
npx wrangler pages secret put GEMINI_API_KEY --project-name webapp

# 입력 프롬프트에 발급받은 API 키 붙여넣기

# 2. 배포
npm run deploy:prod
```

---

## 🔍 문제 해결

### **문제 1: API 키가 작동하지 않음**

**증상**: `GEMINI_API_KEY가 설정되지 않았습니다.` 오류

**해결**:
```bash
# 1. .dev.vars 파일 확인
cat /home/user/webapp/.dev.vars

# 2. API 키가 제대로 들어갔는지 확인
# GEMINI_API_KEY=AIza... 형태여야 함

# 3. 서버 재시작
cd /home/user/webapp
pm2 restart webapp
```

---

### **문제 2: Generative Language API 비활성화**

**증상**: `API generativelanguage.googleapis.com is not enabled` 오류

**해결**:
1. https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com 접속
2. "ENABLE" 버튼 클릭
3. 1-2분 대기 후 다시 시도

---

### **문제 3: 할당량 초과**

**증상**: `Quota exceeded` 오류

**해결**:
1. Google Cloud Console → "APIs & Services" → "Quotas"
2. Gemini API 할당량 확인
3. 무료 티어: 60 requests/minute
4. 필요 시 유료 플랜으로 업그레이드

---

## 📊 Gemini vs 기존 답변 비교

### **기존 답변 (OpenRouter GPT-4)**
```
Pluvicto 치료법은 방사선 치료로 분류됩니다. 
생명보험사 A의 약관을 확인하세요.
```

### **Gemini 답변**
```
1. 왜 [항암약물치료]인가? [항암 방사선치료]인가?

방사성리간드치료(RLT)는 암세포를 찾아가는 '리간드'와 
방사성 물질을 결합한 치료입니다.

**KCD-10 기준**: C61 - 전립선의 악성신생물
**치료 분류**: 건강보험심사평가원 기준 '항암 방사선 치료'
**약관 근거**: 삼성화재 실손의료비보험 표준약관 제5조 2항

Pluvicto는 Lu-177 PSMA-617이라는 방사성 동위원소를 
사용하므로 **[항암 방사선 치료] 담보**에서 보장됩니다.

2. 고객 설명 화법:

설계사: "고객님, Pluvicto 치료 받으신다니 걱정 많으셨겠어요..."
고객: "네... 비용이 많이 들까봐 걱정입니다..."
설계사: "안심하세요. 고객님 보험에서 항암 방사선 치료로 
        분류되어 보장받으실 수 있습니다..."
...
```

**차이점**:
- ✅ KCD-10 코드 명시
- ✅ 건강보험심사평가원 기준 인용
- ✅ 약관 조항 (제X조 X항)
- ✅ 6-8번 대화 시나리오
- ✅ 심리학 기반 공감

---

## 🎯 다음 단계

1. ✅ Gemini API 키 발급 완료
2. ✅ `.dev.vars` 설정 완료
3. ⏳ **디렉터 피드백 UI 추가** (다음 작업)
4. ⏳ **재학습 시스템 통합** (자동화)

---

**문의**: 문제가 발생하면 `pm2 logs webapp --nostream` 명령어로 로그를 확인하세요!
