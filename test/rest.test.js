const server = require('../server');
const test = require('supertest');
const casual = require('casual'); // fake data
const {cleanDB} = require('../utils');

// models
const Product = require('../models/Product');
const User = require('../models/User');
const Consumption = require('../models/Consumption');

const serial = "e2d36-022e2-ab182-f42e2-806fa";
const secret = "pommepoire";
const token = "dab035674b6e91e2395b471b4cdf6bba558580bb";

function decodeToken(token) {
  return new Promise(resolve => {
    const decodedToken = JSON.parse(window.atob(token.split('.')[1]));
    resolve(decodedToken);
  });
}

beforeAll(() => {
  return cleanDB();
});

it('should not get a single product if not authorized (serial, token)', async () => {
  const product = await new Product({
    serial,
    secret,
    token,
    postalCode: '10000'
  }).save();

});

it('should get a single product', async () => {

});

it('should get a single product and its consumption'), async () => {
  const product = await Product.findOne({serial});
  const consumption1 = new Consumption({
    date: new Date(2017, 10, 6, 12),
    value: 300,
    productId: product._id
  });

  const consumption2 = new Consumption({
    date: new Date(2017, 10, 6, 13),
    value: 350,
    productId: product._id
  });

  await Promise.all([
    consumption1.save(),
    consumption2.save()
  ]);


}

it('should get a single product and a number of consumption (sorted by date)'), async () => {
  const product = await Product.findOne({serial});
  const consumption3 = new Consumption({
    date: new Date(2017, 10, 6, 14),
    value: 400,
    productId: product._id
  });

  const consumption4 = new Consumption({
    date: new Date(2017, 10, 6, 15),
    value: 450,
    productId: product._id
  });

  await Promise.all([
    consumption3.save(),
    consumption4.save()
  ]);

}

it('should get a single product and a all its consumption (sorted by date) if limit = 0'), async () => {
  const product = await Product.findOne({serial});


}

/*it('should login a user who has an account on the forum', async () => {
  const query = `
    mutation {
      login (email: "mathieu0709@gmail.com", password: "${process.env.USER_PWD}") {
        token
      }
    }
  `;

  const response = await graphql(schema, query);
  expect((await decodeToken(response.data.token)).email).toBe('mathieu0709@gmail.com');
});*/

it('should update a product', async () => {
  const product = await Product.findOne({serial});

});

it('should add a consumption for a product given', async () => {
  const product = await Product.findOne({serial});

});
