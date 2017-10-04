const mongoose = require('mongoose');

const ConsumptionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: 'please supply a date for the consumption'
  },
  value: {
    type: Number,
    required: 'please supply a consumption value'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: 'please supply a product-key'
  }
});

const Consumption = mongoose.model('Consumption', ConsumptionSchema);
module.exports = Consumption;
