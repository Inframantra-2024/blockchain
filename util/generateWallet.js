const axios = require('axios');

exports.generateWallet = async () => {
  try {
    const response = await axios.post('https://api.blockcypher.com/v1/btc/test3/wallets?token=YOUR_BLOCKCYPHER_TOKEN', {
      name: `wallet-${Date.now()}`
    });

    return {
      address: response.data.addresses[0],
      walletName: response.data.name,
    };
  } catch (err) {
    throw new Error('Failed to generate wallet: ' + err.message);
  }
};