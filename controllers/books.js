const { PrismaClient } = require('@prisma/client');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { generateUploadURL, deleteObject } = require('../utils/s3');

const prisma = new PrismaClient();

// @desc Get all books
// @route GET /api/v2/books
// @access PUBLIC
exports.getBooks = asyncHandler(async (req, res, next) => {
  const books = await prisma.book.findMany({});

  res.status(200).json(books);
});
