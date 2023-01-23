const router = require('express').Router();

const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  createS3Url,
  deleteS3Image,
} = require('../controllers/books');

const { protect, authorize } = require('../middleware/auth');

router.route('/').get(getBooks).post(protect, createBook);

router
  .route('/:id')
  .get(getBook)
  .put(protect, authorize('ADMIN', 'USER'), updateBook)
  .delete(protect, authorize('ADMIN', 'USER'), deleteBook);

router.get('/get/s3url', protect, authorize('ADMIN', 'USER'), createS3Url);

router.delete(
  '/deletes3image/:key',
  protect,
  authorize('ADMIN', 'USER'),
  deleteS3Image
);

module.exports = router;
