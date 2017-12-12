const fetch = require('node-fetch');
const User = require('../models/User');
const Product = require('../models/Product');
const BASE_URL = 'https://air.ephec-ti.org/forum';

async function login(req, res) {
  const response = await fetch(`${BASE_URL}/api/ns/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: req.body.username, password: req.body.password
    })
  });

  if (response.status != 200) {
    // stream response
    response.body.pipe(res).status(response.status);
    return;
  }

  const data = await response.json();
  let user = await User.findOne({userId: data.uid}).populate('product');
  // if user does not exist in MONGODB, create it.
  if (!user) {
    user = await new User({
      userId: data.uid,
      username: data.username
    }).save();
  }
  const token = user.generateJWT();
  res.status(200).json({token})
}

async function sync(req, res) {
  const {serial} = req.body;

  const user = await User.findOne({userId: req.user.userId}).populate('product');
  user.serial = serial;
  await user.save();

  // regenerate jwt
  const token = user.generateJWT();
  res.status(200).json({token});
}

async function admin(req, res) {
  const {username, admin} = req.body;
  const user = await User.findOne({username});
  user.isAdmin = admin;
  res.status(200).end();
}

module.exports = {
  login,
  sync,
  admin
};
