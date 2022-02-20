const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please, tell us your name!'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please, tell us your email!'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please, provide a password!'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please, confirm your password!'],
    validate: {
      // This only work on .create or .save, not .findOneAndUpdate, for example:
      validator: function (element) {
        return element === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// DOCUMENT MIDDLEWARE:
userSchema.pre('save', async function (next) {
  // Only run this function if the password is modified.
  if (!this.isModified('password')) return next();

  // The cost of 12 indicates how much CPU process intensity will be uded to encrypt the password.
  const hash = await bcrypt.hash(this.password, 12);
  this.password = hash;

  // Delete the passwordConfirm field because it is used just for an user confirmation.
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  // "-1000" is here because sometimes the token is created a bit before the change password timestamp.
  // This is a small hack is not accurate, but it ensure that the token is always created after.
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

// QUERY MIDDLEWARE:
userSchema.pre(/^find/, function (next) {
  // this points to current query!
  this.find({ active: { $ne: false } });
  next();
});

// INSTANCE METHODS: function available in all user documents!
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // Return true or false in the authController:
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangeAt) {
    const passwordChangeAtInSeconds = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );

    return JWTTimeStamp < passwordChangeAtInSeconds;
  }

  // False means that the password was not changed.
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  // The token expires in 10 minutes! So you have 10 min to use it to reset your password.
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Model variables are usually always with a capitl letter.
const User = mongoose.model('User', userSchema);

module.exports = User;
