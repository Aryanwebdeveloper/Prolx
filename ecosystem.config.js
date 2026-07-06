// PM2 Ecosystem Config — runs Next.js in PRODUCTION mode
// Usage: pm2 start ecosystem.config.js
// Deploy: npm run build && pm2 reload ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "prolx",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Restart on crash, wait 5s between restarts
      restart_delay: 5000,
      max_restarts: 10,
      // Logs
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
