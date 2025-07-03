const crypto = require('crypto');

exports.createWallet = async () => {
  // Simulate a wallet creation API call, returning wallet address & secret
  return {
    walletAddress: '0x' + crypto.randomBytes(20).toString('hex'),
    walletSecret: crypto.randomBytes(32).toString('hex'),
  };
};

exports.simulateBlockchainConfirmation = async (transaction) => {
  // Simulate delay for confirmation (10 seconds here)
  await new Promise(res => setTimeout(res, 10000));

  // Randomly succeed or fail (70% success chance)
  const isSuccess = Math.random() < 0.7;
  return isSuccess;
};

