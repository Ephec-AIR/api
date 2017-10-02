const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  pseudo: {type: String, required: true, unique: true},
  email: {type: String, required: true},
  hash: {type: String, required: true},
  productId: {type: mongoose.Schema.Types.ObjectId}
});

const User = mongoose.model('User', UserSchema);
