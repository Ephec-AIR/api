const {promisify} = require('util');
const crypto = require('crypto');
const uuid = require('uuid/v4')
const User = require('../models/User');
const Product = require('../models/Product');
const Consumption = require('../models/Consumption');

async function create(req, res) {
  // serial (int incrémental)
  // ocr 20 bytes
  // user 12 bytes
  const serial = uuid();
  const ocr_secret = (await promisify(crypto.randomBytes)(20)).toString('hex');
  const user_secret = (await promisify(crypto.randomBytes)(12)).toString('hex');
  const product = await new Product({serial, ocr_secret, user_secret}).save();
  res.status(200).json(simpleProductJson(product));
}

async function setPostalCode(req, res) {
  if (!req.user.serial) {
    res.status(412).end();
  }
  const product = await Product.findOne({serial: req.user.serial})
  product.postalCode = req.body.postalCode;
  await product.save();

  res.status(200).end();
}

function simpleProductJson(product) {
  return {
    serial: product.serial,
    ocr_secret: product.ocr_secret,
    user_secret: product.user_secret
  }
}

module.exports = {
  createProduct: create,
  setPostalCode
};
