module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=webapp-production --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        OPENAI_API_KEY: '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',
        OPENAI_BASE_URL: 'https://openrouter.ai/api/v1'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      
      // 🛡️ 안정성 개선 설정
      max_memory_restart: '300M',     // 300MB 초과시 자동 재시작 (메모리 누수 방지)
      kill_timeout: 5000,             // 강제 종료 전 5초 대기
      restart_delay: 3000,            // 재시작 전 3초 대기
      autorestart: true,              // 비정상 종료시 자동 재시작
      max_restarts: 10,               // 1분 내 최대 10회 재시작
      min_uptime: '10s',              // 10초 이상 실행되어야 정상으로 간주
      
      // 📝 로그 관리
      error_file: '/home/user/.pm2/logs/webapp-error.log',
      out_file: '/home/user/.pm2/logs/webapp-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true
    }
  ]
}
