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
    date: new Date(2017, 10, 13, 12),
    value: 300,
    serial: 0
  },{
    date: new Date(2017, 10, 13, 13),
    value: 350,
    serial: 0
  },{
    date: new Date(2017, 10, 13, 14),
    value: 400,
    serial: 0
  },{
    date: new Date(2017, 10, 13, 15),
    value: 450,
    serial: 0
  },{
    date: new Date(2017, 10, 14, 12),
    value: 510,
    serial: 0
  },{
    date: new Date(2017, 10, 14, 13),
    value: 520,
    serial: 0
  },{
    date: new Date(2017, 10, 14, 14),
    value: 560,
    serial: 0
  },{
    date: new Date(2017, 10, 14, 15),
    value: 610,
    serial: 0
  },{
    date: new Date(2017, 10, 15, 12),
    value: 630,
    serial: 0
  },{
    date: new Date(2017, 10, 15, 13),
    value: 670,
    serial: 0
  },{
    date: new Date(2017, 10, 15, 14),
    value: 700,
    serial: 0
  },{
    date: new Date(2017, 10, 15, 15),
    value: 705,
    serial: 0
  },{
    date: new Date(2017, 10, 16, 12),
    value: 710,
    serial: 0
  },{
    date: new Date(2017, 10, 16, 13),
    value: 717,
    serial: 0
  },{
    date: new Date(2017, 10, 16, 14),
    value: 800,
    serial: 0
  },{
    date: new Date(2017, 10, 16, 15),
    value: 820,
    serial: 0
  },{
    date: new Date(2017, 10, 17, 12),
    value: 850,
    serial: 0
  },{
    date: new Date(2017, 10, 17, 13),
    value: 920,
    serial: 0
  },{
    date: new Date(2017, 10, 17, 14),
    value: 970,
    serial: 0
  },{
    date: new Date(2017, 10, 17, 15),
    value: 1000,
    serial: 0
  },{
    date: new Date(2017, 10, 18, 12),
    value: 1100,
    serial: 0
  },{
    date: new Date(2017, 10, 18, 13),
    value: 1300,
    serial: 0
  },{
    date: new Date(2017, 10, 18, 14),
    value: 1350,
    serial: 0
  },{
    date: new Date(2017, 10, 18, 15),
    value: 1410,
    serial: 0
  },{
    date: new Date(2017, 10, 19, 12),
    value: 1435,
    serial: 0
  },{
    date: new Date(2017, 10, 19, 13),
    value: 1450,
    serial: 0
  },{
    date: new Date(2017, 10, 19, 14),
    value: 1480,
    serial: 0
  },{
    date: new Date(2017, 10, 19, 15),
    value: 1520,
    serial: 0
  }
];

function seed() {
  return cleanDB().then(async () => {
    const product = await generateProduct();
    Product.insertMany(product).then(async docs => {
      if (process.argv[2] && process.argv[2] === '--sync') {
        const {token} = await logUser("toto", "test123");
        await syncUser(product.serial, product.user_secret, token);
      }
      consumptions.forEach(c => c.serial = product.serial);
      Consumption.insertMany(consumptions).then(() => process.exit(0));
    });
  });
}

async function logUser(username, password) {
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({username, password})
  });

  const data = await response.json();
  return data;
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

module.exports = {
  sampleConsumptions: consumptions
}




