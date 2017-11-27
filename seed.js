const {promisify} = require('util');
const {cleanDB} = require('./utils');
const dotenv = require('dotenv').config();
const uuid = require('uuid/v4');
const crypto = require('crypto');
const fetch = require('node-fetch');
const Product = require('./models/Product');
const User = require('./models/User');
const Consumption = require('./models/Consumption');
const {generateSample} = require('./data');

async function generateProduct() {
  const serial = uuid();
  const ocr_secret = (await promisify(crypto.randomBytes)(20)).toString('base64');
  const user_secret = (await promisify(crypto.randomBytes)(12)).toString('base64');
  const product = {serial, ocr_secret, user_secret};
  console.log('SERIAL:', serial);
  console.log('USER_SECRET:', user_secret);
  return product;
}

function seed() {
  return cleanDB().then(async () => {
    await insert('toto', 'test123', "3");
    await insert(process.env.AIR_USER, process.env.AIR_PASSWORD, "2");
  });
}

async function insert(username, password, userId) {
  const product = await generateProduct();
  Product.insertMany(product).then(async docs => {
    await createUser(username, password, userId, product, 'Eni')
    const sampleConsumptionsWithSerial = generateSample().map(consumption => {
      consumption.serial = product.serial;
      return consumption;
    });
    await Consumption.insertMany(sampleConsumptionsWithSerial);
  });
}

async function createUser(username, password, userId, {serial}, supplier) {
  return new User({
    userId,
    username,
    serial,
    supplier
  }).save();
}

async function syncUser(username, serial) {
  const user = await User.findOne({username});
  user.serial = serial;
  await user.save();
}

module.exports = seed;
