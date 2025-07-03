const Withdrawal = require('../models/withdrawal');
const Fee = require('../models/FeeSetting');
const User = require('../models/user');

exports.initiateWithdrawal = async (req, res, next) => {
  try {
    const merchant = req.user;
    const { amount, feeId } = req.body;

    if (merchant.totalAmt < amount) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal amount exceeds wallet balance'
      });
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee not found' });
    }

    const feeAmount = fee.feeType === 'percentage'
      ? (amount * fee.value) / 100
      : fee.value;

    const finalAmount = amount - feeAmount;

    const withdrawal = new Withdrawal({
      merchant: merchant._id,
      fee: fee._id,
      amount,
      finalAmount
    });

    // Deduct amount from wallet
    merchant.totalAmt -= amount;
    await merchant.save();
    await withdrawal.save();

    res.status(201).json({ success: true, message: 'Withdrawal initiated', withdrawal });
  } catch (err) {
    next(err);
  }
};

// Unified approval/rejection controller
exports.handleWithdrawalStatus = async (req, res, next) => {
  try {
    const { withdrawalId } = req.params;
    const { action } = req.query; // action = 'approve' or 'reject'


    const withdrawal = await Withdrawal.findById(withdrawalId).populate('merchant');

    if (!withdrawal || withdrawal.status !== 'initiated') {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found or already processed'
      });
    }

    if (action === 'approve') {
      withdrawal.status = 'approved';
      await withdrawal.save();
      return res.status(200).json({
        success: true,
        message: 'Withdrawal approved',
        withdrawal
      });
    }

    if (action === 'reject') {
      withdrawal.status = 'rejected';
      await withdrawal.save();

      // Refund wallet
      withdrawal.merchant.totalAmt += withdrawal.amount;
      await withdrawal.merchant.save();

      return res.status(200).json({
        success: true,
        message: 'Withdrawal rejected and amount refunded',
        withdrawal
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllWithdrawals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const withdrawals = await Withdrawal.find(filter)
      .populate('merchant', 'name email') // Optional: Include merchant info
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Withdrawal.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: withdrawals,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET withdrawals for specific merchant with pagination
exports.getMerchantWithdrawals = async (req, res, next) => {
  try {
    const { merchantId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const merchantExists = await User.findOne({ _id: merchantId, role: 'merchant' });
    if (!merchantExists) {
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }

    const filter = { merchant: merchantId };
    if (status) {
      filter.status = status;
    }

    const withdrawals = await Withdrawal.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Withdrawal.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: withdrawals,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

