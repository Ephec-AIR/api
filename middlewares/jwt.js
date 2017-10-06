const jwt = require('express-jwt');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = jwt({
  secret: JWT_SECRET,
  getToken: function (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      return req.cookies.jwt;
    }
    console.log('No token received...');
    return null;
  }
});
