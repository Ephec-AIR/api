const {promisify} = require('util');
const {cleanDB} = require('./utils');
const uuid = require('uuid/v4');
const crypto = require('crypto');
const fetch = require('node-fetch');
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
    Product.insertMany(product).then(async docs => {
      if (process.argv[2] && process.argv[2] === '--sync') {
        const token = await logUser("toto", "test123");
        await syncUser(product.serial, product.user_secret, token);
      }
      consumptions.forEach(c => c.serial = product.serial);
      Consumption.insertMany(consumptions).then(() => process.exit(0));
    });
  });
}

async function logUser(username, password) {
  return fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({username, password})
  });
}

async function syncUser(serial, user_secret, token) {
  return fetch('http://localhost:3000/sync', {
    method: 'POST',
    headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${token}`
    },
    body: JSON.stringify({serial, user_secret})
  });
}

seed().catch(err => console.error(err));




