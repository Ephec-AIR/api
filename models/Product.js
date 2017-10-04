const mongoose = require('../mongoose');

const ProductSchema = new mongoose.Schema({
  postalCode: {
    type: Number,
    required: 'please supply a postal code'
  }
});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
