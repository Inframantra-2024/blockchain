const nodemailer = require('nodemailer');
const logger = require('../logger/logger');

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    console.log(to,subject,html)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error(`Email sending failed: ${error.message}`);
    throw new Error('Failed to send email');
  }
};

