const fetch = require('node-fetch');
const User = require('../models/User');
const BASE_URL = 'https://air.ephec-ti.org/forum';

async function login({username, password}) {
  const response = await fetch(`${BASE_URL}/api/ns/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      username, password
    })
  });

  // attention à 404

  const data = await response.json();
  console.log(data)
  let user = await User.findOne({userId: uid});
  // if user does not exist in MONGODB, create it.
  if (!user) {
    user = await new User({
      userId: data.uid,
    }).save();
  }
  const token = user.generateJWT(data.username);
  return token;
}

module.exports = {
  login
};
