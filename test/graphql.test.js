const {mockServer} = require('graphql-tools');
const schema = require('../graphql/schema'); // graphql schema
const casual = require('casual'); // fake data
const {Query, Mutation} = require('../graphql/resolvers'); // query, mutation

// models
const Product = require('../models/Product');
const User = require('../models/User');
const Consumption = require('../models/Consumption');

const server = mockServer(schema);

it('should get a list of products', async () => {
  const p = await new Product({
    postalCode: '1111'
  }).save();
  const products = await Query.products();
  expect(products.length).toHaveLength(1);
  expect(products[0]).toMatchObject({postalCode: '1111'});
});
