const Fee = require('../models/FeeSetting');

// Create
exports.createFee = async (req, res, next) => {
  try {
    const { feeType, value } = req.body;
    const fee = await Fee.create({ feeType, value });

    res.status(201).json({
      success: true,
      message: 'Fee created successfully',
      data: fee,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// Read All (with Pagination)
exports.getFees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const skip = (page - 1) * limit;

    const [fees, total] = await Promise.all([
      Fee.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Fee.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: fees,
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// Get Single
exports.getFeeById = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found',
        error: 'Fee not found',
      });
    }

    res.status(200).json({
      success: true,
      data: fee,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// Update
exports.updateFee = async (req, res, next) => {
  try {
    const updatedFee = await Fee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedFee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found',
        error: 'Fee not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fee updated successfully',
      data: updatedFee,
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// Delete
exports.deleteFee = async (req, res, next) => {
  try {
    const deletedFee = await Fee.findByIdAndDelete(req.params.id);
    if (!deletedFee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found',
        error: 'Fee not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fee deleted successfully',
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
