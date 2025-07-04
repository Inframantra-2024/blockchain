/**
 * Enhanced Demo Script to Test Blockchain Service with Third-Party API
 * This script demonstrates how the blockchain service works with real API integration
 */

const blockchainService = require('../services/blockchainService');
const transactionMonitor = require('../services/transactionMonitor');
const logger = require('../logger/logger');
const axios = require('axios');

async function runDemo() {
  console.log('\n🚀 Starting Enhanced Blockchain Service Demo\n');
  console.log('🔗 Third-party API: https://142.93.223.225:5000\n');
  
  // Test 0: Check third-party API connectivity
  console.log('📝 Test 0: Check Third-Party API Connectivity');
  try {
    const apiResponse = await axios.get('https://142.93.223.225:5000/health', { timeout: 10000 });
    console.log('✅ Third-party API is accessible');
    console.log(`   Status: ${apiResponse.status}`);
    console.log(`   Response: ${JSON.stringify(apiResponse.data)}\n`);
  } catch (error) {
    console.log('⚠️ Third-party API not accessible, using fallback');
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 1: Generate TRON wallet (with API)
  console.log('📝 Test 1: Generate TRON Wallet (with Third-Party API)');
  const tronWallet = await blockchainService.generateWallet('USDT-TRC20');
  console.log('✅ TRON Wallet Generated:');
  console.log(`   Address: ${tronWallet.address}`);
  console.log(`   Network: ${tronWallet.network}`);
  console.log(`   Currency: ${tronWallet.currencyType}`);
  console.log(`   Source: ${tronWallet.source}\n`);

  // Test 2: Generate Ethereum wallet (with API)
  console.log('📝 Test 2: Generate Ethereum Wallet (with Third-Party API)');
  const ethWallet = await blockchainService.generateWallet('USDT-ERC20');
  console.log('✅ Ethereum Wallet Generated:');
  console.log(`   Address: ${ethWallet.address}`);
  console.log(`   Network: ${ethWallet.network}`);
  console.log(`   Currency: ${ethWallet.currencyType}`);
  console.log(`   Source: ${ethWallet.source}\n`);

  // Test 3: Validate wallet addresses
  console.log('📝 Test 3: Validate Wallet Addresses');
  console.log(`TRON Address Valid: ${blockchainService.validateWalletAddress(tronWallet.address, 'USDT-TRC20')}`);
  console.log(`ETH Address Valid: ${blockchainService.validateWalletAddress(ethWallet.address, 'USDT-ERC20')}`);
  console.log(`Invalid Address: ${blockchainService.validateWalletAddress('invalid123', 'USDT-TRC20')}\n`);

  // Test 4: Check wallet balances
  console.log('📝 Test 4: Check Wallet Balances');
  const tronBalance = blockchainService.getWalletBalance(tronWallet.address, 'USDT-TRC20');
  const ethBalance = blockchainService.getWalletBalance(ethWallet.address, 'USDT-ERC20');
  console.log(`TRON Wallet Balance: ${tronBalance} USDT`);
  console.log(`ETH Wallet Balance: ${ethBalance} USDT\n`);

  // Test 5: Check Super Admin wallets
  console.log('📝 Test 5: Super Admin Wallets');
  const superAdminTron = blockchainService.getSuperAdminWallet('USDT-TRC20');
  const superAdminEth = blockchainService.getSuperAdminWallet('USDT-ERC20');
  console.log(`Super Admin TRON: ${superAdminTron}`);
  console.log(`Super Admin ETH: ${superAdminEth}`);
  
  const superAdminTronBalance = blockchainService.getWalletBalance(superAdminTron, 'USDT-TRC20');
  const superAdminEthBalance = blockchainService.getWalletBalance(superAdminEth, 'USDT-ERC20');
  console.log(`Super Admin TRON Balance: ${superAdminTronBalance} USDT`);
  console.log(`Super Admin ETH Balance: ${superAdminEthBalance} USDT\n`);

  // Test 6: Simulate transaction monitoring with API
  console.log('📝 Test 6: Simulate Transaction Monitoring (with Third-Party API)');
  const mockTransaction = {
    transactionId: 'txn_demo_' + Date.now(),
    amount: 500,
    currencyType: 'USDT-TRC20',
    walletAddress: tronWallet.address,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  };

  console.log('⏳ Starting enhanced transaction monitoring...');
  console.log(`   Transaction ID: ${mockTransaction.transactionId}`);
  console.log(`   Amount: ${mockTransaction.amount} ${mockTransaction.currencyType}`);
  console.log(`   Wallet: ${mockTransaction.walletAddress}`);

  const isConfirmed = await blockchainService.monitorTransaction(mockTransaction);
  console.log(`\n🎯 Final Result: ${isConfirmed ? '✅ PAYMENT CONFIRMED' : '❌ PAYMENT FAILED'}\n`);

  // Test 7: Simulate fund transfer
  console.log('📝 Test 7: Simulate Fund Transfer');
  const mockWithdrawal = {
    netAmount: 450,
    merchantWallet: tronWallet.address,
    currencyType: 'USDT-TRC20'
  };

  const transferResult = blockchainService.transferFunds(mockWithdrawal);
  console.log('✅ Transfer Result:');
  console.log(`   Success: ${transferResult.success}`);
  console.log(`   Transaction Hash: ${transferResult.txHash}`);
  console.log(`   Amount: ${transferResult.amount} USDT`);
  console.log(`   Fee: ${transferResult.fee} USDT`);
  console.log(`   From: ${transferResult.from}`);
  console.log(`   To: ${transferResult.to}\n`);

  // Test 8: Network information
  console.log('📝 Test 8: Network Information');
  const tronNetwork = blockchainService.getNetworkInfo('USDT-TRC20');
  const ethNetwork = blockchainService.getNetworkInfo('USDT-ERC20');
  console.log('TRON Network:');
  console.log(`   Name: ${tronNetwork.name}`);
  console.log(`   Symbol: ${tronNetwork.symbol}`);
  console.log(`   Confirmations: ${tronNetwork.confirmations}`);
  console.log(`   Block Time: ${tronNetwork.blockTime} seconds`);
  console.log('Ethereum Network:');
  console.log(`   Name: ${ethNetwork.name}`);
  console.log(`   Symbol: ${ethNetwork.symbol}`);
  console.log(`   Confirmations: ${ethNetwork.confirmations}`);
  console.log(`   Block Time: ${ethNetwork.blockTime} seconds\n`);

  // Test 9: Transaction expiry check
  console.log('📝 Test 9: Transaction Expiry Check');
  const futureDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  const pastDate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
  console.log(`Future transaction expired: ${blockchainService.isTransactionExpired(futureDate)}`);
  console.log(`Past transaction expired: ${blockchainService.isTransactionExpired(pastDate)}\n`);

  // Test 10: Generate transaction hash
  console.log('📝 Test 10: Generate Transaction Hash');
  const txHash1 = blockchainService.generateTransactionHash();
  const txHash2 = blockchainService.generateTransactionHash();
  console.log(`Transaction Hash 1: ${txHash1}`);
  console.log(`Transaction Hash 2: ${txHash2}\n`);

  // Test 11: Test Transaction Monitor Service
  console.log('📝 Test 11: Transaction Monitor Service');
  console.log('📊 Active Transactions:', transactionMonitor.getActiveCount());
  console.log('📋 Active Transaction IDs:', transactionMonitor.getActiveTransactions());

  // Simulate starting monitoring
  console.log('\n⏰ Testing transaction monitor...');
  await transactionMonitor.startMonitoring(mockTransaction);

  console.log('📊 After starting monitoring:');
  console.log('   Active Count:', transactionMonitor.getActiveCount());
  console.log('   Monitoring Status:', transactionMonitor.getMonitoringStatus(mockTransaction.transactionId));

  // Stop monitoring
  transactionMonitor.stopMonitoring(mockTransaction.transactionId);
  console.log('🛑 Monitoring stopped\n');

  console.log('🎉 Enhanced Demo completed successfully!');
  console.log('\n💡 Key Features Demonstrated:');
  console.log('   ✅ Third-party API connectivity testing');
  console.log('   ✅ Enhanced wallet generation with API fallback');
  console.log('   ✅ Address validation');
  console.log('   ✅ Balance checking');
  console.log('   ✅ Advanced transaction monitoring with API integration');
  console.log('   ✅ Fund transfer simulation');
  console.log('   ✅ Network information');
  console.log('   ✅ Transaction monitor service testing');
  console.log('   ✅ Transaction utilities');
  console.log('\n🌐 Integration with third-party blockchain API: https://142.93.223.225:5000');
  console.log('🔧 Fallback mechanisms for offline testing!');
}

// Run the demo
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo };
