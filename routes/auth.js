const router = require('express').Router();

const {
  register,
  login,
  logout,
  getLoggedInUser,
  findUserName,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  updateForgotQuestionAnswer,
  deleteSelf,
  forgetQuestion,
} = require('../controllers/auth');

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getLoggedInUser);
router.get('/findusername/:id', protect, findUserName);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/updateforgot', protect, updateForgotQuestionAnswer);
router.put('/forgotquestion', forgetQuestion);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.delete('/deleteself', protect, deleteSelf);

module.exports = router;
