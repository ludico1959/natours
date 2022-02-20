const User = require('../models/userModel');
// const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// ...allowedFields will be an array containing the other arguments!
const filterObject = (object, ...allowedFields) => {
  const newObject = {};

  Object.keys(object).forEach((element) => {
    if (allowedFields.includes(element)) newObject[element] = object[element];
  });

  return newObject;
};

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

// This updates eerything except the user's password that is done in the authController.
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create an error if user tries to update his password.
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates! Please use "/updateMyPassword".',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are now allowed to be updated.
  const filteredBody = filterObject(req.body, 'name', 'email');

  // 3) Update user document.
  const upadetedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: upadetedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // REMENBER: The user is logged in, so the variable 'user' has all the user information!
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
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
