// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ead-distrito-manaus',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/home/ead/app',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    max_memory_restart: '512M',
    error_file: '/home/ead/logs/err.log',
    out_file: '/home/ead/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }],
}
