const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email address',
    ],
  },
  passwordHash: {
    type: String,
    required: true,
    select: false, // ❗ Prevent returning password hash by default
  },
  preferences: {
    darkMode: {
      type: Boolean,
      default: false,
    },
  },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
}, {
  timestamps: true, // createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Clean output JSON (remove sensitive/internal fields)
userSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.__v;
  delete obj.passwordHash;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
