module.exports = {
  apps: [{
    name: 'fuel-tracker',
    script: 'npm',
    args: 'start',
    cwd: '/home/username/fuel-tracker',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/username/fuel-tracker/logs/err.log',
    out_file: '/home/username/fuel-tracker/logs/out.log',
    log_file: '/home/username/fuel-tracker/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};