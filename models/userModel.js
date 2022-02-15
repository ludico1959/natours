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

// Model variables are usually always with a capitl letter.
const User = mongoose.model('User', userSchema);

module.exports = User;
