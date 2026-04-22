// 간단한 Gemini API 테스트 (플랫폼과 동일한 방식)
const apiKey = 'AIzaSyBMeex7vjL6SgfPw_-dUXmmZGbtmgdgA4I'

async function testGemini() {
  console.log('🔍 Gemini API 할당량 테스트...\n')
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`
  
  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: '간단한 테스트입니다. "OK"라고만 답변해주세요.' }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 100,
    }
  }
  
  try {
    console.log('📤 요청 전송 중...')
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })
    
    console.log('HTTP Status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 에러:', errorText.substring(0, 500))
      
      // 할당량 정보 추출
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.error?.code === 429) {
          console.log('\n⚠️ 할당량 초과!')
          console.log('메시지:', errorJson.error.message.substring(0, 200))
        }
      } catch {}
      return
    }
    
    const result = await response.json()
    console.log('\n✅ 성공!')
    console.log('응답:', JSON.stringify(result, null, 2).substring(0, 300))
    
  } catch (error) {
    console.error('❌ 오류:', error.message)
  }
}

testGemini()
