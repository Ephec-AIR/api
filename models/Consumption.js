const mongoose = require('../mongoose');

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
  serial: {
    type: String,
    ref: 'Product',
    required: 'please supply a product-key'
  }
});

function autopopulate(next) {
  this.populate('serial');
  next();
}

//ConsumptionSchema.pre('find', autopopulate);
//ConsumptionSchema.pre('findOne', autopopulate);

const Consumption = mongoose.model('Consumption', ConsumptionSchema);
module.exports = Consumption;
