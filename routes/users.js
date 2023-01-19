const router = require('express').Router();
// const filteredResults = require('../middleware/filteredResults');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/users');

const { protect, authorize } = require('../middleware/auth');

// router.use(protect);
// router.use(authorize('admin'));

// router.get('/', getUsers);
// router.post('/', createUser);

// router.get('/:id', getUser);
// router.put('/:id', updateUser);
// router.delete('/:id', deleteUser);

module.exports = router;
