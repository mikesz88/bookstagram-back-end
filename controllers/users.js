const { PrismaClient } = require('@prisma/client');
const ErrorResponse = require('../utils/errorResponse'); //custom error response
const asyncHandler = require('../middleware/async'); //DRY Handler of the try catch
const prismaQueries = require('../middleware/prismaQueries');

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
// @route Get /api/v1/users/:id
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
