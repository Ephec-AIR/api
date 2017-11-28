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

async function generateProduct(postalCode) {
  const serial = uuid();
  const ocr_secret = (await promisify(crypto.randomBytes)(20)).toString('base64');
  const user_secret = (await promisify(crypto.randomBytes)(12)).toString('base64');
  const product = {serial, ocr_secret, user_secret, postalCode};
  console.log('SERIAL:', serial);
  console.log('USER_SECRET:', user_secret);
  return product;
}

async function seed() {
  return cleanDB().then(async () => {
    await insert('Christian', 'Nwamba', 10000, "1");
    await insert(process.env.AIR_USER, process.env.AIR_PASSWORD, 10000, "2");
    await insert('toto', 'test123', 10000, "3");
    await insert('Prosper', 'Otemuyia', 10000, "4");
    await insert('Lecrae', 'Lecrae', 10000, "5");
  });
}

async function insert(username, password, postalCode, userId) {
  const product = await generateProduct(postalCode);
  const docs = await Product.insertMany(product);
  const user = await createUser(username, password, userId, product, 'Eni');
  const sampleConsumptionsWithSerial = generateSample().map(consumption => {
    consumption.serial = product.serial;
    return consumption;
  });
  console.log(sampleConsumptionsWithSerial);
  await Consumption.insertMany(sampleConsumptionsWithSerial);
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
