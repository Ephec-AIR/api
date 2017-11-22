const {promisify} = require('util');
const crypto = require('crypto');
const uuid = require('uuid/v4')
const User = require('../models/User');
const Product = require('../models/Product');
const Consumption = require('../models/Consumption');

async function create(req, res) {
  const serial = uuid();
  const ocr_secret = (await promisify(crypto.randomBytes)(20)).toString('base64');
  const user_secret = (await promisify(crypto.randomBytes)(12)).toString('base64');
  const product = await new Product({serial, ocr_secret, user_secret}).save();
  res.status(200).json(simpleProductJson(product));
}

async function setPostalCode(req, res) {
  const product = await Product.findOne({serial: req.user.serial})
  product.postalCode = req.body.postalCode;
  await product.save();

  const user = await User.findOne({userId: req.user.userId});
  console.log(user);

  // regenerate jwt
  const token = user.generateJWT(req.user.username);
  res.status(200).json({token});
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
