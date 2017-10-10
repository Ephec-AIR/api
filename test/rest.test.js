const {promisify} = require('util');
const server = require('../server');
const request = require('supertest');
const casual = require('casual'); // fake data
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uuid = require('uuid/v4')
const {cleanDB} = require('../utils');
const JWT_SECRET = process.env.JWT_SECRET;

// models
const Product = require('../models/Product');
const User = require('../models/User');
const Consumption = require('../models/Consumption');

const username = process.env.USR;
const password = process.env.PWD;
const fakeSerial = "e2d36-022e2-ab182-f42e2-806fa";
const fakeOcrSecret = "dab035674b6e91e2395b471b4cdf6bba558580bb";
const fakeUserSecret = "e4bc2b6b236d143bd51522c0";
let serial, user_secret;

function decodeToken(token) {
  return new Promise(resolve => {
    const decodedToken = JSON.parse(window.atob(token.split('.')[1]));
    resolve(decodedToken);
  });
}

async function generateProduct() {
  const serial = uuid();
  const ocr_secret = (await promisify(crypto.randomBytes)(20)).toString('hex');
  const user_secret = (await promisify(crypto.randomBytes)(12)).toString('hex');
  const product = new Product({serial, ocr_secret, user_secret});
  return product;
}

async function logUser() {
  const response = await request(app).post('/login').send({username, password});
  return response.body.token
}

beforeAll(() => {
  return cleanDB();
});

describe('authentication', () => {
  it('should login a user who has an account on the forum', async () => {
    const response = await request(app).post('/login').send({username, password});

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty(token);
    expect(await decodeToken(response.body.token)).toEqual(expect.objectContaining({
      userId: expect.any(String),
      isAdmin: false,
      serial: null,
      username
    }));
  });

  it('should send a status 500 if no username is provided', async () => {
    return request(app).post('/login').send({password}).expect(500);
  });

  it('should send a status 500 if no password is provided', async () => {
    return request(app).post('/login').send({username}).expect(500);
  });

  it('should send a status 403 if no username or password is wrong', async () => {
    return request(app).post('/login').send({username: 'Jean-Luc', password: 'Muteba'}).expect(403);
  });
});

describe('product creation', () => {
  it('should only allow an admin to add a product', async () => {
    // get userId
    const userId = (await decodeToken((await logUser()))).userId;
    // make user admin
    const user = (await User.findOne({userId})).isAdmin = true;
    await user.save();
    // get admin token
    const adminToken = (await request(app).post('/login').send({username, password})).body.token;

    const response = await request(app)
      .post('/product')
      .set('authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      serial: expect.any(String),
      user_secret: expect.any(String),
      ocr_secret: expect.any(String)
    }));
  });

  it('should not allow a no-logged to add a product', async () => {
    return request(app).post('/product').expect(401);
  })

  it('should not allow a no-admin to add a product', async () => {
    const nonAdminToken = jwt.sign({userId: '123'}, JWT_SECRET, {expiresIn: '1day', subject: 'air'});
    const response = await request(app)
      .post('/product')
      .set('authorization', `Bearer ${nonAdminToken}`);
  });
});

describe('product update', () => {
  it('should not update the product if the user is not connected (no jwt provided)', async () => {
    return request(app).put('/product').expect(401);
  });

  it('should not update the product if the user is not sync with a product (no serial linked to user)', async () => {
    const token = await logUser();
    return request(app)
      .put('/product')
      .set('authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('should update the product', async () => {
    const token = await logUser();
    const product = await generateProduct();
    // link user to product
    const response = await request(app)
      .post('/sync')
      .set('authorization', `Bearer ${token}`)
      .send({serial: product.serial, user_secret: product.user_secret});

    // expect status 200
    return request(app)
      .put('/product')
      .set('authorization', `Bearer ${response.body.token}`)
      .send({postalCode: '77777'}).expect(200);
  });
});

describe('sync product', () => {
  it('should send a status 500 if serial is not provided', async () => {
    return request(app).post('/sync').send({user_secret: fakeUserSecret}).expect(500);
  });

  it('should send a status 500 if user_secret is not provided', async () => {
    return request(app).post('/sync').send({serial: fakeSerial}).expect(500);
  });

  it('should not sync product with user if the user is not connected (no jwt provided)', async () => {
    const product = await generateProduct();
    return request(app).post('/sync').send({serial: product.serial, user_secret: product.user_secret}).expect(401);
  });

  it('should not sync product with user if the product does not exist', async () => {
    const token = await logUser();
    const product = await generateProduct();
    return request(app)
      .post('/sync')
      .set('authorization', `Bearer ${token}`)
      .send({serial: fakeSerial, user_secret: product.user_secret}).expect(404);
  });

  it('should not sync product with user if user_secret is not associated with the product', async () => {
    const token = await logUser();
    const product = await generateProduct();
    return request(app)
      .post('/sync')
      .set('authorization', `Bearer ${token}`)
      .send({serial: product.serial, user_secret: fakeUserSecret}).expect(403);
  });

  it('should sync product with user if secret and ocr_secret is ok', async () => {
    const token = await logUser();
    const product = await generateProduct();
    const response = await request(app)
      .post('/sync')
      .set('authorization', `Bearer ${token}`)
      .send({serial: product.serial, user_secret: product.user_secret});

    expect(response.status).toBe(200);
    expect((await decodeToken(response.body.token))).toEqual(expect.objectContaining({
      userId: expect.any(String),
      isAdmin: expect.any(Boolean),
      serial: product.serial,
      username: expect.any(String),
    }));
  });
});

describe('add consumption', () => {});
describe('get consumption', () => {});

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
