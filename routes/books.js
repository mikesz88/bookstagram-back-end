const router = require('express').Router();
// const filteredResults = require('../middleware/filteredResults');

const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  createS3Url,
  deleteS3Image,
} = require('../controllers/books');

// const { protect, authorize } = require('../middleware/auth');

router.get('/', getBooks);
// router.post('/', /* protect, */ /* authorize('admin', 'user'), */ createBook);

// router.get('/:id', getBook);
// router.put('/:id', /* protect, */ /* authorize('admin', 'user'), */ updateBook);
// router.delete(
//   '/:id',
//   /* protect, */ /* authorize('admin', 'user'), */ deleteBook
// );

// router.get(
//   '/get/s3url',
//   /* protect, */ /* authorize('admin', 'user'), */
//   createS3Url
// );

// router.delete(
//   '/deletes3image/:key',
//   protect,
//   /* authorize('admin', 'user'), */
//   deleteS3Image
// );

module.exports = router;
