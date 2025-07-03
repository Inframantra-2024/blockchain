// templates/merchantApprovalEmail.js

module.exports = function generateMerchantApprovalEmail({ name, email, password, apiKey, apiSecret, walletAddress }) {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>✅ Merchant Account Approved</h2>

      <p>Dear ${name},</p>

      <p>Your merchant account has been <strong>approved</strong>. Please find your login and API credentials below:</p>

      <h3>🔐 Account Credentials</h3>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>

      <h3>⚙️ API Credentials</h3>
      <ul>
        <li><strong>API Key:</strong> ${apiKey}</li>
        <li><strong>API Secret:</strong> ${apiSecret}</li>
      </ul>

      <h3>💼 Wallet</h3>
      <ul>
        <li><strong>USDT Wallet Address:</strong> ${walletAddress}</li>
      </ul>

      <p>📌 <strong>Note:</strong> Please change your password immediately after login and store your credentials securely.</p>

      <p>Best regards,<br/>Secure Crypto Gateway Team</p>
    </div>
  `;
};
