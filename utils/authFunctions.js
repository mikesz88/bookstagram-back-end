const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// to be used for password and forgot password answer

exports.saltValue = async (value) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(value, salt);
};

// Sign JWT and return
// changed from id to email bc it is unique
exports.getSignedJwt = (email) =>
  jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

// to be used for password and forgot password comparison
exports.matchSaltedValue = async (value, saltedValue) =>
  await bcrypt.compare(value, saltedValue);

// also returning reset password token and expiration.
exports.getResetPasswordToken = () => {
  const resetToken = crypto.randomBytes(20).toString('hex');

  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const resetPasswordExpired = Date.now() + 10 * 60 * 1000;

  return { resetPasswordToken, resetPasswordExpired, resetToken };
};
