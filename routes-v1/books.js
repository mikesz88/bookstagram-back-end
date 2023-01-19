const express = require('express');
const router = express.Router();
const filteredResults = require('../middleware/filteredResults');
const Book = require('../models/Book');

const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  createS3Url,
  deleteS3Image
} = require('../controllers/books');

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(filteredResults(Book), getBooks)
  .post(protect, authorize('admin', 'user'), createBook);

router.route('/:id')
  .get(getBook)
  .put(protect, authorize('admin', 'user'), updateBook)
  .delete(protect, authorize('admin', 'user'), deleteBook);

router.route('/get/s3url')
  .get(protect, authorize('admin', 'user'), createS3Url)
  
  router.route('/deletes3image/:key')
  .delete(protect, authorize('admin', 'user'), deleteS3Image);

module.exports = router;