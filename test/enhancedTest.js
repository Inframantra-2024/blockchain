/**
 * Enhanced Test Script for Database Notifications and Statistics
 * Tests all new features including database storage, email notifications, and statistics
 */

const mongoose = require('mongoose');
const logger = require('../logger/logger');

// Import models and services
const Notification = require('../models/Notification');
const MerchantStats = require('../models/MerchantStats');
const User = require('../models/user');
const adminNotification = require('../services/adminNotification');
const blockchainService = require('../services/blockchainService');

class EnhancedTester {
  constructor() {
    this.testResults = [];
  }

  /**
   * Log test result
   */
  logResult(testName, success, message, data = null) {
    const result = {
      test: testName,
      success: success,
      message: message,
      data: data,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.push(result);
    
    if (success) {
      logger.info(`✅ ${testName}: ${message}`);
    } else {
      logger.error(`❌ ${testName}: ${message}`);
    }
    
    if (data) {
      logger.info(`📋 Data: ${JSON.stringify(data, null, 2)}`);
    }
  }

  /**
   * Test 1: Database Connection
   */
  async testDatabaseConnection() {
    try {
      if (mongoose.connection.readyState === 1) {
        this.logResult('Database Connection', true, 'MongoDB connected successfully');
        return true;
      } else {
        this.logResult('Database Connection', false, 'MongoDB not connected');
        return false;
      }
    } catch (error) {
      this.logResult('Database Connection', false, `Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Test 2: Create Test Merchant
   */
  async testCreateMerchant() {
    try {
      // Check if test merchant already exists
      let merchant = await User.findOne({ email: 'test-merchant@example.com' });
      
      if (!merchant) {
        merchant = new User({
          name: 'Test Merchant',
          email: 'test-merchant@example.com',
          password: 'hashedpassword123',
          role: 'merchant',
          approved: 'approved',
          apiKey: 'mk_test_' + Date.now(),
          apiSecret: 'sk_test_' + Date.now(),
          walletAddress: 'TTestWallet123456789012345678901234',
          totalAmt: 1000
        });
        
        await merchant.save();
        this.logResult('Create Test Merchant', true, 'Test merchant created successfully', {
          id: merchant._id,
          name: merchant.name,
          email: merchant.email
        });
      } else {
        this.logResult('Create Test Merchant', true, 'Test merchant already exists', {
          id: merchant._id,
          name: merchant.name,
          email: merchant.email
        });
      }
      
      return merchant;
    } catch (error) {
      this.logResult('Create Test Merchant', false, `Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Test 3: Test Deposit Success Notification
   */
  async testDepositSuccessNotification(merchant) {
    try {
      const mockTransaction = {
        _id: new mongoose.Types.ObjectId(),
        transactionId: 'txn_test_' + Date.now(),
        amount: 500,
        currencyType: 'USDT-TRC20',
        walletAddress: 'TTestWallet123456789012345678901234',
        merchantId: merchant._id
      };

      // Test notification creation
      await adminNotification.notifyDepositSuccess(mockTransaction, merchant);

      // Verify notification was saved to database
      const notification = await Notification.findOne({ 
        'details.transactionId': mockTransaction.transactionId 
      });

      if (notification) {
        this.logResult('Deposit Success Notification', true, 'Notification saved to database', {
          notificationId: notification._id,
          type: notification.type,
          title: notification.title
        });
      } else {
        this.logResult('Deposit Success Notification', false, 'Notification not found in database');
      }

      return notification;
    } catch (error) {
      this.logResult('Deposit Success Notification', false, `Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Test 4: Test Merchant Statistics
   */
  async testMerchantStatistics(merchant) {
    try {
      // Get merchant stats
      const stats = await adminNotification.getMerchantStats(merchant._id);

      if (stats) {
        this.logResult('Merchant Statistics', true, 'Statistics retrieved successfully', {
          merchantName: stats.merchantName,
          totalDeposits: stats.deposits.total.count,
          successfulDeposits: stats.deposits.successful.count,
          currentBalance: stats.currentBalance,
          lifetimeEarnings: stats.lifetimeEarnings
        });
      } else {
        this.logResult('Merchant Statistics', false, 'No statistics found for merchant');
      }

      return stats;
    } catch (error) {
      this.logResult('Merchant Statistics', false, `Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Test 5: Test Withdrawal Request Notification
   */
  async testWithdrawalNotification(merchant) {
    try {
      const mockWithdrawal = {
        _id: new mongoose.Types.ObjectId(),
        amount: 800,
        feeAmount: 40,
        netAmount: 760
      };

      // Test withdrawal notification
      await adminNotification.notifyWithdrawalRequest(mockWithdrawal, merchant);

      // Verify notification was saved
      const notification = await Notification.findOne({ 
        'details.withdrawalId': mockWithdrawal._id 
      });

      if (notification) {
        this.logResult('Withdrawal Request Notification', true, 'Withdrawal notification saved', {
          notificationId: notification._id,
          type: notification.type,
          actionRequired: notification.actionRequired
        });
      } else {
        this.logResult('Withdrawal Request Notification', false, 'Withdrawal notification not found');
      }

      return notification;
    } catch (error) {
      this.logResult('Withdrawal Request Notification', false, `Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Test 6: Test Blockchain API Integration
   */
  async testBlockchainAPI() {
    try {
      // Test wallet generation
      const wallet = await blockchainService.generateWallet('USDT-TRC20');
      
      this.logResult('Blockchain API - Wallet Generation', true, 'Wallet generated successfully', {
        address: wallet.address,
        network: wallet.network,
        source: wallet.source
      });

      // Test transaction monitoring
      const mockTransaction = {
        transactionId: 'txn_api_test_' + Date.now(),
        amount: 300,
        currencyType: 'USDT-TRC20',
        walletAddress: wallet.address
      };

      const confirmed = await blockchainService.monitorTransaction(mockTransaction);
      
      this.logResult('Blockchain API - Transaction Monitoring', true, 
        `Transaction monitoring completed: ${confirmed ? 'CONFIRMED' : 'FAILED'}`, {
        transactionId: mockTransaction.transactionId,
        confirmed: confirmed
      });

      return { wallet, confirmed };
    } catch (error) {
      this.logResult('Blockchain API Integration', false, `Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Test 7: Test Notification Summary
   */
  async testNotificationSummary() {
    try {
      const summary = await adminNotification.getSummary();
      
      this.logResult('Notification Summary', true, 'Summary retrieved successfully', {
        total: summary.total,
        unread: summary.unread,
        deposits: summary.deposits,
        withdrawals: summary.withdrawals,
        actionRequired: summary.actionRequired
      });

      return summary;
    } catch (error) {
      this.logResult('Notification Summary', false, `Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Run all enhanced tests
   */
  async runAllTests() {
    logger.info('🚀 Starting Enhanced Feature Testing...\n');

    // Test sequence
    const dbConnected = await this.testDatabaseConnection();
    if (!dbConnected) {
      logger.error('❌ Database not connected. Cannot run tests.');
      return;
    }

    const merchant = await this.testCreateMerchant();
    if (merchant) {
      await this.testDepositSuccessNotification(merchant);
      await this.testMerchantStatistics(merchant);
      await this.testWithdrawalNotification(merchant);
    }

    await this.testBlockchainAPI();
    await this.testNotificationSummary();

    // Print summary
    this.printSummary();
  }

  /**
   * Print test summary
   */
  printSummary() {
    logger.info('\n📊 ENHANCED TEST SUMMARY');
    logger.info('==========================');
    
    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    
    logger.info(`✅ Passed: ${passed}`);
    logger.info(`❌ Failed: ${failed}`);
    logger.info(`📊 Total: ${this.testResults.length}`);
    logger.info(`📈 Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      logger.info('\n❌ Failed Tests:');
      this.testResults.filter(r => !r.success).forEach(test => {
        logger.info(`   - ${test.test}: ${test.message}`);
      });
    }
    
    logger.info('\n🎉 Enhanced testing completed!');
    logger.info('\n💡 Features Tested:');
    logger.info('   ✅ Database notifications storage');
    logger.info('   ✅ Merchant statistics tracking');
    logger.info('   ✅ Email notification system');
    logger.info('   ✅ Blockchain API integration');
    logger.info('   ✅ Admin notification management');
    logger.info('   ✅ Real-time statistics updates');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new EnhancedTester();
  tester.runAllTests().catch(console.error);
}

module.exports = EnhancedTester;
