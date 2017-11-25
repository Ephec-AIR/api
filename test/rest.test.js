//const process = require('process');
const {promisify} = require('util');
const {app, HTTPServer} = require('../server');
const request = require('supertest');
const casual = require('casual'); // fake data
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uuid = require('uuid/v4')
const {subYears, subMonths, subWeeks, subDays} = require('date-fns'); // date helpers
const {cleanDB} = require('../utils');
const mongoose = require('../mongoose');
const JWT_SECRET = process.env.JWT_SECRET;

// models
const Product = require('../models/Product');
const User = require('../models/User');
const Consumption = require('../models/Consumption');

// functions
const {
  subtractAccordingToType,
  getRangeIndex,
  getConsumptionAccordingToType,
  getConsumptionAccordingToTypeWrapperSerial,
  calculateRange,
  calculateRangeWrapperSerial,
  matching,
  calculateAverage
} = require('../controllers/consumption');

const username = process.env.AIR_USER || "toto";
const password = process.env.AIR_PASSWORD || "test123";
const fakeSerial = casual.uuid;
const fakeOcrSecret = "TfN3xudmtYqkJeA1kEECgbattUA";
const fakeUserSecret = "T22FdjUjVfGvExEr";
const sampleConsumptions = require('../data');
let userId = null;

function decodeToken(token) {
  return new Promise(resolve => {
    const decodedToken = JSON.parse(window.atob(token.split('.')[1]));
    resolve(decodedToken);
  });
}

async function generateProduct() {
  const serial = uuid();
  const ocr_secret = (await promisify(crypto.randomBytes)(20)).toString('base64');
  const user_secret = (await promisify(crypto.randomBytes)(12)).toString('base64');
  const product = await new Product({serial, ocr_secret, user_secret}).save();
  return product;
}

beforeAll(() => {
  return cleanDB();
});

afterAll(() => {
  mongoose.disconnect();
  HTTPServer.close();
});

describe('authentication [user]', () => {
  it('should login a user who has an account on the forum', async () => {
    const response = await request(app).post('/login').send({username, password});
    const decodedToken = await decodeToken(response.body.token);
    userId = decodedToken.userId;

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      token: expect.any(String)
    });
    expect(decodedToken).toEqual(expect.objectContaining({
      userId: expect.any(String),
      isAdmin: false,
      serial: null,
      username
    }));
  });

  it('should send a status 400 if nor username nor password is provided', async () => {
    return request(app).post('/login').send().expect(400);
  });

  it('should send a status 400 if no username is provided', async () => {
    return request(app).post('/login').send({password}).expect(400);
  });

  it('should send a status 400 if no password is provided', async () => {
    return request(app).post('/login').send({username}).expect(400);
  });

  it('should send a status 403 if username or/and password is wrong', async () => {
    const response = await request(app).post('/login').send({username: 'Jean-Luc', password: 'Muteba'});
    expect(response.status).toBe(403);
  });
});

describe('product creation [admin]', () => {
  it('should only allow an admin to add a product', async () => {
    // make user admin
    const user = await User.findOne({userId});
    user.isAdmin = true;
    const admin = await user.save();
    // get admin token
    const adminToken = admin.generateJWT(username);

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
    expect(response.status).toBe(403);
  });
});

describe('sync product [user]', () => {
  it('should not sync product with user if the user is not connected (no jwt provided)', async () => {
    const product = await generateProduct();
    return request(app).post('/sync').send({serial: product.serial, user_secret: product.user_secret}).expect(401);
  });

  it('should send a status 400 if nor serial nor user_secret is not provided', async () => {
    const user = await User.findOne({userId});
    const token = user.generateJWT(username);
    return request(app)
      .post('/sync')
      .set('authorization', `Bearer ${token}`)
      .send()
      .expect(400);
  });

  it('should send a status 400 if serial is not provided', async () => {
    const user = await User.findOne({userId});
    const token = user.generateJWT(username);
    return request(app)
      .post('/sync')
      .set('authorization', `Bearer ${token}`)
      .send({user_secret: fakeUserSecret})
      .expect(400);
  });

  it('should send a status 400 if user_secret is not provided', async () => {
    const user = await User.findOne({userId});
    const token = user.generateJWT(username);
    return request(app)
      .post('/sync')
      .set('authorization', `Bearer ${token}`)
      .send({serial: fakeSerial})
      .expect(400);
  });

  it('should not sync product with user if the product does not exist', async () => {
    const user = await User.findOne({userId});
    const token = user.generateJWT(username);
    const product = await generateProduct();
    return request(app)
      .post('/sync')
      .set('authorization', `Bearer ${token}`)
      .send({serial: fakeSerial, user_secret: product.user_secret})
      .expect(404);
  });

  it('should not sync product with user if user_secret is not associated with the product', async () => {
    const user = await User.findOne({userId});
    const token = user.generateJWT(username);
    const product = await generateProduct();
    return request(app)
      .post('/sync')
      .set('authorization', `Bearer ${token}`)
      .send({serial: product.serial, user_secret: fakeUserSecret})
      .expect(403);
  });

  it('should sync product with user if serial and user_secret are ok', async () => {
    const user = await User.findOne({userId});
    const token = user.generateJWT(username);
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

describe('product update [user]', () => {
  it('should not update the product if the user is not connected (no jwt provided)', async () => {
    return request(app).put('/product').expect(401);
  });

  it('should not update the product if the user is not sync with a product (no serial linked to user)', async () => {
    let user = await User.findOne({userId});
    user.serial = null;
    user = await user.save();
    const token = user.generateJWT(username);
    return request(app)
      .put('/product')
      .set('authorization', `Bearer ${token}`)
      .expect(412);
  });

  it('should update the product', async () => {
    const user = await User.findOne({userId});
    const token = user.generateJWT(username);
    const product = await generateProduct();

    // link user to product
    const response = await request(app)
      .post('/sync')
      .set('authorization', `Bearer ${token}`)
      .send({serial: product.serial, user_secret: product.user_secret});

    return request(app)
      .put('/product')
      .set('authorization', `Bearer ${response.body.token}`)
      .send({postalCode: '1340'})
      .expect(200);
  });
});

describe('add consumption [ocr]', () => {
  it('should send a statuts 400 if ocr_secret is not provided', async () => {
    return request(app)
      .put('/consumption')
      .send({
        serial: fakeSerial,
        value: 350
      })
      .expect(400);
  });

  it('should send a statuts 400 if serial is not provided', async () => {
    return request(app)
      .put('/consumption')
      .send({
        ocr_secret: fakeOcrSecret,
        value: 350
      })
      .expect(400);
  });

  it('should send a statuts 400 if value is not provided', async () => {
    return request(app)
      .put('/consumption')
      .send({
        ocr_secret: fakeOcrSecret,
        serial: fakeSerial
      })
      .expect(400);
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

  it('should send a status 410 if the product is disabled', async () => {
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
      .expect(410);
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
    // user should be sync with product
    // based on previous tests
    const user = await User.findOne({userId});
    const token = user.generateJWT(username);
    let product;

    // sync
    if (user.serial === null) {
      product = await generateProduct();
      await request(app)
        .post('/sync')
        .set('authorization', `Bearer ${token}`)
        .send({serial: product.serial, user_secret: product.user_secret});
    } else {
      product = await Product.findOne({serial: user.serial});
    }

    // post consumption
    await request(app)
      .put('/consumption')
      .send({serial: product.serial, ocr_secret: product.ocr_secret, value: 350});

    const end = new Date();
    const start = new Date(end.getFullYear(), 0, 1);
    const type = "year";

    // get consumption
    const response = await request(app)
      .get(`/consumption?start=${start}&end=${end}&type=${type}`)
      .set('authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    //expect(response.body).toMatchSnapshot();
    // expect(response.body[new Date().getMonth()]).toEqual(expect.objectContaining({
    //   start: expect.any(Number),
    //   end: expect.any(Number)
    // }));
  });

  it('should send a status 412 if the user is not sync with the product [no serial in jwt]', async () => {
    // unsync user with product
    const user = await User.findOne({userId});
    const token = user.generateJWT(username);

    user.serial = null;
    const unSyncUser = await user.save();
    const unSyncToken = unSyncUser.generateJWT(username);

    return request(app)
      .get('/consumption')
      .set('authorization', `Bearer ${unSyncToken}`)
      .expect(412);
  });

  describe('[PURE UNIT TEST] get consumption functions', () => {
    it('should subtract a date according to a type of range (year, month, week, day)', () => {
      const yearSubtract = subtractAccordingToType(new Date(), 'year');
      const monthSubtract = subtractAccordingToType(new Date(), 'month');
      const weekSubtract = subtractAccordingToType(new Date(), 'week');
      const daySubtract = subtractAccordingToType(new Date(), 'day');

      expect(yearSubtract).toBe(subYears(new Date(), 1));
      expect(monthSubtract).toBe(subMonths(new Date(), 1));
      expect(weekSubtract).toBe(subWeeks(new Date(), 1));
      expect(daySubtract).toBe(subDays(new Date(), 1));
    });

    it('should get an index (day, week, hour) according to a type of range (year, month, week, day)', () => {
      const yearIndex = getRangeIndex(new Date(), 'year');
      const monthIndex = getRangeIndex(new Date(), 'month');
      const weekIndex = getRangeIndex(new Date(), 'week');
      const dayIndex = getRangeIndex(new Date(), 'day');

      expect(yearSubtract).toBe(new Date().getMonth());
      expect(monthSubtract).toBe(new Date().getDate());
      expect(weekSubtract).toBe(new Date().getDay());
      expect(daySubtract).toBe(new Date().getHours());
    });

    it('should get get the start and end value of a consumption each hours, day, month according to a type of range', () => {
      const resultYear = getConsumptionAccordingToType(sampleConsumptions, 'year');
      const resultMonth = getConsumptionAccordingToType(sampleConsumptions, 'month');
      const resultWeek = getConsumptionAccordingToType(sampleConsumptions, 'week');
      const resultDay = getConsumptionAccordingToType(sampleConsumptions.slice(0, 5), 'day'); // first day of the week sample

      expect(resultYear).toEqual({
        "10": {start: 300, end: 1520}
      });

      expect(resultMonth).toEqual({
        "13": {start: 300, end: 450},
        "14": {start: 510, end: 610},
        "15": {start: 630, end: 705},
        "16": {start: 710, end: 820},
        "17": {start: 850, end: 1000},
        "18": {start: 1100, end: 1410},
        "19": {start: 1435, end: 1520}
      });

      expect(resultWeek).toEqual({
        "0": {start: 300, end: 450},
        "1": {start: 510, end: 610},
        "2": {start: 630, end: 705},
        "3": {start: 710, end: 820},
        "4": {start: 850, end: 1000},
        "5": {start: 1100, end: 1410},
        "6": {start: 1435, end: 1520}
      });

      expect(resultDay).toEqual({
        "12": {start: 300},
        "13": {start: 350},
        "14": {start: 400},
        "15": {start: 450}
      });
    });

    it('should get the calulated value of consumption each hours, day, month according to a type of range', () => {
      const resultYear = calculateRange(sampleConsumptions);
      const resultMonth = calculateRange(sampleConsumptions);
      const resultWeek = calculateRange(sampleConsumptions);
      const resultDay = calculateRange(sampleConsumptions.slice(0, 5)); // first day of the week sample

      expect(resultYear).toEqual({
        "10": 1220
      });

      expect(resultMonth).toEqual({
        "13": 150,
        "14": 100,
        "15": 75,
        "16": 110,
        "17": 150,
        "18": 310,
        "19": 85
      });

      expect(resultWeek).toEqual({
        "0": 150,
        "1": 100,
        "2": 75,
        "3": 110,
        "4": 150,
        "5": 310,
        "6": 85
      });

      // REVOIR L'IMPLEMENTATION (calculer start - end de l'heure précédente)
      expect(resultDay).toEqual({
        "12": 0,
        "13": 50,
        "14": 50,
        "15": 50
      });
    });

    it('should get get the start and end value of a consumption each hours, day, month according to a type of range and return the serial of the product', () => {
      const resultYear = getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions);
      const resultMonth = getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions);
      const resultWeek = getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions);
      const resultDay = getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions.slice(0, 5)); // first day of the week sample

      expect(resultYear).toEqual({
        "10": {start: 300, end: 1520}
      });

      expect(resultMonth).toEqual({
        "13": {start: 300, end: 450},
        "14": {start: 510, end: 610},
        "15": {start: 630, end: 705},
        "16": {start: 710, end: 820},
        "17": {start: 850, end: 1000},
        "18": {start: 1100, end: 1410},
        "19": {start: 1435, end: 1520}
      });

      expect(resultWeek).toEqual({
        "0": {start: 300, end: 450},
        "1": {start: 510, end: 610},
        "2": {start: 630, end: 705},
        "3": {start: 710, end: 820},
        "4": {start: 850, end: 1000},
        "5": {start: 1100, end: 1410},
        "6": {start: 1435, end: 1520}
      });

      expect(resultDay).toEqual({
        "12": {start: 300},
        "13": {start: 350},
        "14": {start: 400},
        "15": {start: 450}
      });
    });

    it('should get the calulated value of consumption each hours, day, month according to a type of range and return the serial of the product', () => {
      const resultYear = calculateRangeWrapperSerial(sampleConsumptions, 'abc-123');
      const resultMonth = calculateRangeWrapperSerial(sampleConsumptions, 'abc-123');
      const resultWeek = calculateRangeWrapperSerial(sampleConsumptions, 'abc-123');
      const resultDay = calculateRangeWrapperSerial(sampleConsumptions.slice(0, 5), 'abc-123'); // first day of the week sample

      expect(resultYear).toEqual({
        'abc-123': {"10": 1220}
      });

      expect(resultMonth).toEqual({
        'abc-123': {
          "13": 150,
          "14": 100,
          "15": 75,
          "16": 110,
          "17": 150,
          "18": 310,
          "19": 85
        }
      });

      expect(resultWeek).toEqual({
        'abc-123': {
          "0": 150,
          "1": 100,
          "2": 75,
          "3": 110,
          "4": 150,
          "5": 310,
          "6": 85
        }
      });

      expect(resultDay).toEqual({
        'abc-123': {
          "12": 0,
          "13": 50,
          "14": 50,
          "15": 50
        }
      });
    });

    it('should calculate an average value of consumption', () => {
      const resultMonth = getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions, 'abc-123');
      const result = calculateAverage(resultMonth);
      expect(result).toEqual({
        serial: 'abc-123',
        average: 154
      });
    });
  });
});
