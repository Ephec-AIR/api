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
    required: 'please supply a product-key'
  }
}, {toJSON: {virtuals: true}});

ConsumptionSchema.pre('find', autopopulate);
ConsumptionSchema.pre('findOne', autopopulate);

ConsumptionSchema.virtual('product', {
  ref: 'Product', // The model to use
  localField: 'serial', // Find people where `localField`
  foreignField: 'serial', // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true
});

function autopopulate(next) {
  this.populate('product');
  next();
}

const Consumption = mongoose.model('Consumption', ConsumptionSchema);
module.exports = Consumption;
