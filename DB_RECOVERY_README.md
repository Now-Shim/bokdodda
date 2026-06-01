# 복독다 데이터베이스 복구 가이드

## 📅 백업 일시
- **백업 날짜**: 2026-06-01 08:34 KST
- **복구된 데이터**: 경력정보, 개인정보, 코칭세션 18건

## 🗂️ 데이터베이스 파일 위치

### 현재 활성 데이터베이스:
```
.wrangler/state/v3/d1/miniflare-D1DatabaseObject/ea45fcb02b3c60185007cb60cacbc03812abf48bfe95a8775a23bbb934da8c62.sqlite
```

### 백업 데이터베이스 (원본):
```
.wrangler/state/v3/d1/miniflare-D1DatabaseObject/4400f1f5d80d15b2181607398d7cee3476b985c9d23318fcf3fb54c598641314.sqlite
```

### 임시 백업 (시스템):
```
/tmp/bokdodda-d1-backup-20260601_083452/
```

## 📦 복구된 데이터 내역

### User ID: 11 (이영수 플래너)

#### 경력 정보:
- 경력 시작 연도: 2024
- 첫 소속 조직: 원수사 생보
- 경력 경로: 메트라이프생명(2024)-> 인카GA (2025)-> 메가(2026.04)
- 판매 상품 비율: 생보 80% / 손보 20%

#### 개인정보:
- 출생 연도: 1984
- 성별: 남
- 결혼 상태: 기혼 (자녀 있음)

#### 코칭 이력:
- 총 코칭 세션: 18건

## 🔧 수동 복구 방법 (필요시)

### 1. 이전 데이터베이스에서 복구하기:

```bash
cd /home/user/webapp

python3 << 'PYTHON_EOF'
import sqlite3

# Source: 백업 데이터베이스
source_db = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/4400f1f5d80d15b2181607398d7cee3476b985c9d23318fcf3fb54c598641314.sqlite'

# Target: 현재 활성 데이터베이스
target_db = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/ea45fcb02b3c60185007cb60cacbc03812abf48bfe95a8775a23bbb934da8c62.sqlite'

# 데이터 복구 실행
source_conn = sqlite3.connect(source_db)
source_cursor = source_conn.cursor()

# planner_profiles 데이터 읽기
source_cursor.execute("""
    SELECT career_start_year, first_organization, career_path, 
           birth_year, gender, marital_status, product_ratio
    FROM planner_profiles WHERE user_id = 11
""")
profile_data = source_cursor.fetchone()

# coaching_sessions 데이터 읽기
source_cursor.execute("SELECT * FROM coaching_sessions WHERE planner_id = 11")
sessions = source_cursor.fetchall()

source_conn.close()

# 대상 데이터베이스에 쓰기
target_conn = sqlite3.connect(target_db)
target_cursor = target_conn.cursor()

# 프로필 업데이트
target_cursor.execute("""
    UPDATE planner_profiles 
    SET career_start_year = ?, first_organization = ?, career_path = ?,
        birth_year = ?, gender = ?, marital_status = ?, product_ratio = ?
    WHERE user_id = 11
""", profile_data)

# 세션 복구
for s in sessions:
    target_cursor.execute("""
        INSERT OR REPLACE INTO coaching_sessions 
        (id, planner_id, session_date, context, situation_type, 
         ai_analysis, coaching_advice, recommended_approach, tacit_knowledge_applied,
         planner_feedback, effectiveness_rating, is_shared, created_at,
         sales_process, current_stage, product_selling_point, dialogue_script,
         required_knowledge, manager_request, manager_note, director_feedback,
         director_rating, is_validated, use_for_learning, analyzed_question,
         category, key_points, coaching_point, coaching_evidence, dialogue,
         learning_needs, action_guidelines, reference_sources, 
         director_30years_knowledge, manager_ai_advice)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, s)

target_conn.commit()
target_conn.close()

print("✅ 복구 완료!")
PYTHON_EOF
```

### 2. PM2 재시작:

```bash
cd /home/user/webapp
fuser -k 3000/tcp 2>/dev/null || true
pm2 restart webapp
# 또는
pm2 start ecosystem.config.cjs
```

### 3. 데이터 확인:

```bash
npx wrangler d1 execute bokdodda-production --local --command="SELECT user_id, career_start_year, first_organization, total_coaching_sessions FROM planner_profiles WHERE user_id = 11"
```

## 🚀 서비스 시작 방법

```bash
cd /home/user/webapp

# 1. 포트 정리
fuser -k 3000/tcp 2>/dev/null || true

# 2. 빌드 (필요시)
npm run build

# 3. PM2로 시작
pm2 start ecosystem.config.cjs

# 4. 로그 확인
pm2 logs --nostream

# 5. 서비스 상태 확인
curl http://localhost:3000
```

## 🌐 접속 정보

- **서비스 URL**: https://3000-iuxxx5vpsdpcjyti6fmff-a402f90a.sandbox.novita.ai
- **테스트 계정**: planner01@bukdotda.com / demo123

## 📊 데이터베이스 구조

### planner_profiles 테이블:
- user_id (FK to users)
- personality_type, sales_style, experience_years, specialization
- strengths, weaknesses
- career_start_year, first_organization, career_path, product_ratio
- birth_year, gender, marital_status
- total_coaching_sessions, total_training_completed

### coaching_sessions 테이블:
- id, planner_id, session_date
- context, situation_type
- ai_analysis, coaching_advice, recommended_approach
- manager_ai_advice, director_30years_knowledge
- 기타 35개 컬럼

## ⚠️ 주의사항

1. **데이터베이스 파일 삭제 금지**: `.wrangler/state/v3/d1/` 폴더 삭제하지 말 것
2. **백업 데이터베이스 보존**: `4400f1f5...sqlite` 파일은 원본 데이터이므로 삭제 금지
3. **seed-users-fixed.sql 실행 주의**: 이 파일은 기본 프로필만 생성하므로, 상세 정보는 위 복구 스크립트 사용
4. **Git 커밋 유지**: 모든 변경사항은 git에 커밋되어 있음

## 🔄 자동 복구 시나리오

만약 샌드박스가 리셋되어도:
1. Git에서 코드 복구: `git pull`
2. 프로젝트 백업에서 복구: https://www.genspark.ai/api/files/s/N8wM2of1
3. 위 Python 스크립트로 데이터 복구

## 📝 변경 이력

- 2026-06-01: 초기 데이터 복구 완료 (User ID 11, 18 coaching sessions)
- Git Commit: 3c87f1b
