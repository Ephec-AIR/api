const {mockServer} = require('graphql-tools');
const schema = require('../graphql/schema'); // graphql schema
const casual = require('casual'); // fake data
const {Query, Mutation} = require('../graphql/resolvers'); // query, mutation
const {tester} = require('graphql-tester');
const {cleanDB} = require('../utils');

// models
const Product = require('../models/Product');
const User = require('../models/User');
const Consumption = require('../models/Consumption');

const server = mockServer(schema);
const gqltest = tester({
  url: 'localhost:3000/graphql'
});

const serial = 'e2d36-022e2-ab182-f42e2-806fa';
const secret = 'pommepoire';
const token = 'dab035674b6e91e2395b471b4cdf6bba558580bb';

function decodeToken(token) {
  return new Promise(resolve => {
    const decodedToken = JSON.parse(window.atob(token.split('.')[1]));
    resolve(decodedToken);
  });
}

beforeEach(() => {
  cleanDB().catch(err => console.error(err));
});

it('should get a list of consumptions', async () => {
  return;
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
  const product = await new Product({
    serial,
    secret,
    token,
    postalCode: '10000'
  }).save();

  const data = await gqltest(`
    query {
      product(serial: ${serial}, token: ${token}) {
        _id,
        serial
        secret
        token
        postalCode
      }
    }
  `);

  console.log(data);
  expect(data.serial).toBe(serial);
});

it('should get a single product and its consumption'), async () => {
  const product = new Product({
    serial,
    secret,
    token,
    postalCode: '10000'
  });

  const consumption1 = new Consumption({
    date: new Date(2017, 10, 06, 12, 00),
    value: 300,
    productId: product._id
  });

  const consumption2 = new Consumption({
    date: new Date(2017, 10, 06, 13, 00),
    value: 350,
    productId: product._id
  });

  await Promise.all([
    product.save(),
    consumption1.save(),
    consumption2.save()
  ]);

  const data = await gqltest(`
    query {
      product(serial: ${serial}, token: ${token}) {
        _id,
        serial
        secret
        token
        postalCode
        consumption {
          date
          value
        }
      }
    }
  `);

  expect(data.consumption[1].value).toBe(350);
}

it('should get a single product and a number of consumption (sorted by date)'), async () => {
  const product = new Product({
    serial,
    secret,
    token,
    postalCode: '10000'
  });

  const consumption1 = new Consumption({
    date: new Date(2017, 10, 06, 12, 00),
    value: 300,
    productId: product._id
  });

  const consumption2 = new Consumption({
    date: new Date(2017, 10, 06, 13, 00),
    value: 350,
    productId: product._id
  });

  const consumption3 = new Consumption({
    date: new Date(2017, 10, 06, 14, 00),
    value: 400,
    productId: product._id
  });

  const consumption4 = new Consumption({
    date: new Date(2017, 10, 06, 15, 00),
    value: 450,
    productId: product._id
  });

  await Promise.all([
    product.save(),
    consumption1.save(),
    consumption2.save(),
    consumption3.save(),
    consumption4.save()
  ]);

  const data = await gqltest(`
    query {
      product(serial: ${serial}, token: ${token}) {
        _id,
        serial
        secret
        token
        postalCode
        consumption(limit: 3) {
          date
          value
        }
      }
    }
  `);

  expect(data.consumption).toHaveLength(3);
  expect(data.consumption[3].value).toBe(450);
}

it('should login a user who has an account on the forum', async () => {
  const data = await gqltest(`
    mutation {
      login (email: mathieu0709@gmail.com, password: ${process.env.USER_PWD}) {
        token
      }
    }
  `);

  expect((await decode(data.token)).email).toBe('mathieu0709@gmail.com');
});

it('should update a product', async () => {
  const product = await new Product({
    serial,
    secret,
    token,
    postalCode: '10000'
  }).save();

  const data = await gqltest(`
    mutation {
      updateProduct(productId: ${product._id.toString()}, postalCode: 77777) {
        _id
        serial
        postalCode
      }
    }
  `);

  expect(data.serial).toBe(serial);
  expect(data.postalCode).toBe(77777)
});

it('should add a consumption for a product given', async () => {
  const product = await new Product({
    serial,
    secret,
    token,
    postalCode: '10000'
  }).save();

  const data = await gqltest(`
    mutation {
      addConsumption(serial: ${serial}, token: ${token},
      date: ${new Date(2017, 10, 06, 15, 00)}, value: 450, productId: ${product._id}) {
        _id
        date
        value
      }
    }
  `);

  expect(data.date.getMonth()).toBe(10);
  expect(data.value).toBe(450);
});
