// models/Fee.js
const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  feeType: {
    type: String,
    enum: ['percentage', 'flat'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Fee', feeSchema);
