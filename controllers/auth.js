const { PrismaClient } = require('@prisma/client');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const crypto = require('crypto');
const {
  getSignedJwt,
  saltValue,
  matchSaltedValue,
  getResetPasswordToken,
} = require('../utils/authFunctions');

const prisma = new PrismaClient();

// @desc Register user
// @route POST /api/v2/auth/register
// @access PUBLIC
exports.register = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    forgotPasswordQuestion,
    forgotPasswordAnswer: frgtPsswrdnswr,
    password,
    role,
  } = req.body;

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      role,
    },
  });

  await prisma.password.create({
    data: {
      hash: await saltValue(password),
      userId: user.id,
    },
  });

  await prisma.forgotPassword.create({
    data: {
      forgotPasswordQuestion,
      forgotPasswordAnswer: await saltValue(frgtPsswrdnswr),
      userId: user.id,
    },
  });

  sendTokenResponse(user.id, 201, res);
});

// @desc Login user
// @route POST /api/v2/auth/login
// @access PUBLIC
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password'));
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    return next(new ErrorResponse('Invalid credentials'), 401);
  }

  const userPassword = await prisma.password.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      hash: true,
    },
  });

  const isMatch = await matchSaltedValue(password, userPassword.hash);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user.id, 200, res);
});

// @desc Logout user
// @route GET /api/v2/auth/logout
// @access PUBLIC
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 0.1 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'You have successfully logged out.',
  });
});

// @desc Get Logged In user
// @route GET /api/v2/auth/me
// @access PRIVATE
exports.getLoggedInUser = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      forgotPassword: true,
    },
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Get User Name
// @route GET /api/v2/auth/findusername/:id
// @access PRIVATE
exports.findUserName = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });

  if (!user) {
    return next(new ErrorResponse('Invalid User Id'), 401);
  }

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
  const user = await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: fieldsToUpdate,
  });

  //This was changed from showing new data to token
  // because token is tied to jwt
  // fix react on this
  sendTokenResponse(user.id, 200, res);
});

// @desc Update User password
// @route POST /api/v2/auth/updatepassword
// @access PRIVATE
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  const userPassword = await prisma.password.findUnique({
    where: { userId: req.user.id },
  });

  const isMatched = await matchSaltedValue(
    req.body.currentPassword,
    userPassword.hash
  );

  if (!isMatched) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  await prisma.password.update({
    where: {
      userId: req.user.id,
    },
    data: {
      hash: await saltValue(req.body.newPassword),
    },
  });

  sendTokenResponse(user.id, 200, res);
});

// @desc Update Forgot Question & Answer
// @route PUT /api/v2/auth/updateforgot
// @access PRIVATE
exports.updateForgotQuestionAnswer = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  const forgotPassword = await prisma.forgotPassword.findUnique({
    where: { userId: req.user.id },
  });

  const isMatched = await matchSaltedValue(
    req.body.currentForgotAnswer,
    forgotPassword.forgotPasswordAnswer
  );

  if (!isMatched) {
    return next(
      new ErrorResponse('Forgot Question Password is incorrect', 401)
    );
  }

  await prisma.forgotPassword.update({
    where: {
      userId: req.user.id,
    },
    data: {
      forgotPasswordQuestion: req.body.newForgotPasswordQuestion,
      forgotPasswordAnswer: await saltValue(req.body.newForgotPasswordAnswer),
    },
  });

  sendTokenResponse(user.id, 200, res);
});

// @desc Forgot Question
// @route PUT /api/v2/auth/forgotquestion
// @access PUBLIC
exports.forgetQuestion = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
  });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 401));
  }

  const forgotQuestion = await prisma.forgotPassword.findUnique({
    where: { userId: user.id },
  });

  res.status(200).json({
    success: true,
    data: forgotQuestion.forgotPasswordQuestion,
  });
});

// @desc Forgot Password
// @route POST /api/v2/auth/forgotpassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
  });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 401));
  }

  const forgotQuestion = await prisma.forgotPassword.findUnique({
    where: { userId: user.id },
  });

  const isMatch = await matchSaltedValue(
    req.body.forgotPasswordAnswer,
    forgotQuestion.forgotPasswordAnswer
  );

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  const { resetPasswordToken, resetToken } = getResetPasswordToken();

  await prisma.resetPassword.create({
    data: {
      resetPasswordToken,
      userId: user.id,
    },
  });

  res.status(200).json({
    success: true,
    data: resetToken,
  });
});

// @desc reset password
// @route PUT /api/v2/auth/resetpassword/:resettoken
// @access PUBLIC
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const resetUser = await prisma.resetPassword.findUnique({
    where: { resetPasswordToken },
  });
  const actualResetDate =
    new Date(resetUser.resetPasswordExpired).getTime() + 10 * 60 * 1000;
  const isBeforeTimeLimit = actualResetDate > Date.now();

  if (!isBeforeTimeLimit) {
    return next(new ErrorResponse('Invalid or Expired token.', 400));
  }

  const user = await prisma.user.findUnique({
    where: { id: resetUser.userId },
  });

  await prisma.password.update({
    where: { userId: resetUser.userId },
    data: {
      hash: await saltValue(req.body.password),
    },
  });

  await prisma.resetPassword.delete({ where: { resetPasswordToken } });

  sendTokenResponse(user.id, 200, res);
});

// @desc Delete my own account
// @route PUT /api/v2/auth/deleteself
// @access PRIVATE
exports.deleteSelf = asyncHandler(async (req, res, next) => {
  await prisma.user.delete({ where: { id: req.user.id } });

  res.status(200).json({
    success: true,
    message: 'Your account has been officially deleted.',
  });
});

const sendTokenResponse = (id, statusCode, res) => {
  const token = getSignedJwt(id);

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
