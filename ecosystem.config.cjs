module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=webapp-production --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
        // API keys are loaded from .dev.vars file
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      
      // 🛡️ 안정성 개선 설정 (강화)
      max_memory_restart: '400M',     // 400MB 초과시 자동 재시작 (여유 확보)
      kill_timeout: 10000,            // 강제 종료 전 10초 대기 (DB 연결 정리)
      restart_delay: 5000,            // 재시작 전 5초 대기 (안정성 향상)
      autorestart: true,              // 비정상 종료시 자동 재시작
      max_restarts: 15,               // 1분 내 최대 15회 재시작 (재시도 횟수 증가)
      min_uptime: '15s',              // 15초 이상 실행되어야 정상으로 간주
      exp_backoff_restart_delay: 100, // 재시작 간격 지수 증가 (100ms 시작)
      
      // 📝 로그 관리
      error_file: '/home/user/.pm2/logs/webapp-error.log',
      out_file: '/home/user/.pm2/logs/webapp-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true
    }
  ]
}
