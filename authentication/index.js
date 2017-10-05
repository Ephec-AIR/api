const fetch = require('node-fetch');
const User = require('../models/User');
const BASE_URL = '';

async function login({email, password}) {
  const response = await fetch(`${BASE_URL}/api/ns/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email, password
    })
  });

  // attention à 404

  const data = await response.json();
  const {uid, username, email, gravatarpicture} = data;
  let user = await User.findOne({userId: uid});
  // if user does not exist in MONGODB, create it.
  if (!user) {
    user = await new User({
      uid
    }).save();
  }
  const token = user.generateJWT();
  return token;
}

module.exports = {
  login
};
