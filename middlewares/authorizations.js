const jwt = require('express-jwt');
const Product = require('../models/Product');
const JWT_SECRET = process.env.JWT_SECRET;

const login = jwt({
  secret: JWT_SECRET,
  getToken: function (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      return req.cookies.jwt;
    }
    return null;
  }
});

const admin = (req, res, next) => {
  if (!req.user.isAdmin) {
    res.status(403).send('admin only !');
    return;
  }
  next();
}

const owner = async (req, res, next) => {
  const {user_secret} = req.body;
  const product = await Product.findOne({serial});

  if (!product) {
    res.status(404).end();
    return;
  }

  if (product.user_secret !== user_secret) {
    res.status(403).end();
    return
  }
}

const ocr = async (req, res, next) => {
  const {ocr_secret, serial} = req.body;
  const product = await Product.findOne({serial});

  if (!product) {
    res.status(404).end();
    return;
  }

  if (product.ocr_secret != ocr_secret) {
    res.status(403).end();
    return;
  }

  if (!product.isActive) {
    res.status(410).end();
    return;
  }
  next();
}

const sync = (req, res, next) => {
  if (!req.user.serial) {
    res.status(412).end();
    return;
  }
  next();
}

module.exports = {
  jwt: login,
  admin,
  owner,
  ocr,
  isSync: sync
}
