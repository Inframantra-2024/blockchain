const User = require('../models/user');
const Transaction = require('../models/depositeAmt');

// Get all approved merchants with pagination
exports.getAllMerchants = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = 'approved' } = req.query;

    const query = {
      role: 'merchant',
      approved: status,
    };

    const merchants = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-password -apiSecret -resetPasswordToken -resetPasswordExpires');

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: merchants,
    });
  } catch (err) {
    next(err);
  }
};

// Get specific merchant by ID
exports.getMerchantById = async (req, res, next) => {
  try {
    const merchant = await User.findById(req.params.merchantId).select('-password -apiSecret');

    if (!merchant || merchant.role !== 'merchant') {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found',
      });
    }

    res.status(200).json({
      success: true,
      data: merchant,
    });
  } catch (err) {
    next(err);
  }
};

// Get merchant transactions by merchant ID with pagination
exports.getMerchantTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { merchantId } = req.params;

    const merchant = await User.findById(merchantId);
    if (!merchant || merchant.role !== 'merchant') {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found',
      });
    }

    const transactions = await Transaction.find({ merchantId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Transaction.countDocuments({ merchantId });

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
};
