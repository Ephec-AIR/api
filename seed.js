const {promisify} = require('util');
const {cleanDB} = require('./utils');
const uuid = require('uuid/v4');
const crypto = require('crypto');
const Product = require('./models/Product');
const User = require('./models/User');
const Consumption = require('./models/Consumption');

async function generateProduct() {
  const serial = uuid();
  const ocr_secret = (await promisify(crypto.randomBytes)(20)).toString('base64');
  const user_secret = (await promisify(crypto.randomBytes)(12)).toString('base64');
  const product = {serial, ocr_secret, user_secret};
  console.log('SERIAL:', serial);
  console.log('USER_SECRET:', user_secret);
  return product;
}

// 1 week consumptions
const consumptions = [
  {
    date: new Date(2017, 10, 23, 12),
    value: 300,
    serial: 0
  },{
    date: new Date(2017, 10, 23, 13),
    value: 350,
    serial: 0
  },{
    date: new Date(2017, 10, 23, 14),
    value: 400,
    serial: 0
  },{
    date: new Date(2017, 10, 23, 15),
    value: 450,
    serial: 0
  },{
    date: new Date(2017, 10, 24, 12),
    value: 300,
    serial: 0
  },{
    date: new Date(2017, 10, 24, 13),
    value: 350,
    serial: 0
  },{
    date: new Date(2017, 10, 24, 14),
    value: 400,
    serial: 0
  },{
    date: new Date(2017, 10, 24, 15),
    value: 450,
    serial: 0
  },{
    date: new Date(2017, 10, 25, 12),
    value: 300,
    serial: 0
  },{
    date: new Date(2017, 10, 25, 13),
    value: 350,
    serial: 0
  },{
    date: new Date(2017, 10, 25, 14),
    value: 400,
    serial: 0
  },{
    date: new Date(2017, 10, 25, 15),
    value: 450,
    serial: 0
  },{
    date: new Date(2017, 10, 26, 12),
    value: 300,
    serial: 0
  },{
    date: new Date(2017, 10, 26, 13),
    value: 350,
    serial: 0
  },{
    date: new Date(2017, 10, 26, 14),
    value: 400,
    serial: 0
  },{
    date: new Date(2017, 10, 26, 15),
    value: 450,
    serial: 0
  },{
    date: new Date(2017, 10, 27, 12),
    value: 300,
    serial: 0
  },{
    date: new Date(2017, 10, 27, 13),
    value: 350,
    serial: 0
  },{
    date: new Date(2017, 10, 27, 14),
    value: 400,
    serial: 0
  },{
    date: new Date(2017, 10, 27, 15),
    value: 450,
    serial: 0
  },{
    date: new Date(2017, 10, 28, 12),
    value: 300,
    serial: 0
  },{
    date: new Date(2017, 10, 28, 13),
    value: 350,
    serial: 0
  },{
    date: new Date(2017, 10, 28, 14),
    value: 400,
    serial: 0
  },{
    date: new Date(2017, 10, 28, 15),
    value: 450,
    serial: 0
  },{
    date: new Date(2017, 10, 29, 12),
    value: 300,
    serial: 0
  },{
    date: new Date(2017, 10, 29, 13),
    value: 350,
    serial: 0
  },{
    date: new Date(2017, 10, 29, 14),
    value: 400,
    serial: 0
  },{
    date: new Date(2017, 10, 29, 15),
    value: 450,
    serial: 0
  }
];

function seed() {
  return cleanDB().then(async () => {
    const product = await generateProduct();
    Product.insertMany(product).then(docs => {
      consumptions.forEach(c => c.serial = product.serial);
      Consumption.insertMany(consumptions).then(() => process.exit(0));
    });
  });
}

seed().catch(err => console.error(err));




