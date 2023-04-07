export class MailerConfig {
  createMailerOptions() {
    console.log(process.env.MAIL_USER); // should have value
    return {
      transport: {
        service: 'Gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
    };
  }
}
