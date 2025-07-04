const nodemailer = require('nodemailer');
const logger = require('../logger/logger');

/**
 * Email Service for sending notifications
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.setupTransporter();
  }

  /**
   * Setup email transporter
   */
  setupTransporter() {
    try {
      // Email configuration from environment variables
      const emailConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER || 'your-email@gmail.com',
          pass: process.env.EMAIL_PASS || 'your-app-password'
        }
      };

      this.transporter = nodemailer.createTransport(emailConfig);
      
      // Test configuration
      this.transporter.verify((error, success) => {
        if (error) {
          logger.warn(`📧 Email service not configured: ${error.message}`);
          this.isConfigured = false;
        } else {
          logger.info(`📧 Email service configured successfully`);
          this.isConfigured = true;
        }
      });

    } catch (error) {
      logger.error(`💥 Failed to setup email service: ${error.message}`);
      this.isConfigured = false;
    }
  }

  /**
   * Send deposit success notification email
   */
  async sendDepositSuccessEmail(notification) {
    if (!this.isConfigured) {
      logger.warn(`📧 Email not configured, skipping deposit success email`);
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Crypto Gateway <noreply@cryptogateway.com>',
        to: process.env.ADMIN_EMAIL || 'admin@cryptogateway.com',
        subject: `💰 New Payment Received - ${notification.details.amount} ${notification.details.currency}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">💰 Payment Received Successfully!</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Transaction Details:</h3>
              <p><strong>Merchant:</strong> ${notification.details.merchantName}</p>
              <p><strong>Email:</strong> ${notification.details.merchantEmail}</p>
              <p><strong>Amount:</strong> ${notification.details.amount} ${notification.details.currency}</p>
              <p><strong>Transaction ID:</strong> ${notification.details.transactionId}</p>
              <p><strong>Wallet Address:</strong> ${notification.details.walletAddress}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
              <p><strong>✅ Status:</strong> Payment confirmed and transferred to Super Admin wallet</p>
              <p><strong>💰 Merchant Balance:</strong> Updated with ${notification.details.amount} ${notification.details.currency}</p>
            </div>
            
            <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
              This is an automated notification from your Crypto Payment Gateway.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Deposit success email sent for transaction ${notification.details.transactionId}`);
      return true;

    } catch (error) {
      logger.error(`💥 Failed to send deposit success email: ${error.message}`);
      return false;
    }
  }

  /**
   * Send deposit failed notification email
   */
  async sendDepositFailedEmail(notification) {
    if (!this.isConfigured) {
      logger.warn(`📧 Email not configured, skipping deposit failed email`);
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Crypto Gateway <noreply@cryptogateway.com>',
        to: process.env.ADMIN_EMAIL || 'admin@cryptogateway.com',
        subject: `❌ Payment Failed - ${notification.details.merchantName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">❌ Payment Failed</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Transaction Details:</h3>
              <p><strong>Merchant:</strong> ${notification.details.merchantName}</p>
              <p><strong>Email:</strong> ${notification.details.merchantEmail}</p>
              <p><strong>Expected Amount:</strong> ${notification.details.amount} ${notification.details.currency}</p>
              <p><strong>Transaction ID:</strong> ${notification.details.transactionId}</p>
              <p><strong>Wallet Address:</strong> ${notification.details.walletAddress}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #f8d7da; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545;">
              <p><strong>❌ Reason:</strong> ${notification.details.reason}</p>
              <p><strong>⏰ Timeout:</strong> No payment received within 10 minutes</p>
            </div>
            
            <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
              This is an automated notification from your Crypto Payment Gateway.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Deposit failed email sent for transaction ${notification.details.transactionId}`);
      return true;

    } catch (error) {
      logger.error(`💥 Failed to send deposit failed email: ${error.message}`);
      return false;
    }
  }

  /**
   * Send withdrawal request notification email
   */
  async sendWithdrawalRequestEmail(notification) {
    if (!this.isConfigured) {
      logger.warn(`📧 Email not configured, skipping withdrawal request email`);
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Crypto Gateway <noreply@cryptogateway.com>',
        to: process.env.ADMIN_EMAIL || 'admin@cryptogateway.com',
        subject: `🏦 New Withdrawal Request - ${notification.details.merchantName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ffc107;">🏦 New Withdrawal Request</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Withdrawal Details:</h3>
              <p><strong>Merchant:</strong> ${notification.details.merchantName}</p>
              <p><strong>Email:</strong> ${notification.details.merchantEmail}</p>
              <p><strong>Requested Amount:</strong> ${notification.details.amount} USDT</p>
              <p><strong>Fee Amount:</strong> ${notification.details.feeAmount} USDT</p>
              <p><strong>Net Amount:</strong> ${notification.details.netAmount} USDT</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <p><strong>🚨 ACTION REQUIRED:</strong> Please review and approve/reject this withdrawal request</p>
              <p><strong>📍 Destination:</strong> Merchant's registered wallet address</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.ADMIN_DASHBOARD_URL || 'http://localhost:5000/admin/withdrawals'}" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Review Withdrawal Request
              </a>
            </div>
            
            <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
              This is an automated notification from your Crypto Payment Gateway.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Withdrawal request email sent for merchant ${notification.details.merchantName}`);
      return true;

    } catch (error) {
      logger.error(`💥 Failed to send withdrawal request email: ${error.message}`);
      return false;
    }
  }

  /**
   * Send withdrawal approved notification email
   */
  async sendWithdrawalApprovedEmail(notification) {
    if (!this.isConfigured) {
      logger.warn(`📧 Email not configured, skipping withdrawal approved email`);
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Crypto Gateway <noreply@cryptogateway.com>',
        to: process.env.ADMIN_EMAIL || 'admin@cryptogateway.com',
        subject: `✅ Withdrawal Approved - ${notification.details.merchantName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">✅ Withdrawal Approved</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Withdrawal Details:</h3>
              <p><strong>Merchant:</strong> ${notification.details.merchantName}</p>
              <p><strong>Email:</strong> ${notification.details.merchantEmail}</p>
              <p><strong>Amount Transferred:</strong> ${notification.details.netAmount} USDT</p>
              <p><strong>Approved By:</strong> ${notification.details.approvedBy}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
              <p><strong>✅ Status:</strong> Withdrawal processed successfully</p>
              <p><strong>💸 Transfer:</strong> Funds sent to merchant's wallet</p>
            </div>
            
            <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
              This is an automated notification from your Crypto Payment Gateway.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Withdrawal approved email sent for merchant ${notification.details.merchantName}`);
      return true;

    } catch (error) {
      logger.error(`💥 Failed to send withdrawal approved email: ${error.message}`);
      return false;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
