// templates/resetPasswordTemplate.js
exports.generateResetTemplate = (name, url) => `
  <h2>Hello ${name},</h2>
  <p>You requested to reset your password.</p>
  <p>Click below to reset it (valid for 15 minutes):</p>
  <a href="${url}" style="padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;">Reset Password</a>
  <p>If you did not request this, ignore this email.</p>
`;