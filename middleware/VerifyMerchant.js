const User = require('../models/user');

exports.apiAuth = async (req, res, next) => {
  const apiKey = req.params.apiKey;
  const apiSecret = req.headers['x-api-secret'];

  if (!apiKey || !apiSecret) {
    return res.status(401).json({
      success: false,
      message: 'API key and secret required',
      error: 'Unauthorized access',
    });
  }
  try {
    const user = await User.findOne({ apiKey, apiSecret, role: 'merchant', approved: 'approved' });

    if (!user ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API credentials',
        error: 'Unauthorized access',
      });
    }

    req.merchant = user;
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: err.message,
    });
  }
};
