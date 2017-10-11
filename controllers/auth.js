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
    response.body.pipe(res);
    return;
  }

  const data = await response.json();
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
  console.log(serial, user_secret, product);

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
