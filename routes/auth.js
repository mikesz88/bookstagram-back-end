const express = require('express');

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
  forgetQuestion
} = require('../controllers/auth');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getLoggedInUser);
router.get('/findusername/:id', protect, findUserName);
router.put('/updatedetails', protect, updateDetails);
router.post('/updatepassword', protect, updatePassword);
router.put('/updateforgot', protect, updateForgotQuestionAnswer);
router.post('/forgotpassword', forgotPassword);
router.put('/forgotquestion', forgetQuestion)
router.put('/resetpassword/:resettoken', resetPassword);
router.delete('/deleteself/:id', protect, deleteSelf);

module.exports = router;