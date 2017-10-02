const mongoose = require('mongoose');

const ConsumptionSchema = new mongoose.Schema({
  date: {type: Date, required: true},
  consumption: {type: Number, required: true},
  productId: {type: mongoose.Schema.Types.ObjectId, required: true}
});

const Consumption = mongoose.model('Consumption', ConsumptionSchema);
