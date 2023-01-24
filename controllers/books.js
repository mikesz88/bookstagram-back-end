const { PrismaClient } = require('@prisma/client');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { generateUploadURL, deleteObject } = require('../utils/s3');
const prismaQueries = require('../middleware/prismaQueries');
const slugify = require('slugify');

const prisma = new PrismaClient();

// @desc Get all books
// @route GET /api/v2/books
// @access PUBLIC
exports.getBooks = asyncHandler(async (req, res, next) => {
  const response = await prismaQueries(req, 'book');

  res.status(200).json({
    success: true,
    ...response,
  });
});

// @desc Create new s3Url Link
// @route GET /api/v2/books/get/s3url
// @access PRIVATE
exports.createS3Url = asyncHandler(async (req, res, next) => {
  const [imageName, url] = await generateUploadURL();

  if (!url) {
    return next(new ErrorResponse(`s3 Access Denied`, 500));
  }

  res.status(200).json({ success: true, s3Key: imageName, photoUrl: url });
});

// @desc Delete s3 Image
// @route GET /api/v2/books/deletes3image
// @access PRIVATE
exports.deleteS3Image = asyncHandler(async (req, res, next) => {
  const response = deleteObject(req.params.key);

  if (!response) {
    return next(new ErrorResponse(`s3 Access Denied`, 500));
  }

  res.status(200).json({ success: true, response });
});

// @desc Get single book
// @route GET /api/v2/books/:id
// @access PUBLIC
exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await prisma.book.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!book) {
    return next(
      new ErrorResponse(`Book not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: book });
});

// @desc Create new book
// @route POST /api/v2/books
// @access PRIVATE
exports.createBook = asyncHandler(async (req, res, next) => {
  req.body.userId = req.user.id;
  req.body.slug = slugify(req.body.title, { lower: true });

  const book = await prisma.book.create({ data: req.body });

  res.status(201).json({ success: true, data: book });
});

// @desc Update single book
// @route PUT /api/v2/books/:id
// @access PRIVATE
exports.updateBook = asyncHandler(async (req, res, next) => {
  let book = await prisma.book.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!book) {
    return next(new ErrorResponse('There is no book with that id', 400));
  }

  if (book.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this book`,
        401
      )
    );
  }

  if (req.body.title) {
    req.body.slug = slugify(req.body.title, { lower: true });
  }
  book = await prisma.book.update({
    where: {
      id: req.params.id,
    },
    data: {
      ...req.body,
    },
  });

  res.status(200).json({ success: true, data: book });
});

// @desc Delete book
// @route DELETE /api/v1/books/:id
// @access PRIVATE
exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await prisma.book.findUnique({ where: { id: req.params.id } });
  if (!book) {
    res.status(400).json({ success: false });
  }

  if (book.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete this book`,
        401
      )
    );
  }

  await prisma.book.delete({ where: { id: req.params.id } });

  res.status(200).json({ success: true, data: {} });
});
