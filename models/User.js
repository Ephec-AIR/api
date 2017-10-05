const mongoose = require('../mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require("../config");

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: 'please supply a userId',
    unique: true
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

UserSchema.methods.generateJWT = function() {
  return jwt.sign({
      userId: this.userId,
      productId: this.productId
  }, JWT_SECRET, {
    expiresIn: '1day',
    subject: 'air'
  });
}

const User = mongoose.model('User', UserSchema);
module.exports = User;
