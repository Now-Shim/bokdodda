// Gemini API 테스트 스크립트
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = 'AIzaSyBMeex7vjL6SgfPw_-dUXmmZGbtmgdgA4I'

async function testGemini() {
  console.log('🔍 Gemini API 테스트 시작...')
  console.log('API 키:', apiKey.substring(0, 10) + '...')
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        responseMimeType: 'application/json',
      }
    })
    
    const prompt = `다음 질문에 JSON 형식으로 답변하세요:
    
질문: "Pluvicto 치료가 항암약물치료인지 항암방사선치료인지 알려주세요."

JSON 형식:
{
  "analyzedQuestion": "질문 요약",
  "category": "의료정보",
  "answer": "답변 내용 (200자 이내)"
}`
    
    console.log('📤 요청 전송 중...')
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    
    console.log('\n✅ 응답 성공!')
    console.log('📥 응답 내용:')
    console.log(text)
    
    const parsed = JSON.parse(text)
    console.log('\n📊 파싱 결과:')
    console.log(JSON.stringify(parsed, null, 2))
    
  } catch (error) {
    console.error('\n❌ 오류 발생:')
    console.error('오류 메시지:', error.message)
    console.error('오류 세부:', error)
  }
}

testGemini()
