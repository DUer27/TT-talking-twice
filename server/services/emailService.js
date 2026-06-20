const nodemailer = require('nodemailer');
const { email } = require('../config/env');

let transporter = null;

const getTransporter = () => {
  if (!email.host || !email.user || !email.pass || !email.from) {
    const error = new Error('邮件服务未配置，请先在 .env 中填写 SMTP_HOST、SMTP_USER、SMTP_PASS 和 SMTP_FROM');
    error.statusCode = 503;
    throw error;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: email.host,
      port: email.port,
      secure: email.secure,
      auth: {
        user: email.user,
        pass: email.pass,
      },
    });
  }

  return transporter;
};

const getPurposeText = (purpose) => {
  if (purpose === 'reset_password') return '找回密码';
  return '注册账号';
};

const sendVerificationCodeEmail = async ({ to, code, purpose }) => {
  const purposeText = getPurposeText(purpose);
  await getTransporter().sendMail({
    from: email.from,
    to,
    subject: `现经管回声${purposeText}验证码`,
    text: `你的现经管回声${purposeText}验证码是：${code}。验证码 10 分钟内有效，请勿转发给他人。`,
    html: `
      <div style="font-family:Arial,'Microsoft YaHei',sans-serif;line-height:1.7;color:#1f2937;">
        <h2 style="margin:0 0 12px;">现经管回声${purposeText}验证码</h2>
        <p>你的验证码是：</p>
        <p style="font-size:28px;font-weight:800;letter-spacing:4px;margin:12px 0;">${code}</p>
        <p>验证码 10 分钟内有效，请勿转发给他人。</p>
      </div>
    `,
  });
};

module.exports = {
  sendVerificationCodeEmail,
};
