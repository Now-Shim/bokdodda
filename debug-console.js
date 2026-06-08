// 브라우저 콘솔에 붙여넣기용 디버깅 코드

console.log('=== 프로필 디버깅 시작 ===')

// 1. 현재 로그인한 사용자 확인
const user = JSON.parse(localStorage.getItem('user') || '{}')
console.log('1. User ID:', user.id)
console.log('   User Name:', user.name)
console.log('   User Email:', user.email)

// 2. DOM 요소 확인
console.log('2. DOM Elements:')
console.log('   careerStartYear:', document.getElementById('careerStartYear'))
console.log('   firstOrganization:', document.getElementById('firstOrganization'))
console.log('   birthYear:', document.getElementById('birthYear'))
console.log('   gender:', document.getElementById('gender'))

// 3. 현재 표시된 값 확인
console.log('3. Current Values:')
console.log('   careerStartYear text:', document.getElementById('careerStartYear')?.textContent)
console.log('   firstOrganization text:', document.getElementById('firstOrganization')?.textContent)
console.log('   birthYear text:', document.getElementById('birthYear')?.textContent)
console.log('   gender text:', document.getElementById('gender')?.textContent)

// 4. API 직접 호출
console.log('4. API 호출 중...')
axios.get('/api/planner/' + user.id).then(res => {
    console.log('   API Response:', res.data)
    console.log('   Profile Data:', res.data.profile)
    console.log('   careerStartYear:', res.data.profile.careerStartYear)
    console.log('   firstOrganization:', res.data.profile.firstOrganization)
    console.log('   birthYear:', res.data.profile.birthYear)
    console.log('   gender:', res.data.profile.gender)
}).catch(err => {
    console.error('   API Error:', err)
})

console.log('=== 디버깅 완료 ===')
