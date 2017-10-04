const {mockServer} = require('graphql-tools');
const schema = require('../graphql/schema'); // graphql schema
const casual = require('casual'); // fake data
const {Query, Mutation} = require('../graphql/resolvers'); // query, mutation
const {cleanDB} = require('../utils');

// models
const Product = require('../models/Product');
const User = require('../models/User');
const Consumption = require('../models/Consumption');

const server = mockServer(schema);

beforeEach(() => {
  cleanDB().catch(err => console.error(err));
});

it('should update a user profile', async () => {
 return;
});

it('should get a list of products', async () => {
  const p = await new Product({
    postalCode: '1111'
  }).save();
  const products = await Query.products();
  expect(products.length).toHaveLength(1);
  expect(products[0]).toMatchObject({postalCode: '1111'});
});

it('should get a list users', async () => {
  return;
});

it('should get a list of consumptions', async () => {
  return;
});

it('should get a single product', async () => {
  return;
});

it('should get a single user', async () => {
  return;
});

it('should get a list of consumptions for a product given', async () => {
  return;
});

it('should add a product', async () => {
  return;
});

it('should update a product', async () => {
  return;
});

it('should add a consumption for a product given', async () => {
  return;
});
