const mongoose = require('../mongoose');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: 'please supply a userId',
    unique: true
  },
  username: {
    type: String,
    required: 'please supply a username',
    unique: true
  },
  serial: {
    type: String
  },
  supplier: {
    type: 'String',
    enum: [
      'EDF Luminus',
      'Engie Electrabel',
      'Eni',
      'Essent',
      'Lampiris'
    ]
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {toJSON: {virtuals: true}});

UserSchema.index({userId: 1}, {unique: true});
UserSchema.pre('findOne', autopopulate);

UserSchema.virtual('user_product', {
  ref: 'Product', // The model to use
  localField: 'serial', // Find people where `localField`
  foreignField: 'serial', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true
});

/**
 * Generate a JSON Web Token based on the data saved in our database
 * plus the username given by NodeBB during the authentication.
 * If the user is not linked to an OCR yet, replace the ocr's serial with null.
 */
UserSchema.methods.generateJWT = function () {
  return jwt.sign({
      userId: this.userId,
      username: this.username,
      supplier: this.supplier,
      isAdmin: this.isAdmin,
      serial: this.user_product.serial || null,
      user_secret: this.user_product.user_secret || null,
      postalCode: this.user_product.postalCode || null
  }, JWT_SECRET, {
    expiresIn: '1day',
    subject: 'air'
  });
};

function autopopulate(next) {
  this.populate('user_product');
  next();
}

const User = mongoose.model('User', UserSchema);
module.exports = User;
