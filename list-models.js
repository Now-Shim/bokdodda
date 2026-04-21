// Gemini 사용 가능한 모델 목록 확인
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = 'AIzaSyBMeex7vjL6SgfPw_-dUXmmZGbtmgdgA4I'

async function listModels() {
  console.log('🔍 Gemini 모델 목록 조회...\n')
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const models = await genAI.listModels()
    
    console.log('✅ 사용 가능한 모델 목록:\n')
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`)
      console.log(`   - Display: ${model.displayName}`)
      console.log(`   - Methods: ${model.supportedGenerationMethods.join(', ')}`)
      console.log('')
    })
    
    console.log('\n💡 권장 모델:')
    const recommended = models.filter(m => 
      m.name.includes('flash') || m.name.includes('pro')
    )
    recommended.forEach(m => {
      console.log(`- ${m.name} (${m.displayName})`)
    })
    
  } catch (error) {
    console.error('❌ 오류:', error.message)
  }
}

listModels()
