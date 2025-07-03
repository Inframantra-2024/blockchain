const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  tempPassword :{ type: String, required: true, minlength: 6 },
  approved: {
    type: String,
    enum: ['pending', 'approved', 'rejected','block'],
    default: 'pending',
  },
role: {
    type: String,
    enum: ['merchant', 'user', 'admin', 'superadmin'],
    default: 'user',
  },
  apiKey: { type: String },       // For merchant API auth
  apiSecret: { type: String },    // Store securely or hash
  walletAddress: { type: String }, // For fund releases
  walletSecret:{type:String},
  totalAmt:{type:Number,default:0},
  resetPasswordToken:{ type: String},
  resetPasswordExpires:{ type: Date},
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
