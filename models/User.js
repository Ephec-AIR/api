const mongoose = require('../mongoose');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: 'please supply a userId',
    unique: true
  },
  serial: {
    type: String,
    ref: 'Product'
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

function autopopulate(next) {
  this.populate('serial');
  next();
}

UserSchema.index({userId: 1}, {unique: true});
UserSchema.pre('find', autopopulate);
UserSchema.pre('findOne', autopopulate);

UserSchema.methods.generateJWT = function(username) {
  return jwt.sign({
      userId: this.userId,
      isAdmin: this.isAdmin,
      serial: this.serial || null,
      username
  }, JWT_SECRET, {
    expiresIn: '1day',
    subject: 'air'
  });
}

const User = mongoose.model('User', UserSchema);
module.exports = User;
