const {promisify} = require('util');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const validator = require('validator');
const {JWT_SECRET} = require("../config");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
    required: 'Please supply an username'
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid email address'],
    required: 'Please supply an email'
  },
  hash: {
    type: String,
    required: 'Please supply an hash'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }
});

UserSchema.method.hashPassword = function(password) {
  return promisify(bcrypt.genSalt)(10)
    .then(salt => bcrypt.hash(password, salt))
    .then(hash => hash)
    .catch(error => error);
}

UserSchema.method.verifyPassword = function(password) {
  return promisify(bcrypt.compare)(password, this.hash)
    .then(response => response)
    .catch(error => error);
}

UserSchema.method.generateJWT = function() {
  return jwt.sign({
      _id: this._id,
      username: this.username,
      email: this.email
  }, JWT_SECRET, {
    expiresIn: '1day',
    subject: 'air'
  });
}

const User = mongoose.model('User', UserSchema);
module.exports = User;
