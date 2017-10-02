const mongoose = require('mongoose');
const DBURL = 'mongodb://localhost:27017/air';

mongoose.Promise = global.Promise;
mongoose.connect(DBURL, {
  useMongoClient: true,
}).catch(err => console.error(err));

module.exports = mongoose;
