const apiKey = 'AIzaSyCsLcOnSVnCQsk0KSxFuAbz2qCsL9p5tXw'

async function test() {
  console.log('🔍 새 API 키 테스트...\n')
  
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Say OK' }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 100 }
      })
    })
    
    console.log('HTTP Status:', res.status)
    
    if (res.ok) {
      const data = await res.json()
      console.log('✅ 성공!', data.candidates[0].content.parts[0].text)
    } else {
      const err = await res.text()
      console.log('❌ 에러:', err.substring(0, 200))
    }
  } catch (e) {
    console.error('오류:', e.message)
  }
}

test()
