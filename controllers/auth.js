const fetch = require('node-fetch');
const User = require('../models/User');
const Product = require('../models/Product');
const BASE_URL = 'https://air.ephec-ti.org/forum';

async function login(req, res) {
  console.log(req.body.password);
  const response = await fetch(`${BASE_URL}/api/ns/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: req.body.username, password: req.body.password
    })
  });

  const data = await response.json();

  if (response.status != 200) {
    res.status(403).send(data);
    return;
  }

  let user = await User.findOne({userId: data.uid});
  // if user does not exist in MONGODB, create it.
  if (!user) {
    user = await new User({
      userId: data.uid,
    }).save();
  }
  const token = user.generateJWT(data.username);
  res.status(200).json({token})
}

async function sync(req, res) {
  const {serial, user_secret} = req.body;
  const product = Product.findOne({serial});

  if (!product) {
    res.status(404).end();
    return;
  }

  if (product.user_secret !== user_secret) {
    res.status(403).end();
    return
  }

  const user = await User.findOne({userId: req.user.userId});
  user.serial = serial;
  await user.save();

  // regenerate jwt
  const token = user.generateJWT(req.user.username);
  res.status(200).json({token});
}

module.exports = {
  login,
  sync
};
