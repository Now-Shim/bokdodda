// Cloudflare D1 REST API를 통한 프로필 업데이트
const ACCOUNT_ID = 'b77e220e110e4c43cffb8e48a594ce1b';
const DATABASE_ID = 'a2f3272a-d253-4bdb-9f98-bd0398bdfa0d';

// wrangler.jsonc에서 API 토큰 가져오기
const fs = require('fs');
const wranglerConfig = fs.readFileSync('wrangler.jsonc', 'utf8');
console.log('Wrangler config loaded');

// UPDATE 쿼리
const updateQuery = `
UPDATE planner_profiles 
SET 
  career_start_year = 2015,
  first_organization = '삼성생명',
  career_path = '삼성생명 → 교보생명 → 현대해상',
  product_ratio = '생보 60% / 손보 40%',
  birth_year = 1985,
  gender = '여성',
  marital_status = '기혼',
  updated_at = CURRENT_TIMESTAMP
WHERE user_id = 1
`;

// 확인 쿼리
const selectQuery = `
SELECT 
  user_id,
  career_start_year,
  first_organization,
  birth_year,
  gender,
  marital_status
FROM planner_profiles 
WHERE user_id = 1
`;

console.log('UPDATE query:');
console.log(updateQuery);
console.log('\nSELECT query:');
console.log(selectQuery);
console.log('\n프로덕션 환경에서 wrangler 명령어로 실행하세요:');
console.log(`npx wrangler d1 execute bokdodda-production --remote --command="${updateQuery.trim().replace(/\n/g, ' ')}"`);
