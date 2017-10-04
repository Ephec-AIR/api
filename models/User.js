const mongoose = require('../mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
    validate: {
      validator: value => validator.isEmail(value),
      message: 'Invalid email address'
    },
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

function autopopulate(next) {
  this.populate('productId');
  next();
}

UserSchema.pre('find', autopopulate);
UserSchema.pre('findOne', autopopulate);

UserSchema.methods.hashPassword = async function(password) {
  const hash = await bcrypt.hash(password, 8);
  this.hash = hash;
}

UserSchema.methods.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.hash);
}

UserSchema.methods.generateJWT = function() {
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
