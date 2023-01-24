const { PrismaClient } = require('@prisma/client');
const ErrorResponse = require('../utils/errorResponse'); //custom error response
const asyncHandler = require('../middleware/async'); //DRY Handler of the try catch
const prismaQueries = require('../middleware/prismaQueries');
const { saltValue } = require('../utils/authFunctions');

const prisma = new PrismaClient();

// @desc Get all users
// @route Get /api/v2/users
// @access PRIVATE/admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const response = await prismaQueries(req, 'user');

  res.status(200).json({
    success: true,
    ...response,
  });
});

// @desc Get single user
// @route Get /api/v2/users/:id
// @access PRIVATE/admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc create user
// @route POST /api/v2/auth/users
// @access PRIVATE/admin
exports.createUser = asyncHandler(async (req, res, next) => {
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

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc Update user
// @route PUT /api/v2/users/:id
// @access PRIVATE/admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    role: req.body.role,
  };

  let user = await prisma.user.findUnique({ where: { id: req.params.id } });

  if (!user) {
    return next(new ErrorResponse('Invalid User Id'), 401);
  }

  user = await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: fieldsToUpdate,
  });

  //This was changed from showing new data to token
  // because token is tied to jwt
  // fix react on this
  sendTokenResponse(user.id, 200, res);
});

// @desc Delete user
// @route PUT /api/v2/users/:id
// @access PRIVATE/admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  let user = await prisma.user.findUnique({ where: { id: req.params.id } });

  if (!user) {
    return next(new ErrorResponse('Invalid User Id'), 401);
  }

  user = await prisma.user.delete({ where: { id: req.params.id } });

  res.status(200).json({
    success: true,
    message: 'Your account has been officially deleted.',
  });
});
