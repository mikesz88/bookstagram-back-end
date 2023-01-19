const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const crypto = require('crypto');

// @desc Register user
// @route POST /api/v1/auth/register
// @access PUBLIC
exports.register = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    forgotPasswordQuestion,
    forgotPasswordAnswer,
    password,
    role,
  } = req.body;

  const user = await User.create({
    firstName,
    lastName,
    email,
    forgotPasswordQuestion,
    forgotPasswordAnswer,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

// @desc Login user
// @route POST /api/v1/auth/login
// @access PUBLIC
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // check for email and password in request
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password'));
  }

  // finding the user with requested email and bring password with
  const user = await User.findOne({ email }).select('+password');

  // if there is no user with matched email/password
  if (!user) {
    return next(new ErrorResponse('Invalid credentials'), 401);
  }

  // compare password with user password in account
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc Logout user
// @route GET /api/v1/auth/logout
// @access PUBLIC
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 0.1 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc Get Logged In user
// @route GET /api/v1/auth/me
// @access PRIVATE
exports.getLoggedInUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Get User Name
// @route GET /api/v1/auth/findusername/:id
// @access PRIVATE
exports.findUserName = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
});

// @desc Update User details
// @route PUT /api/v1/auth/updatedetails
// @access PRIVATE
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Update User password
// @route PUT /api/v1/auth/updatepassword
// @access PRIVATE
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc Update Forgot Question & Answer
// @route PUT /api/v1/auth/updateforgot
// @access PRIVATE
exports.updateForgotQuestionAnswer = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+forgotPasswordAnswer');

  if (!(await user.matchForgotAnswer(req.body.currentForgotAnswer))) {
    return next(new ErrorResponse('Your answer is incorrect', 401));
  }

  user.forgotPasswordQuestion = req.body.newForgotPasswordQuestion;
  user.forgotPasswordAnswer = req.body.newForgotPasswordAnswer;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc Forgot Question
// @route PUT /api/v1/auth/forgotquestion
// @access PUBLIC
exports.forgetQuestion = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 401));
  }

  res.status(200).json({
    success: true,
    data: user.forgotPasswordQuestion,
  });
});

// @desc Forgot Password
// @route POST /api/v1/auth/forgotpassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    '+forgotPasswordAnswer'
  );

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // compare forgotten Password Answer with user Forgotten Answer in account
  const isMatch = await user.matchForgotAnswer(req.body.forgotPasswordAnswer);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: resetToken,
  });
});

// @desc reset password
// @route PUT /api/v1/auth/resetpassword/:resettoken
// @access PUBLIC
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordTokenExpired: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpired = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc Delete my own account
// @route PUT /api/v1/auth/deleteaccount/:id
// @access PRIVATE
exports.deleteSelf = asyncHandler(async (request, response, next) => {
  const user = await User.findByIdAndDelete(request.params.id);

  if (!user) {
    return next(new ErrorResponse('Unable to find User'), 401);
  }

  response.status(200).json({
    success: true,
    data: {},
  });
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwt();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if ((process.env.NODE_ENV = 'production')) {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });
};
