const User = require('../models/userModel');
// const APIFeatures = require('../utils/apiFeatures');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// ROUTES HANDLERS
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE:
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users: users,
    },
  });
});

exports.createUser = (req, res) =>
  res.status(500).json({
    status: 'error',
    message: 'This route is not already defined 🧶',
  });

exports.getUser = (req, res) =>
  res.status(500).json({
    status: 'error',
    message: 'This route is not already defined 🧶',
  });

exports.updateUser = (req, res) =>
  res.status(500).json({
    status: 'error',
    message: 'This route is not already defined 🧶',
  });

exports.deleteUser = (req, res) =>
  res.status(500).json({
    status: 'error',
    message: 'This route is not already defined 🧶',
  });
