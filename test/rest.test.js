const {mockServer} = require('graphql-tools');
const schema = require('../graphql/schema'); // graphql schema
const casual = require('casual'); // fake data
const request = require('supertest');
const app = require('../server');
const {cleanDB} = require('../utils');

const User = require('../models/User');
const server = mockServer(schema);

function decodeToken(token) {
  return new Promise(resolve => {
    const decodedToken = JSON.parse(window.atob(token.split('.')[1]));
    resolve(decodedToken);
  });
}

beforeEach(() => {
  cleanDB().catch(err => console.error(err));
});

it('should register a user', async () => {
  const {body: {token}} = await request(app)
    .post('/register')
    .send({
      username: 'Jean',
      email: 'jean@jean.be',
      password: 'jeanjeanjean'
    });
  const username = (await User.findOne({username: 'Jean'})).username;

  expect(await decodeToken(token).email).toBe('jean@jean.be');
  expect(username).toBe('Jean');
});

it('should login a user', async () => {
  // First register
  await request(app)
    .post('/register')
    .send({
      username: 'Jean',
      email: 'jean@jean.be',
      password: 'jeanjeanjean'
    });

  // Then login
  const {body: {token}} = await request(app)
    .post('/login')
    .send({
      email: 'jean@jean.be',
      password: 'jeanjeanjean'
    });

  expect(await decodeToken(token).email).toBe('jean@jean.be');
});

it('should unregister a user', async () => {
  // First register
  await request(app)
    .post('/register')
    .send({
      username: 'Jean',
      email: 'jean@jean.be',
      password: 'jeanjeanjean'
    });

  // Then unregister
  const response = await request(app)
    .delete('/unregister')
    .send({
      email: 'jean@jean.be',
      password: 'jeanjeanjean'
    });

  const username = (await User.findOne({username: 'Jean'})).username;

  expect(username).toBeNull();
  expect(response.body).toBe('user deleted successfully');
});
