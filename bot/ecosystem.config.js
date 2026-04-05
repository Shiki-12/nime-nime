/**
 * PM2 Ecosystem Configuration for the NimeNime Telegram Bot.
 *
 * Usage:
 *   pm2 start bot/ecosystem.config.js
 *   pm2 logs nimenime-bot
 *   pm2 stop nimenime-bot
 *   pm2 restart nimenime-bot
 */
module.exports = {
  apps: [
    {
      name: "nimenime-bot",
      script: "./bot/telegram-bot.js",
      cwd: __dirname + "/..",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: "production",
      },
      // Logging
      error_file: "./bot/logs/error.log",
      out_file: "./bot/logs/output.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
