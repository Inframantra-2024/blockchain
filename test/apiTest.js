/**
 * Comprehensive API Testing Script
 * Tests all endpoints of the Crypto Payment Gateway
 */

const axios = require('axios');
const logger = require('../logger/logger');

class APITester {
  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';
    this.blockchainAPI = process.env.BLOCKCHAIN_API_URL || 'https://142.93.223.225:5000';
    this.adminToken = null;
    this.merchantToken = null;
    this.merchantApiKey = null;
    this.merchantApiSecret = null;
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
   * Test 1: Admin Login
   */
  async testAdminLogin() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: 'admin@cryptogateway.com',
        password: 'admin123'
      });

      if (response.data.success) {
        this.adminToken = response.data.token || 'extracted-from-cookie';
        this.logResult('Admin Login', true, 'Admin logged in successfully', {
          user: response.data.data?.user
        });
      } else {
        this.logResult('Admin Login', false, 'Login failed', response.data);
      }
    } catch (error) {
      this.logResult('Admin Login', false, `Error: ${error.message}`);
    }
  }

  /**
   * Test 2: Register Merchant
   */
  async testRegisterMerchant() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/register`, {
        name: 'Test Merchant',
        email: 'merchant@test.com',
        password: 'merchant123',
        confirmPassword: 'merchant123'
      }, {
        headers: {
          'Authorization': `Bearer ${this.adminToken}`,
          'Cookie': `token=${this.adminToken}`
        }
      });

      this.logResult('Register Merchant', response.data.success, 
        response.data.message, response.data.data);
    } catch (error) {
      this.logResult('Register Merchant', false, `Error: ${error.message}`);
    }
  }

  /**
   * Test 3: Merchant Login
   */
  async testMerchantLogin() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: 'merchant@test.com',
        password: 'merchant123'
      });

      if (response.data.success) {
        this.merchantToken = response.data.token || 'extracted-from-cookie';
        this.logResult('Merchant Login', true, 'Merchant logged in successfully', {
          user: response.data.data?.user
        });
      } else {
        this.logResult('Merchant Login', false, 'Login failed', response.data);
      }
    } catch (error) {
      this.logResult('Merchant Login', false, `Error: ${error.message}`);
    }
  }

  /**
   * Test 4: Approve Merchant
   */
  async testApproveMerchant() {
    try {
      // First get merchant ID (assuming we know it or can get it)
      const merchantId = 'test-merchant-id'; // This would be dynamic in real test
      
      const response = await axios.patch(`${this.baseURL}/admin/approve/${merchantId}`, {}, {
        headers: {
          'Authorization': `Bearer ${this.adminToken}`,
          'Cookie': `token=${this.adminToken}`
        }
      });

      if (response.data.success) {
        this.merchantApiKey = response.data.data?.apiKey;
        this.merchantApiSecret = response.data.data?.apiSecret;
      }

      this.logResult('Approve Merchant', response.data.success, 
        response.data.message, response.data.data);
    } catch (error) {
      this.logResult('Approve Merchant', false, `Error: ${error.message}`);
    }
  }

  /**
   * Test 5: Create Transaction
   */
  async testCreateTransaction() {
    try {
      const apiKey = this.merchantApiKey || 'mk_test_demo123';
      const response = await axios.get(`${this.baseURL}/transaction/${apiKey}/create`, {
        params: {
          amount: 500,
          currencyType: 'USDT-TRC20'
        },
        headers: {
          'x-api-secret': this.merchantApiSecret || 'demo-secret'
        }
      });

      this.logResult('Create Transaction', response.data.success, 
        response.data.message, response.data.data);
      
      return response.data.data?.transactionId;
    } catch (error) {
      this.logResult('Create Transaction', false, `Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Test 6: Confirm Deposit
   */
  async testConfirmDeposit(transactionId) {
    try {
      const apiKey = this.merchantApiKey || 'mk_test_demo123';
      const response = await axios.post(`${this.baseURL}/transaction/${apiKey}/deposite`, {
        walletAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE'
      }, {
        headers: {
          'x-api-secret': this.merchantApiSecret || 'demo-secret'
        }
      });

      this.logResult('Confirm Deposit', response.data.success, 
        response.data.message, response.data.data);
    } catch (error) {
      this.logResult('Confirm Deposit', false, `Error: ${error.message}`);
    }
  }

  /**
   * Test 7: Check Transaction Status
   */
  async testCheckTransactionStatus(transactionId) {
    try {
      const apiKey = this.merchantApiKey || 'mk_test_demo123';
      const response = await axios.get(`${this.baseURL}/transaction/${apiKey}/status/${transactionId}`, {
        headers: {
          'x-api-secret': this.merchantApiSecret || 'demo-secret'
        }
      });

      this.logResult('Check Transaction Status', response.data.success, 
        response.data.message, response.data.data);
    } catch (error) {
      this.logResult('Check Transaction Status', false, `Error: ${error.message}`);
    }
  }

  /**
   * Test 8: Create Fee Setting
   */
  async testCreateFee() {
    try {
      const response = await axios.post(`${this.baseURL}/fee`, {
        feeType: 'percentage',
        value: 5
      }, {
        headers: {
          'Authorization': `Bearer ${this.adminToken}`,
          'Cookie': `token=${this.adminToken}`
        }
      });

      this.logResult('Create Fee', response.data.success, 
        response.data.message, response.data.data);
      
      return response.data.data?._id;
    } catch (error) {
      this.logResult('Create Fee', false, `Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Test 9: Request Withdrawal
   */
  async testRequestWithdrawal(feeId) {
    try {
      const response = await axios.post(`${this.baseURL}/withdrawal`, {
        amount: 1000,
        feeId: feeId || 'demo-fee-id'
      }, {
        headers: {
          'Authorization': `Bearer ${this.merchantToken}`,
          'Cookie': `token=${this.merchantToken}`
        }
      });

      this.logResult('Request Withdrawal', response.data.success, 
        response.data.message, response.data.data);
      
      return response.data.data?.withdrawal?._id;
    } catch (error) {
      this.logResult('Request Withdrawal', false, `Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Test 10: Test Third-party Blockchain API
   */
  async testBlockchainAPI() {
    try {
      logger.info(`🌐 Testing third-party blockchain API: ${this.blockchainAPI}`);
      
      // Test API health
      const healthResponse = await axios.get(`${this.blockchainAPI}/health`, {
        timeout: 10000
      });

      this.logResult('Blockchain API Health', true, 
        'Third-party API is accessible', healthResponse.data);

      // Test wallet generation endpoint
      try {
        const walletResponse = await axios.post(`${this.blockchainAPI}/api/wallet/generate`, {
          currencyType: 'USDT-TRC20'
        }, {
          headers: {
            'Authorization': 'Bearer demo-api-key',
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });

        this.logResult('Blockchain API Wallet Generation', true, 
          'Wallet generation API works', walletResponse.data);
      } catch (walletError) {
        this.logResult('Blockchain API Wallet Generation', false, 
          `Wallet API error: ${walletError.message}`);
      }

    } catch (error) {
      this.logResult('Blockchain API Health', false, 
        `Third-party API not accessible: ${error.message}`);
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    logger.info('🚀 Starting comprehensive API testing...\n');

    // Test sequence
    await this.testAdminLogin();
    await this.testRegisterMerchant();
    await this.testMerchantLogin();
    await this.testApproveMerchant();
    
    const transactionId = await this.testCreateTransaction();
    if (transactionId) {
      await this.testConfirmDeposit(transactionId);
      await this.testCheckTransactionStatus(transactionId);
    }
    
    const feeId = await this.testCreateFee();
    if (feeId) {
      await this.testRequestWithdrawal(feeId);
    }
    
    await this.testBlockchainAPI();

    // Print summary
    this.printSummary();
  }

  /**
   * Print test summary
   */
  printSummary() {
    logger.info('\n📊 TEST SUMMARY');
    logger.info('================');
    
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
    
    logger.info('\n🎉 Testing completed!');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests().catch(console.error);
}

module.exports = APITester;
