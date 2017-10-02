const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  postalCode: {type: Number, required: true}
});

const Product = mongoose.model('Product', ProductSchema);
