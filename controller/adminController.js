const User = require('../models/user.js');
const logger = require('../logger/logger.js');

const { generateCredentials } = require('../util/generateApiKeySecret.js'); // adjust path if needed
// const { generateWallet } = require('../utils/blockcypherWallet');
const { generateMerchantApprovalEmail } = require('../util/generateMerchantApprovalEmail.js')

exports.approveMerchant = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user || user.role !== 'merchant') {
        return res.status(404).json({
            success: false,
            message: 'Merchant not found',
            error: 'Invalid merchant user ID',
        });
        }

        // If already approved
        if (user.approved === 'approved') {
        return res.status(400).json({
            success: false,
            message: 'Merchant already approved',
            error: 'Already approved',
        });
        }

        // Generate and save credentials
        const { apiKey, apiSecret } = generateCredentials();
        // const tempPassword = Math.random().toString(36).slice(-8);

        user.approved = 'approved';
        user.apiKey = apiKey;
        user.apiSecret = apiSecret;
        user.tempPassword = tempPassword; // Save for email only (not hashed)
        await user.save();

        // Prepare and send email
        const html = generateMerchantApprovalEmail({
        name: user.name,
        email: user.email,
        password: tempPassword,
        apiKey,
        apiSecret,
        walletAddress: user.walletAddress || 'N/A',
        });

        await sendEmail({
        to: user.email,
        subject: 'Your Merchant Account Has Been Approved',
        html,
        });

        logger.info(`Merchant approved and email sent to: ${user.email}`);

        res.status(200).json({
        success: true,
        message: 'Merchant approved and credentials sent via email',
        error: null,
        });
    } catch (err) {
        logger.error(`Merchant approval failed: ${err.message}`);
        next(err);
    }
    };

exports.blockMerchant = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user || user.role !== 'merchant') {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found',
        error: 'Invalid merchant user ID',
      });
    }

    // If already rejected
    if (user.approved === 'block') {
      return res.status(400).json({
        success: false,
        message: 'Merchant already blocked',
        error: 'Already blocked',
      });
    }

    // If already approved, maybe prevent rejection or allow? Here we allow rejection.
    user.approved = 'block';
    await user.save();

    // Optional: Send email notification about rejection
    const html = `<p>Dear ${user.name},</p>
      <p>Your merchant application has been blocked. Please contact support for more information.</p>`;

    await sendEmail({
      to: user.email,
      subject: 'Merchant Application blocked',
      html,
    });

    logger.info(`Merchant blocked and notification sent to: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Merchant blocked and notification sent via email',
      error: null,
    });
  } catch (err) {
    logger.error(`Merchant rejection failed: ${err.message}`);
    next(err);
  }
};
