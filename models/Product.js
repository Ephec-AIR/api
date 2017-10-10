const mongoose = require('../mongoose');

const ProductSchema = new mongoose.Schema({
  serial: { // serial key
    type: String,
    required: 'please supply a serial key',
    lowercase: true,
    unique: true
  },
  user_secret: { // shared secret (no hash!)
    type: String,
    required: 'please supply a secret'
  },
  ocr_secret: { // 20 bytes string
    type: String,
    required: 'please supply a token'
  },
  postalCode: {
    type: Number,
    required: 'please supply a postal code'
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

ProductSchema.index({serial: 1}, {unique: true});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
