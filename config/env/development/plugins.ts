export default ({ env }) => ({
  // local file upload in dev
  upload: {
    config: {
      provider: 'local',
      providerOptions: {},
      sizeLimit: env.int('UPLOAD_MAX_SIZE', 10 * 1024 * 1024), // 10 MB
    },
  },
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'localhost'),
        port: env.int('SMTP_PORT', 1025),
        secure: false,
      },
      settings: {
        defaultFrom: env('EMAIL_FROM', 'dev@example.com'),
        defaultReplyTo: env('EMAIL_REPLY_TO', 'dev@example.com'),
      },
    },
  },
});
