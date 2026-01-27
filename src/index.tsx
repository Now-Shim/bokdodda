import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// API route - get proposal data
app.get('/api/proposal', (c) => {
  return c.json({
    title: 'AI 기반 보험 영업 교육/훈련 플랫폼 구축 제안',
    subtitle: '젠스파크 협력 제안서',
    organization: '메가(가칭)공대 미래경영 교육센터',
    proposer: '최호석 교육센터장',
    email: 'bchdd@hotmail.net',
    phone: '010-4652-8936',
    proposalDate: '2025년 1월',
    startDate: '2026년 상반기',
    sections: [
      {
        id: 1,
        title: '프로젝트 배경 및 목적',
        content: {
          vision: '30년간의 부채 관리 경험과 AI 기술을 기반으로 보험 교육/훈련 플랫폼을 구축하여 새로운 방향을 개척하고자 합니다.',
          currentLimitations: [
            '일반적인 AI는 정상 데이터 기반의 기술적이나, 운영의 역량의 이해력이 적습니다.',
            '고객 심리, 영업 구조, 상황 대응 등 단순히 모델 제공이 된다면 별도의 학습 노력이 있어야 합니다.',
            '본질적인 \'실무\'와 \'교육 공식 분석\'과 \'아는 것\'의 차이'
          ],
          goal: 'AI의 지식 + 30년 현장 정험의 지혜 = 실전 공학 플랫폼',
          features: [
            '상황별 상담 시뮬레이션 프로그램 만들기',
            '상담과 거래의 상호작용 아동으로 맞춤 개입 이어가기',
            '실무경험을 선행하는 예측된 시스템'
          ]
        }
      }
    ]
  })
})

// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI 기반 보험 영업 교육/훈련 플랫폼 구축 제안</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            body {
                font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            .gradient-bg {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .card {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            }
            .table-header {
                background-color: #4a5568;
                color: white;
            }
            .table-row:nth-child(even) {
                background-color: #f7fafc;
            }
            .highlight-box {
                background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
                border-left: 4px solid #10b981;
            }
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .fade-in-up {
                animation: fadeInUp 0.6s ease-out;
            }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <div class="gradient-bg text-white py-16 fade-in-up">
            <div class="max-w-6xl mx-auto px-6">
                <h1 class="text-4xl md:text-5xl font-bold mb-4 text-center">
                    <i class="fas fa-brain mr-3"></i>
                    AI 기반 보험 영업 교육/훈련 플랫폼 구축 제안
                </h1>
                <p class="text-xl text-center opacity-90">젠스파크 협력 제안서</p>
            </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-6xl mx-auto px-6 py-12">
            
            <!-- Proposal Information Card -->
            <div class="bg-white rounded-lg shadow-lg p-8 mb-12 card fade-in-up">
                <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <i class="fas fa-info-circle text-blue-600 mr-3"></i>
                    제안 기관
                </h2>
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse">
                        <tbody>
                            <tr class="table-row border-b">
                                <td class="table-header py-3 px-4 font-semibold w-1/4">제안 기관</td>
                                <td class="py-3 px-4">메가(가칭)공대 미래경영 교육센터</td>
                            </tr>
                            <tr class="table-row border-b">
                                <td class="table-header py-3 px-4 font-semibold">제안자</td>
                                <td class="py-3 px-4">최호석 교육센터장</td>
                            </tr>
                            <tr class="table-row border-b">
                                <td class="table-header py-3 px-4 font-semibold">이메일</td>
                                <td class="py-3 px-4">
                                    <a href="mailto:bchdd@hotmail.net" class="text-blue-600 hover:underline">
                                        <i class="fas fa-envelope mr-2"></i>bchdd@hotmail.net
                                    </a>
                                </td>
                            </tr>
                            <tr class="table-row border-b">
                                <td class="table-header py-3 px-4 font-semibold">전화</td>
                                <td class="py-3 px-4">
                                    <a href="tel:010-4652-8936" class="text-blue-600 hover:underline">
                                        <i class="fas fa-phone mr-2"></i>010-4652-8936
                                    </a>
                                </td>
                            </tr>
                            <tr class="table-row border-b">
                                <td class="table-header py-3 px-4 font-semibold">제안일</td>
                                <td class="py-3 px-4">2025년 1월</td>
                            </tr>
                            <tr class="table-row">
                                <td class="table-header py-3 px-4 font-semibold">희망 시작일</td>
                                <td class="py-3 px-4">2026년 상반기</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Section 1: Project Background -->
            <div class="bg-white rounded-lg shadow-lg p-8 mb-8 card fade-in-up">
                <h2 class="text-3xl font-bold text-blue-700 mb-6 border-b-4 border-blue-600 pb-3">
                    1. 프로젝트 배경 및 목적
                </h2>
                
                <!-- Core Vision -->
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-eye text-purple-600 mr-3"></i>
                        핵심 비전
                    </h3>
                    <p class="text-lg text-gray-700 leading-relaxed bg-blue-50 p-6 rounded-lg">
                        30년간의 부채 관리 경험과 <span class="font-bold text-blue-700">AI 기술</span>을 기반으로 
                        보험 교육/훈련 플랫폼을 구축하여, 단순 전환 플랫폼을 넘어서는 
                        <span class="font-bold text-purple-700">실전 중심의</span> 새로운 교육 방향을 개척하고자 합니다.
                    </p>
                </div>

                <!-- Current Limitations -->
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-exclamation-triangle text-orange-600 mr-3"></i>
                        현재 AI의 한계
                    </h3>
                    <ul class="space-y-3">
                        <li class="flex items-start text-gray-700">
                            <i class="fas fa-times-circle text-red-500 mr-3 mt-1"></i>
                            <span><strong>일반적인 AI는</strong> 정상 데이터 기반의 기술적이나, 운영의 역량의 이해력이 적습니다.</span>
                        </li>
                        <li class="flex items-start text-gray-700">
                            <i class="fas fa-times-circle text-red-500 mr-3 mt-1"></i>
                            <span><strong>고객 심리, 영업 구조, 상황 대응</strong> 등 단순히 모델 제공이 된다면 별도의 학습 노력이 있어야 합니다.</span>
                        </li>
                        <li class="flex items-start text-gray-700">
                            <i class="fas fa-times-circle text-red-500 mr-3 mt-1"></i>
                            <span>본질적인 <strong>'실무'와 '교육 공식 분석'과 '아는 것'의 차이</strong></span>
                        </li>
                    </ul>
                </div>

                <!-- What We Want to Build -->
                <div class="mb-8">
                    <h3 class="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-lightbulb text-yellow-500 mr-3"></i>
                        우리가 만들고자 하는 것
                    </h3>
                    
                    <div class="highlight-box p-6 rounded-lg mb-6">
                        <p class="text-2xl font-bold text-center text-gray-800">
                            "AI의 지식 + 30년 현장 정험의 지혜 = 실전 공학 플랫폼"
                        </p>
                    </div>

                    <ul class="space-y-3">
                        <li class="flex items-start text-gray-700">
                            <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                            <span><strong>상황별 상담 시뮬레이션</strong> 프로그램 만들기 엑셀</span>
                        </li>
                        <li class="flex items-start text-gray-700">
                            <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                            <span><strong>상담과 거래의 상호작용 아동</strong>으로 맞춤 개입 이어가기</span>
                        </li>
                        <li class="flex items-start text-gray-700">
                            <i class="fas fa-check-circle text-green-500 mr-3 mt-1"></i>
                            <span><strong>실무경험을 선행하는 예측된 시스템</strong></span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Footer -->
            <div class="text-center text-gray-600 mt-12 pb-8">
                <p class="flex items-center justify-center">
                    <i class="fas fa-copyright mr-2"></i>
                    2025 메가(가칭)공대 미래경영 교육센터. All rights reserved.
                </p>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // Fade in animations on scroll
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in-up');
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.card').forEach(card => {
                observer.observe(card);
            });

            // Log page load
            console.log('AI 기반 보험 영업 교육/훈련 플랫폼 제안서 페이지 로드됨');
        </script>
    </body>
    </html>
  `)
})

export default app
