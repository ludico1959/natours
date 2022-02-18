const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporteR.
  const transporter = nodemailer.createTransport({
    /* In case of using Gmail: active in Gmail "less secure app" option.
     * service: 'Gmail',
     * auth: {
     *   user: process.env.EMAIL_USERNAME,
     *   pass: process.env.EMAIL_PASSWORD,
     */

    // Using mail trap: https://mailtrap.io/inboxes
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define email options.
  const mailOption = {
    from: 'Lucas Coelho <ludico1959@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the email.
  await transporter.sendMail(mailOption);
};

module.exports = sendEmail;
