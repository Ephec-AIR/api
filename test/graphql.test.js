const {mockServer} = require('graphql-tools');
const schema = require('../graphql/schema'); // graphql schema
const casual = require('casual'); // fake data
const {Query, Mutation} = require('../graphql/resolvers'); // query, mutation

// models
const Product = require('../models/Product');
const User = require('../models/User');
const Consumption = require('../models/Consumption');

const server = mockServer(schema);

function decodeToken(token) {
  return new Promise(resolve => {
    const decodedToken = JSON.parse(window.atob(token.split('.')[1]));
    resolve(decodedToken);
  });
}

// Authentication
it('should register a user', async () => {
  const token = await Mutation.register(_, 'Jean', 'jean@jean.be', 'jeanjeanjean');
  const username = (await User.findOne({username: 'Jean'})).username;
  expect(await decodeToken(token).email).toBe('jean@jean.be');
  expect(username).toBe('Jean');
});

it('should login a user', async () => {
  const token = await Mutation.register(_, 'Jean', 'jean@jean.be', 'jeanjeanjean');
  const t = await Mutation.login(_, 'jean@jean.be', 'jeanjeanjean');
  expect(await decodeToken(token).email).toBe('jean@jean.be');
});

it('should update a user profile', async () => {
 return;
});

it('should unregister a user', async () => {
  const token = await Mutation.register(_, 'Jean', 'jean@jean.be', 'jeanjeanjean');
  const message = await Mutation.unregister(_, 'jean@jean.be', 'jeanjeanjean');
  expect(message).toBe('user deleted succefully');
});

// Product, Consumption
it('should get a list of products', async () => {
  const p = await new Product({
    postalCode: '1111'
  }).save();
  const products = await Query.products();
  expect(products.length).toHaveLength(1);
  expect(products[0]).toMatchObject({postalCode: '1111'});
});
