const { PrismaClient } = require('@prisma/client');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const crypto = require('crypto');
const { getSignedJwt, saltValue } = require('../utils/authFunctions');

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

  const forgotPasswordAnswer = await saltValue(frgtPsswrdnswr);

  const addPassword = await prisma.password.create({
    data: {
      hash: await saltValue(password),
      userId,
    },
  });

  const addForgot = await prisma.forgotPassword.create({
    data: {
      forgotPasswordQuestion,
      forgotPasswordAnswer: await saltValue(frgtPsswrdnswr),
    },
  });

  sendTokenResponse(email, 200, res);
});

const sendTokenResponse = (email, statusCode, res) => {
  const token = getSignedJwt(email);

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
