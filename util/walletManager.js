const blockchainService = require('../services/blockchainService');
const User = require('../models/user');
const logger = require('../logger/logger');

/**
 * Simple Wallet Management Utility
 * Handles wallet operations for merchants and Super Admin
 */
class WalletManager {
  
  /**
   * Generate wallet for a new merchant
   * @param {Object} merchant - Merchant user object
   * @param {string} currencyType - USDT-TRC20 or USDT-ERC20
   * @returns {Object} Wallet details
   */
  async generateMerchantWallet(merchant, currencyType = 'USDT-TRC20') {
    try {
      logger.info(`🏦 Generating ${currencyType} wallet for merchant: ${merchant.email}`);
      
      // Generate new wallet
      const walletData = blockchainService.generateWallet(currencyType);
      
      // Update merchant with wallet info
      merchant.walletAddress = walletData.address;
      merchant.walletSecret = walletData.privateKey;
      await merchant.save();
      
      logger.info(`✅ Wallet generated for ${merchant.email}: ${walletData.address}`);
      
      return {
        address: walletData.address,
        currencyType: walletData.currencyType,
        network: walletData.network,
        merchantId: merchant._id,
        merchantEmail: merchant.email
      };
    } catch (error) {
      logger.error(`💥 Failed to generate wallet for ${merchant.email}:`, error.message);
      throw new Error('Failed to generate merchant wallet');
    }
  }

  /**
   * Get Super Admin wallet for currency type
   * @param {string} currencyType - USDT-TRC20 or USDT-ERC20
   * @returns {Object} Super Admin wallet info
   */
  getSuperAdminWallet(currencyType) {
    const address = blockchainService.getSuperAdminWallet(currencyType);
    const balance = blockchainService.getWalletBalance(address, currencyType);
    
    return {
      address: address,
      balance: balance,
      currencyType: currencyType,
      network: currencyType === 'USDT-TRC20' ? 'TRON' : 'ETHEREUM',
      role: 'Super Admin'
    };
  }

  /**
   * Get merchant wallet balance
   * @param {string} merchantId - Merchant ID
   * @returns {Object} Wallet balance info
   */
  async getMerchantWalletInfo(merchantId) {
    try {
      const merchant = await User.findById(merchantId).select('name email walletAddress totalAmt');
      
      if (!merchant) {
        throw new Error('Merchant not found');
      }

      if (!merchant.walletAddress) {
        return {
          merchantId: merchantId,
          merchantName: merchant.name,
          merchantEmail: merchant.email,
          hasWallet: false,
          message: 'No wallet generated yet'
        };
      }

      // Get blockchain balance (simulated)
      const blockchainBalance = blockchainService.getWalletBalance(merchant.walletAddress);
      
      return {
        merchantId: merchantId,
        merchantName: merchant.name,
        merchantEmail: merchant.email,
        walletAddress: merchant.walletAddress,
        platformBalance: merchant.totalAmt || 0, // Balance in our platform
        blockchainBalance: blockchainBalance, // Balance on blockchain
        hasWallet: true
      };
    } catch (error) {
      logger.error(`💥 Failed to get wallet info for merchant ${merchantId}:`, error.message);
      throw new Error('Failed to get merchant wallet info');
    }
  }

  /**
   * Validate wallet address
   * @param {string} address - Wallet address
   * @param {string} currencyType - Currency type
   * @returns {Object} Validation result
   */
  validateWalletAddress(address, currencyType) {
    const isValid = blockchainService.validateWalletAddress(address, currencyType);
    
    return {
      address: address,
      currencyType: currencyType,
      isValid: isValid,
      network: currencyType === 'USDT-TRC20' ? 'TRON' : 'ETHEREUM',
      message: isValid ? 'Valid wallet address' : 'Invalid wallet address format'
    };
  }

  /**
   * Get all Super Admin wallets
   * @returns {Array} List of Super Admin wallets
   */
  getAllSuperAdminWallets() {
    const currencies = ['USDT-TRC20', 'USDT-ERC20'];
    
    return currencies.map(currency => this.getSuperAdminWallet(currency));
  }

  /**
   * Get wallet statistics
   * @returns {Object} Wallet statistics
   */
  async getWalletStatistics() {
    try {
      // Get all merchants with wallets
      const merchantsWithWallets = await User.countDocuments({
        role: 'merchant',
        walletAddress: { $exists: true, $ne: null }
      });

      const totalMerchants = await User.countDocuments({ role: 'merchant' });
      
      // Get Super Admin wallet balances
      const superAdminWallets = this.getAllSuperAdminWallets();
      const totalSuperAdminBalance = superAdminWallets.reduce((sum, wallet) => sum + wallet.balance, 0);

      // Get total platform balance
      const totalPlatformBalance = await User.aggregate([
        { $match: { role: 'merchant' } },
        { $group: { _id: null, total: { $sum: '$totalAmt' } } }
      ]);

      return {
        totalMerchants: totalMerchants,
        merchantsWithWallets: merchantsWithWallets,
        merchantsWithoutWallets: totalMerchants - merchantsWithWallets,
        superAdminWallets: superAdminWallets,
        totalSuperAdminBalance: totalSuperAdminBalance,
        totalPlatformBalance: totalPlatformBalance[0]?.total || 0,
        currencies: ['USDT-TRC20', 'USDT-ERC20']
      };
    } catch (error) {
      logger.error('💥 Failed to get wallet statistics:', error.message);
      throw new Error('Failed to get wallet statistics');
    }
  }

  /**
   * Generate transaction wallet (for deposits)
   * @param {string} currencyType - Currency type
   * @returns {Object} Transaction wallet
   */
  generateTransactionWallet(currencyType) {
    const walletData = blockchainService.generateWallet(currencyType);
    
    logger.info(`🔄 Generated transaction wallet: ${walletData.address} for ${currencyType}`);
    
    return {
      address: walletData.address,
      privateKey: walletData.privateKey,
      currencyType: walletData.currencyType,
      network: walletData.network,
      purpose: 'transaction',
      createdAt: new Date()
    };
  }

  /**
   * Simulate fund transfer between wallets
   * @param {Object} transferData - Transfer details
   * @returns {Object} Transfer result
   */
  simulateTransfer(transferData) {
    const { fromWallet, toWallet, amount, currencyType } = transferData;
    
    logger.info(`💸 Simulating transfer: ${amount} ${currencyType}`);
    logger.info(`   From: ${fromWallet}`);
    logger.info(`   To: ${toWallet}`);
    
    const result = blockchainService.transferFunds({
      netAmount: amount,
      merchantWallet: toWallet,
      currencyType: currencyType
    });
    
    return {
      ...result,
      fromWallet: fromWallet,
      toWallet: toWallet,
      originalAmount: amount
    };
  }
}

// Create singleton instance
const walletManager = new WalletManager();

module.exports = walletManager;
