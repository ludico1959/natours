const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// REPEATED FUNCTIONS:
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// This function is ere because it was repeated at least 3 times in the code!
const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  /* The COOKIE OPTIONS in an Object assined to a variable:
   * The expires propertie is the current time plus 90 (JWT_COOKIE_EXPIRES_IN=90) days in miliseconds.
   * The httpOnly propertie means that the cookie can't be acessed or modified in any way by the browser.
   */
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // The secure propertie equals to 'true' means the cookie only will e sent on an encrypted connection (HTTPS).
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // Sending JWT via cookie ('jwt' is the cookie name).
  res.cookie('jwt', token, cookieOptions);

  // Remove the password from the output (response).
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// ENDPOINTS:
exports.signup = catchAsync(async (req, res, next) => {
  /* SECURITY !!!
   * This way no one can register as admin because only the properties below are created.
   */
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt,
  });

  createAndSendToken(newUser, 201, res);
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
  createAndSendToken(user, 200, res);
});

// MIDDLEWARE:
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

  // 2) MOST IMPORTANT: verificate if token is correct.
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

  // GRANT ACESS TO PROTECT ROUTE ????????????
  req.user = currentUser; // It's important to do this for the restricTo and updatePassword middlewares below.
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles is an array: ['admin', 'lead-guide'].
    console.log(req.body, roles, ...roles);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permition to perform this action.', 403)
      );
    }

    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email.
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }

  // 2) Generate the random token.
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email.
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passConfirm to:\n${resetURL}.\nIf you didn't, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token.
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired and there is an user, set new password.
  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3) Update changePasswordAt property for the user.

  // 4) Log the user in, send JWT.
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from the collection.
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct.
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // 3) If so, update password.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();
  /* User.findByIdAndUpdate() will not word here!
   * userSchema validate at passwordConfirm key and models's document middlewares just work with:
   * '.save' and '.create'
   */

  // 4) Log user in, send JWT.
  createAndSendToken(user, 200, res);
});
