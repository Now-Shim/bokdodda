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
      exec_mode: 'fork'
    }
  ]
}
