// 설계사 페이지 HTML
export const plannerPageHTML = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>설계사 대시보드 - 북돋다</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .loading { display: inline-block; width: 20px; height: 20px; border: 3px solid #f3f3f3; border-top: 3px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body class="bg-gray-50">
    <nav class="gradient-bg text-white p-4 shadow-lg">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <div class="flex items-center space-x-4">
                <i class="fas fa-book-open text-2xl"></i>
                <div>
                    <h1 class="text-xl font-bold">북돋다</h1>
                    <p class="text-xs opacity-90">Book | Jar | All</p>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <span id="userName" class="font-semibold"></span>
                <button id="logoutBtn" class="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-gray-100">
                    <i class="fas fa-sign-out-alt mr-2"></i>로그아웃
                </button>
            </div>
        </div>
    </nav>
    
    <div class="max-w-7xl mx-auto p-6">
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-user-circle mr-2 text-purple-600"></i>내 프로필
            </h2>
            <div id="profileInfo" class="cursor-pointer hover:shadow-md transition-all" onclick="openPersonalityTest()">
                <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200 hover:border-purple-400">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600 mb-2">성향 분석</p>
                            <p id="personalityStatus" class="font-bold text-purple-700 text-lg">성향 분석 시작하기</p>
                        </div>
                        <div class="text-4xl text-purple-600">
                            <i class="fas fa-brain"></i>
                        </div>
                    </div>
                    <div id="personalityReport" class="hidden mt-4">
                        <button onclick="event.stopPropagation(); viewPersonalityReport()" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                            <i class="fas fa-file-alt mr-2"></i>성향 Report 보기
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 경력 정보 & 개인정보 섹션 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- 경력 정보 -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-briefcase mr-2 text-blue-600"></i>경력 정보
                    </h2>
                    <button onclick="openCareerModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <i class="fas fa-edit mr-2"></i>수정
                    </button>
                </div>
                <div id="careerInfo" class="space-y-3">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">보험 업무 시작 년도</p>
                        <p id="careerStartYear" class="font-bold text-gray-800 text-lg">-</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">최초 시작 조직</p>
                        <p id="firstOrganization" class="font-bold text-gray-800 text-lg">-</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">회사 이직 경로</p>
                        <p id="careerPath" class="font-bold text-gray-800">-</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">판매 상품 비중 (생보 vs 손보)</p>
                        <div id="productRatio" class="mt-2">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-semibold">생보</span>
                                <span id="productRatioLife" class="text-lg font-bold text-blue-600">-</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-semibold">손보</span>
                                <span id="productRatioNonLife" class="text-lg font-bold text-green-600">-</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 개인정보 -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-id-card mr-2 text-green-600"></i>개인정보
                    </h2>
                    <button onclick="openPersonalInfoModal()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        <i class="fas fa-edit mr-2"></i>수정
                    </button>
                </div>
                <div id="personalInfo" class="space-y-3">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">나이 (출생년도)</p>
                        <p id="birthYear" class="font-bold text-gray-800 text-lg">-</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">성별</p>
                        <p id="gender" class="font-bold text-gray-800 text-lg">-</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-600 mb-1">결혼 여부</p>
                        <p id="maritalStatus" class="font-bold text-gray-800 text-lg">-</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-robot mr-2 text-purple-600"></i>AI 코칭 요청
            </h2>
            <p class="text-sm text-gray-600 mb-4">현장에서 겪고 있는 상황을 입력하면, AI가 즉시 맞춤형 코칭을 제공합니다.</p>
            <form id="coachingForm" class="space-y-4">
                <div>
                    <label class="block text-gray-700 font-semibold mb-2">상황 유형</label>
                    <select id="situationType" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                        <option value="신규고객">신규 고객</option>
                        <option value="기존고객">기존 고객</option>
                        <option value="대형계약">대형 계약</option>
                        <option value="클레임처리">클레임 처리</option>
                        <option value="거절대응">거절 대응</option>
                        <option value="기타">기타</option>
                    </select>
                </div>
                <div>
                    <label class="block text-gray-700 font-semibold mb-2">현장 상황 설명</label>
                    <textarea id="context" rows="4" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="예: 신규 고객과 첫 만남에서 보험 이야기를 꺼내자마자 거부감을 보였습니다..."></textarea>
                </div>
                <button type="submit" id="submitBtn"
                    class="gradient-bg text-white font-bold px-6 py-3 rounded-lg hover:opacity-90">
                    <i class="fas fa-paper-plane mr-2"></i>AI 코칭 받기
                </button>
                <span id="loading" class="ml-4 hidden">
                    <div class="loading"></div> 
                    <span id="loading-text">AI가 분석 중입니다... (약 30초 소요)</span>
                </span>
            </form>
        </div>
        
        <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
                <i class="fas fa-history mr-2 text-green-600"></i>코칭 히스토리
            </h2>
            <div id="sessionsList" class="space-y-4"></div>
        </div>
    </div>
    
    <!-- 성향 테스트 모달 -->
    <div id="personalityTestModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-brain mr-2 text-purple-600"></i>성향 파악 테스트
                    </h3>
                    <button onclick="closePersonalityTest()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <p class="text-sm text-gray-600 mb-6">각 질문에 대해 1~5점으로 평가해주세요. (1점: 왼쪽 선택지에 가까움 / 5점: 오른쪽 선택지에 가까움)</p>
                
                <form id="personalityTestForm" class="space-y-6">
                    <!-- Q1 -->
                    <div class="border-l-4 border-purple-500 pl-4">
                        <h4 class="font-bold text-gray-800 mb-2">Q1. [에너지 방향] 모처럼 만난 잠재 고객이 "보험의 '보'자도 꺼내지 마라"며 5분 만에 대화를 끝냈습니다. 사무실로 돌아오는 길에 당신은?</h4>
                        <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div class="bg-blue-50 p-3 rounded">(E) 동료에게 전화해 방금 겪은 황당한 일을 수다 떨며 털어버리고, 바로 다음 고객을 방문할 계획을 세운다.</div>
                            <div class="bg-green-50 p-3 rounded">(I) 조용한 곳에서 혼자 마음을 추스르며, 왜 거절당했는지 대화 내용을 복기하고 다시 나갈 에너지를 모은다.</div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">E (외향)</span>
                            <div class="flex space-x-2">
                                <input type="radio" name="q1" value="1" required class="w-6 h-6"> <span class="text-xs">1</span>
                                <input type="radio" name="q1" value="2" class="w-6 h-6"> <span class="text-xs">2</span>
                                <input type="radio" name="q1" value="3" class="w-6 h-6"> <span class="text-xs">3</span>
                                <input type="radio" name="q1" value="4" class="w-6 h-6"> <span class="text-xs">4</span>
                                <input type="radio" name="q1" value="5" class="w-6 h-6"> <span class="text-xs">5</span>
                            </div>
                            <span class="text-sm text-gray-600">I (내향)</span>
                        </div>
                    </div>

                    <!-- Q2 -->
                    <div class="border-l-4 border-blue-500 pl-4">
                        <h4 class="font-bold text-gray-800 mb-2">Q2. [정보 인식] 새로운 암 보험 상품을 공부할 때, 당신의 눈에 먼저 들어오는 것은?</h4>
                        <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div class="bg-blue-50 p-3 rounded">(S) 면책 기간, 감액 지급 규정, 정확한 보험료 구간 등 구체적인 약관 세부 내용.</div>
                            <div class="bg-green-50 p-3 rounded">(N) 이 상품이 고객의 인생 주기에서 어떤 의미를 갖는지, 그리고 이 보장으로 얻게 될 평화로운 미래의 모습.</div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">S (감각)</span>
                            <div class="flex space-x-2">
                                <input type="radio" name="q2" value="1" required class="w-6 h-6"> <span class="text-xs">1</span>
                                <input type="radio" name="q2" value="2" class="w-6 h-6"> <span class="text-xs">2</span>
                                <input type="radio" name="q2" value="3" class="w-6 h-6"> <span class="text-xs">3</span>
                                <input type="radio" name="q2" value="4" class="w-6 h-6"> <span class="text-xs">4</span>
                                <input type="radio" name="q2" value="5" class="w-6 h-6"> <span class="text-xs">5</span>
                            </div>
                            <span class="text-sm text-gray-600">N (직관)</span>
                        </div>
                    </div>

                    <!-- Q3 -->
                    <div class="border-l-4 border-green-500 pl-4">
                        <h4 class="font-bold text-gray-800 mb-2">Q3. [의사 결정] 계약을 고민하는 고객에게 마지막 한마디를 던진다면?</h4>
                        <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div class="bg-blue-50 p-3 rounded">(T) "이 상품은 타사 대비 보장 범위가 30% 넓고, 가성비 면에서 현재 가장 논리적인 선택입니다."</div>
                            <div class="bg-green-50 p-3 rounded">(F) "고객님, 제가 제 가족의 보험을 설계한다는 마음으로 정성을 다해 준비했습니다. 저를 믿고 맡겨주세요."</div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">T (사고)</span>
                            <div class="flex space-x-2">
                                <input type="radio" name="q3" value="1" required class="w-6 h-6"> <span class="text-xs">1</span>
                                <input type="radio" name="q3" value="2" class="w-6 h-6"> <span class="text-xs">2</span>
                                <input type="radio" name="q3" value="3" class="w-6 h-6"> <span class="text-xs">3</span>
                                <input type="radio" name="q3" value="4" class="w-6 h-6"> <span class="text-xs">4</span>
                                <input type="radio" name="q3" value="5" class="w-6 h-6"> <span class="text-xs">5</span>
                            </div>
                            <span class="text-sm text-gray-600">F (감정)</span>
                        </div>
                    </div>

                    <!-- Q4 -->
                    <div class="border-l-4 border-yellow-500 pl-4">
                        <h4 class="font-bold text-gray-800 mb-2">Q4. [성취 동기] 이번 달 마감 목표를 달성했을 때, 당신을 가장 기쁘게 하는 보상은?</h4>
                        <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div class="bg-blue-50 p-3 rounded">(도파민) 시상대에 올라가 동료들의 박수를 받으며 받는 화려한 트로피와 고액 보너스.</div>
                            <div class="bg-green-50 p-3 rounded">(세로토닌) 마감을 무사히 마쳤다는 안도감과 함께 사랑하는 가족과 보내는 평온하고 따뜻한 저녁 시간.</div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">도파민</span>
                            <div class="flex space-x-2">
                                <input type="radio" name="q4" value="1" required class="w-6 h-6"> <span class="text-xs">1</span>
                                <input type="radio" name="q4" value="2" class="w-6 h-6"> <span class="text-xs">2</span>
                                <input type="radio" name="q4" value="3" class="w-6 h-6"> <span class="text-xs">3</span>
                                <input type="radio" name="q4" value="4" class="w-6 h-6"> <span class="text-xs">4</span>
                                <input type="radio" name="q4" value="5" class="w-6 h-6"> <span class="text-xs">5</span>
                            </div>
                            <span class="text-sm text-gray-600">세로토닌</span>
                        </div>
                    </div>

                    <!-- Q5 -->
                    <div class="border-l-4 border-red-500 pl-4">
                        <h4 class="font-bold text-gray-800 mb-2">Q5. [스트레스 회복력] 가입하기로 했던 고객이 갑자기 전화를 안 받고 잠수를 탔습니다. 당신의 상태는?</h4>
                        <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div class="bg-blue-50 p-3 rounded">(회복탄력성) "바쁘신가 보네"라고 생각하며 크게 개의치 않고 다른 업무 리스트를 체크한다.</div>
                            <div class="bg-green-50 p-3 rounded">(불안 민감도) "내가 실수를 했나?" 하는 생각에 온종일 일이 손에 잡히지 않고, 자꾸 휴대폰만 확인하게 된다.</div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">회복탄력성</span>
                            <div class="flex space-x-2">
                                <input type="radio" name="q5" value="1" required class="w-6 h-6"> <span class="text-xs">1</span>
                                <input type="radio" name="q5" value="2" class="w-6 h-6"> <span class="text-xs">2</span>
                                <input type="radio" name="q5" value="3" class="w-6 h-6"> <span class="text-xs">3</span>
                                <input type="radio" name="q5" value="4" class="w-6 h-6"> <span class="text-xs">4</span>
                                <input type="radio" name="q5" value="5" class="w-6 h-6"> <span class="text-xs">5</span>
                            </div>
                            <span class="text-sm text-gray-600">불안 민감도</span>
                        </div>
                    </div>

                    <!-- Q6 -->
                    <div class="border-l-4 border-indigo-500 pl-4">
                        <h4 class="font-bold text-gray-800 mb-2">Q6. [전문성 선호도] 특별 교육이 있다면, 어떤 수업에 더 참여하고 싶습니까?</h4>
                        <div class="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div class="bg-blue-50 p-3 rounded">(학구파) 보험법의 변천사와 정밀한 약관 분석을 통해 전문가로서의 이론적 깊이를 채우는 수업.</div>
                            <div class="bg-green-50 p-3 rounded">(현장파) 현장에서 바로 써먹을 수 있는 강력한 클로징 멘트와 고객 거절 처리 기법을 실전처럼 연습하는 수업.</div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">학구파</span>
                            <div class="flex space-x-2">
                                <input type="radio" name="q6" value="1" required class="w-6 h-6"> <span class="text-xs">1</span>
                                <input type="radio" name="q6" value="2" class="w-6 h-6"> <span class="text-xs">2</span>
                                <input type="radio" name="q6" value="3" class="w-6 h-6"> <span class="text-xs">3</span>
                                <input type="radio" name="q6" value="4" class="w-6 h-6"> <span class="text-xs">4</span>
                                <input type="radio" name="q6" value="5" class="w-6 h-6"> <span class="text-xs">5</span>
                            </div>
                            <span class="text-sm text-gray-600">현장파</span>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-4 mt-6">
                        <button type="button" onclick="closePersonalityTest()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                            취소
                        </button>
                        <button type="submit" id="savePersonalityBtn" class="gradient-bg text-white px-6 py-3 rounded-lg hover:opacity-90">
                            <i class="fas fa-save mr-2"></i>저장 및 AI 분석
                        </button>
                        <span id="personalityLoading" class="hidden">
                            <div class="loading"></div>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- 경력 정보 입력 모달 -->
    <div id="careerModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-briefcase mr-2 text-blue-600"></i>경력 정보 입력
                    </h3>
                    <button onclick="closeCareerModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="careerForm" class="space-y-4">
                    <!-- 보험 업무 시작 년도 -->
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            보험 업무 시작 년도 <span class="text-red-500">*</span>
                        </label>
                        <input type="number" id="careerStartYearInput" required
                            min="1970" max="2026" placeholder="예: 2015"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    </div>
                    
                    <!-- 최초 시작 조직 -->
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            최초 시작한 조직 (경력인 경우) <span class="text-red-500">*</span>
                        </label>
                        <select id="firstOrganizationInput" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            <option value="">선택하세요</option>
                            <option value="원수사 생보">원수사 생보</option>
                            <option value="원수사 손보">원수사 손보</option>
                            <option value="자회사GA">자회사GA</option>
                            <option value="GA">GA</option>
                        </select>
                    </div>
                    
                    <!-- 회사 이직 경로 -->
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            회사 이직 경로 <span class="text-red-500">*</span>
                        </label>
                        <textarea id="careerPathInput" required rows="3"
                            placeholder="예: A생명(2015-2018) → B손해보험(2018-2020) → C GA(2020-현재)"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                        <p class="text-xs text-gray-500 mt-1">회사명과 근무 기간을 입력해주세요</p>
                    </div>
                    
                    <!-- 판매 상품 비중 -->
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            판매 상품 비중 (생보 vs 손보) <span class="text-red-500">*</span>
                        </label>
                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm text-gray-600 mb-1">생보 (%)</label>
                                <input type="range" id="productRatioLifeInput" 
                                    min="0" max="100" value="50" step="5"
                                    oninput="updateProductRatioDisplay()"
                                    class="w-full">
                                <div class="flex justify-between text-xs text-gray-500">
                                    <span>0%</span>
                                    <span id="lifeRatioDisplay" class="font-bold text-blue-600">50%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm text-gray-600 mb-1">손보 (%)</label>
                                <input type="range" id="productRatioNonLifeInput" 
                                    min="0" max="100" value="50" step="5"
                                    oninput="updateProductRatioDisplay()"
                                    class="w-full">
                                <div class="flex justify-between text-xs text-gray-500">
                                    <span>0%</span>
                                    <span id="nonLifeRatioDisplay" class="font-bold text-green-600">50%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                            <p class="text-xs text-red-500 hidden" id="ratioError">생보와 손보의 합계가 100%가 되어야 합니다</p>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-4 mt-6">
                        <button type="button" onclick="closeCareerModal()" 
                            class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                            취소
                        </button>
                        <button type="submit" id="saveCareerBtn" 
                            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                            <i class="fas fa-save mr-2"></i>저장
                        </button>
                        <span id="careerLoading" class="hidden">
                            <div class="loading"></div>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- 개인정보 입력 모달 -->
    <div id="personalInfoModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-id-card mr-2 text-green-600"></i>개인정보 입력
                    </h3>
                    <button onclick="closePersonalInfoModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <form id="personalInfoForm" class="space-y-4">
                    <!-- 출생년도 -->
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            나이 (출생년도) <span class="text-red-500">*</span>
                        </label>
                        <input type="number" id="birthYearInput" required
                            min="1940" max="2010" placeholder="예: 1985"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                        <p class="text-xs text-gray-500 mt-1">출생년도 4자리를 입력해주세요</p>
                    </div>
                    
                    <!-- 성별 -->
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            성별 <span class="text-red-500">*</span>
                        </label>
                        <div class="flex space-x-4">
                            <label class="flex items-center cursor-pointer">
                                <input type="radio" name="gender" value="남" required class="mr-2">
                                <span>남</span>
                            </label>
                            <label class="flex items-center cursor-pointer">
                                <input type="radio" name="gender" value="여" required class="mr-2">
                                <span>여</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- 결혼 여부 -->
                    <div>
                        <label class="block text-gray-700 font-semibold mb-2">
                            결혼 여부 <span class="text-red-500">*</span>
                        </label>
                        <select id="maritalStatusInput" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            <option value="">선택하세요</option>
                            <option value="미혼">미혼</option>
                            <option value="기혼 (자녀 있음)">기혼 (자녀 있음)</option>
                            <option value="기혼 (자녀 없음)">기혼 (자녀 없음)</option>
                            <option value="돌싱">돌싱</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>
                    
                    <div class="flex justify-end space-x-4 mt-6">
                        <button type="button" onclick="closePersonalInfoModal()" 
                            class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                            취소
                        </button>
                        <button type="submit" id="savePersonalInfoBtn" 
                            class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
                            <i class="fas fa-save mr-2"></i>저장
                        </button>
                        <span id="personalInfoLoading" class="hidden">
                            <div class="loading"></div>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- 성향 Report 모달 -->
    <div id="personalityReportModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-file-alt mr-2 text-purple-600"></i>성향 Report
                    </h3>
                    <button onclick="closePersonalityReport()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <div id="personalityReportContent"></div>
            </div>
        </div>
    </div>

    <div id="sessionModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-bold text-gray-800">AI 코칭 상세</h3>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <div id="sessionDetail"></div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/planner-dashboard.js"></script>
</body>
</html>
`
