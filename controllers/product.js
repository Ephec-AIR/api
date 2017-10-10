const User = require('../models/User');
const Product = require('../models/Product');
const Consumption = require('../models/Consumption');
const crypto = require("crypto");

async function create(req, res) {
  // serial (int incrémental)
  // ocr 20 bytes
  // user 12 bytes
  const pro = new Product({serial, ocr_secret, user_secret});
  res.status(200).json(pro);
}

async function setPostalCode(req, res) {
  if (!req.user.serial) {
    res.status(404).end();
  }
  const pro = await Product.findOne({serial: res.user.serial})
  pro.postalCode = req.body.postalCode;
  await pro.save();

  res.status(200).end();
}

module.exports = {
  create,
  setPostalCode
};
