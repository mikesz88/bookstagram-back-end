const Book = require('../models/Book');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { generateUploadURL, deleteObject } = require('../utils/s3');

// @desc Get all books
// @route GET /api/v1/books
// @access PUBLIC
exports.getBooks = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.filteredResults);
});

// @desc Get single book
// @route GET /api/v1/books/:id
// @access PUBLIC
exports.getBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    return next(new ErrorResponse(`Book not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: book });
});

// @desc Create new s3Url Link
// @route GET /api/v1/books/get/s3url
// @access PRIVATE
exports.createS3Url = asyncHandler( async (req, res, next) => {
  const [ imageName, url ] = await generateUploadURL();

  if (!url) {
    return next(new ErrorResponse(`s3 Access Denied`, 500))
  }

  res.status(200).json({ success: true, key: imageName, photoUrl: url });
})

// @desc Delete s3 Image
// @route GET /api/v1/books/deletes3image
// @access PRIVATE
exports.deleteS3Image = asyncHandler( async (req, res, next) => {
  const response = await deleteObject(req.params.key);
  console.log(response, 'response');

  if (!response) {
    return next(new ErrorResponse(`s3 Access Denied`, 500))
  }

  res.status(200).json({ success: true, response });
})

// @desc Create new book
// @route POST /api/v1/books
// @access PRIVATE
exports.createBook = asyncHandler( async (req, res, next) => {
  req.body.user = req.user.id;
  const book = await Book.create(req.body);
  res.status(201).json({ success: true, data: book });
});

// @desc Update single book
// @route PUT /api/v1/books/:id
// @access PRIVATE
exports.updateBook = asyncHandler(async (req, res, next) => {
  let book = await Book.findById(req.params.id);

  if (!book) {
    return next(new ErrorResponse('There is no book with that id', 400));
  }

  if (book.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this book`, 401))
  }

  book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({ success: true, data: book});
});

// @desc Delete book
// @route DELETE /api/v1/books/:id
// @access PRIVATE
exports.deleteBook = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  
  if (!book) {
    res.status(400).json({ success: false })
  }

  if (book.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this book`, 401))
  }

  book.remove();
  
  res.status(200).json({ success: true, data: {}});
});