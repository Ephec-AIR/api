const schema = require('../graphql/schema'); // graphql schema
const casual = require('casual'); // fake data
const {graphql} = require('graphql');
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

  const query = `
    query {
      product(serial: "bidon", token: "bidon") {
        _id
        serial
        secret
        token
        postalCode
      }
    }
  `;

  const response = await graphql(schema, query);
  // should expect an error message => to implement in gql

  expect(response.data).toMatchObject({
    "product": {
      "_id": null,
      "serial": null,
      "secret": null,
      "token": null,
      "postalCode": null
    }
  });
});

it('should get a single product', async () => {
  const query = `
    query {
      product(serial: "${serial}", token: "${token}") {
        _id
        serial
        secret
        token
        postalCode
      }
    }
  `;

  const response = await graphql(schema, query);
  expect(response.data.product.serial).toBe(serial);
});

it('should get a single product and its consumption'), async () => {
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

  const query = `
    query {
      product(serial: "${serial}", token: "${token}") {
        _id
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
  `;

  const response = await graphql(schema, query);
  expect(response.data.product.consumption[1].value).toBe(350);
}

it('should get a single product and a number of consumption (sorted by date)'), async () => {
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

  const query = `
    query {
      product(serial: "${serial}", token: "${token}") {
        _id
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
  `;

  const response = await graphql(schema, query);
  expect(response.data.product.consumption).toHaveLength(3);
  expect(response.data.product.consumption[3].value).toBe(450);
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
  const query = `
    mutation {
      updateProduct(productId: "${product._id.toString()}", postalCode: 77777) {
        _id
        serial
        postalCode
      }
    }
  `;

  const response = await graphql(schema, query);
  expect(response.data.updateProduct.serial).toBe(serial);
  expect(response.data.updateProduct.postalCode).toBe(77777)
});

it('should add a consumption for a product given', async () => {
  const product = await Product.findOne({serial});
  const query = `
    mutation {
      addConsumption(serial: "${serial}", token: "${token}",
      date: "${new Date(2017, 10, 6, 15).toISOString()}", value: 450, productId: "${product._id}") {
        _id
        date
        value
      }
    }
  `;

  const response = await graphql(schema, query);
  expect(response.data.addConsumption.date.getMonth()).toBe(10);
  expect(response.data.addConsumption.value).toBe(450);
});
