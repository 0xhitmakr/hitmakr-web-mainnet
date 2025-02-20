module.exports = {
    apps: [{
      name: 'hitmakr-web-mainnet',
      script: 'bun',
      args: 'run start', 
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production'
      }
    }]
  };