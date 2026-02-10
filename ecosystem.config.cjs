module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=webapp-production --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        GENSPARK_TOKEN: process.env.GENSPARK_TOKEN || '',
        OPENAI_API_KEY: process.env.GENSPARK_TOKEN || '',
        OPENAI_BASE_URL: 'https://www.genspark.ai/api/llm_proxy/v1'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
