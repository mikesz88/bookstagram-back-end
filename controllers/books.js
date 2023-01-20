const { PrismaClient } = require('@prisma/client');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { generateUploadURL, deleteObject } = require('../utils/s3');
const filteredResults = require('../middleware/prismaQueries');

const prisma = new PrismaClient();

// @desc Get all books
// @route GET /api/v2/books
// @access PUBLIC
exports.getBooks = asyncHandler(async (req, res, next) => {
  const test = await filteredResults('book', req);
  console.log(test);
  res.status(200).json({
    success: true,
    data: test,
  });
});
