const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  /* SECURITY !!!
   * This way no one can register as admin because only the properties below are created.
   */
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist.
  if (!email || !password) {
    return next(new AppError('Please provide both email and password!', 400));
  }

  // 2) Check if user exists and password is correct.
  // We need to explicit select the password, otherwise it will be not returned.
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything is OK, send token to the client.
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1) Get token and check if it's there.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verificate if token is correct.
  const jwtDecodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // console.log(jwtDecodedPayload);

  // 3) Check if user still exists.
  const currentUser = await User.findById(jwtDecodedPayload.id);

  if (!currentUser)
    return next(
      new AppError(
        'The user belonging to this token does not longer exist.',
        401
      )
    );

  // 4) Check if user changed password after the JWT was issued.
  if (currentUser.changedPasswordAfter(jwtDecodedPayload.iat))
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );

  // GRANT ACESS TO PROTECT ROUTE 🎉🎉🎉
  req.user = currentUser;
  next();
});
