module.exports = {
  apps: [{
    name: 'taxflow-pro',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NEXT_PUBLIC_API_URL: 'https://api.piaozone.com',
      NODE_ENV: 'production',
      NEXT_PUBLIC_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    env_sit: {
      NEXT_PUBLIC_API_URL: 'https://api-sit.piaozone.com',
      NODE_ENV: 'production',
      REDIS_HOST: '172.31.36.22',
      REDIS_PORT: '6379',
      REDIS_PASSWORD: '',
      REDIS_DATABASE: '3',
      NEXT_PUBLIC_ENV: 'sit',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    env_test: {
        NEXT_PUBLIC_API_URL: 'https://api-dev.piaozone.com',
        NODE_ENV: 'production',
        REDIS_HOST: '172.31.36.22',
        REDIS_PORT: '6379',
        REDIS_PASSWORD: '',
        REDIS_DATABASE: '3',
        NEXT_PUBLIC_ENV: 'test',
        NEXT_PUBLIC_BASE_PATH: '/taxflow',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
    },
    env_production: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    // 日志配置 - 统一输出到 logs 目录
    log_file: './logs/info.log',
    out_file: './logs/info.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',

    // 避免日志合并造成格式混乱
    combine_logs: false,
    merge_logs: false,
    // 进程管理配置
    min_uptime: '10s',
    max_restarts: 10,
    // 集群模式配置（如果需要）
    // instances: 'max',
    // exec_mode: 'cluster'
  }]
};