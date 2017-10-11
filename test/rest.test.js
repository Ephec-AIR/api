const {promisify} = require('util');
const app = require('../server');
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

const username = process.env.USER;
const password = process.env.PASSWORD;
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
  const product = await new Product({serial, ocr_secret, user_secret}).save();
  return product;
}

async function logUser() {
  const response = await request(app).post('/login').send({username, password});
  return response.body.token
}

beforeAll(() => {
  return cleanDB();
});

describe('authentication [user]', () => {
  it('should login a user who has an account on the forum', async () => {
    const response = await request(app).post('/login').send({username, password});

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      token: expect.any(String)
    });
    expect(await decodeToken(response.body.token)).toEqual(expect.objectContaining({
      userId: expect.any(String),
      isAdmin: false,
      serial: null,
      username
    }));
  });

  it('should send a status 400 if nor username nor password are provided', async() => {
    return request(app).post("/login").send().expect(400);
  })

  it('should send a status 400 if no username is provided', async () => {
    return request(app).post('/login').send({password}).expect(400);
  });

  it('should send a status 400 if no password is provided', async () => {
    return request(app).post('/login').send({username}).expect(400);
  });

  it('should send a status 403 if username or/and password is wrong', async () => {
    return request(app).post('/login').send({username: 'Jean-Luc', password: 'Muteba'}).expect(403);
  });
});

describe('product creation [admin]', () => {
  it('should only allow an admin to add a product', async () => {
    // get userId
    const userId = (await decodeToken((await logUser()))).userId;
    // make user admin
    const user = await User.findOne({userId});
    user.isAdmin = true;
    await user.save();
    // get admin token
    const adminToken = await logUser();

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

describe('product update [user]', () => {
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
    console.log(token);
    // link user to product
    const response = await request(app)
      .post('/sync')
      .set('authorization', `Bearer ${token}`)
      .send({serial: product.serial, user_secret: product.user_secret});

    // expect status 200
    return request(app)
      .put('/product')
      .set('authorization', `Bearer ${response.body.token}`)
      .send({postalCode: '77777'})
      .expect(200);
  });
});

describe('sync product [user]', () => {
  it('should not sync product with user if the user is not connected (no jwt provided)', async () => {
    const product = await generateProduct();
    return request(app).post('/sync').send({serial: product.serial, user_secret: product.user_secret}).expect(401);
  });

  it('should send a status 500 if serial is not provided', async () => {
    const token = await logUser();
    return request(app)
      .post('/sync')
      .set('authorization', `Bearer ${token}`)
      .send({user_secret: fakeUserSecret})
      .expect(500);
  });

  it('should send a status 500 if user_secret is not provided', async () => {
    const token = await logUser();
    return request(app)
      .post('/sync')
      .set('authorization', `Bearer ${token}`)
      .send({serial: fakeSerial})
      .expect(500);
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
    console.log(token);
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

describe('add consumption [ocr]', () => {
  it('should send a statuts 500 if ocr_secret is not provided', async () => {
    return request(app)
      .put('/consumption')
      .send({
        serial: fakeSerial,
        value: 350
      })
      .expect(500);
  });

  it('should send a statuts 500 if serial is not provided', async () => {
    return request(app)
      .put('/consumption')
      .send({
        ocr_secret: fakeOcrSecret,
        value: 350
      })
      .expect(500);
  });

  it('should send a statuts 500 if value is not provided', async () => {
    return request(app)
      .put('/consumption')
      .send({
        ocr_secret: fakeOcrSecret,
        serial: fakeSerial
      })
      .expect(500);
  });

  it('should send a status 404 if the product does not exist [wrong serial]', async () => {
    return request(app)
      .put('/consumption')
      .send({
        serial: fakeSerial,
        ocr_secret: fakeOcrSecret,
        value: 350
      })
      .expect(404)
  });

  it('should send a status 403 if the ocr_secret is wrong', async () => {
    const product = await generateProduct();
    return request(app)
      .put('/consumption')
      .send({
        serial: product.serial,
        ocr_secret: fakeOcrSecret,
        value: 350
      })
      .expect(403);
  });

  it('should send a status 402 if the product is disabled', async () => {
    const product = await generateProduct();
    product.isActive = false;
    await product.save();

    return request(app)
      .put('/consumption')
      .send({
        serial: product.serial,
        ocr_secret: product.ocr_secret,
        value: 350
      })
      .expect(402);
  });

  it('should add consumption to product if everything is ok', async () => {
    const product = await generateProduct();

    return request(app)
      .put('/consumption')
      .send({
        serial: product.serial,
        ocr_secret: product.ocr_secret,
        value: 350
      })
      .expect(200);
  });
});

describe('get consumption [user]', () => {
  it('should get a list of consumptions if the product requested is sync with the user', async () => {
    // user should be sync with user
    // based on previous tests
    const token = await logUser();
    const response = await request(app)
      .get('/consumption')
      .set('authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toEqual(expect.objectContaining({
      date: expect.any(Date),
      value: expect.any(Number),
      serial: (await decodeToken(token)).serial
    }));
  });

  it('should send a status 400 if the user is not sync with the product [no serial in jwt]', async () => {
    // unsync user with product
    const token = await logUser();
    const userId = (await decodeToken(token)).userId;
    const user = await User.findOne({userId});
    user.serial = fakeSerial;
    await user.save();
    const unSyncToken = await logUser();

    return request(app)
      .get('/consumption')
      .set('authorization', `Bearer ${unSyncToken}`)
      .expect(400);
  });
});
