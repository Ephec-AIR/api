const {promisify} = require('util');
const {cleanDB} = require('./utils');
const uuid = require('uuid/v4');
const crypto = require('crypto');
const fetch = require('node-fetch');
const Product = require('./models/Product');
const User = require('./models/User');
const Consumption = require('./models/Consumption');
const generateSample = require('./data');

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
    await insert('toto', 'test123');
    await insert('Christian', 'test123');
  });
}

async function insert(user, password) {
  const product = await generateProduct();
  Product.insertMany(product).then(async docs => {
    if (process.argv[2] && process.argv[2] === '--sync') {
      const {token} = await logUser(user, password);
      await syncUser(product.serial, product.user_secret, token);
    }
    const sampleConsumptionsWithSerial = generateSample().map(consumption => {
      consumption.serial = product.serial;
      return consumption;
    });
    Consumption.insertMany(sampleConsumptionsWithSerial).then(() => process.exit(0));
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
