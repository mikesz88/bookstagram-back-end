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
  const filter = await filteredResults(req);
  console.log(filter);
  console.log({ where: filter.where });
  const total = await prisma.book.count({ where: filter.where });
  const books = await prisma.book.findMany(filter);
  console.log(books);
  console.log(total);
  // * Create data to test total and filter
  // * Finish pagination and create response appropriately

  res.status(200).json({
    success: true,
    data: books,
  });
});
