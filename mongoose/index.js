const mongoose = require('mongoose');
const production = process.env.NODE_ENV === 'production';
const DBURL = production ? process.env.DBURL : 'mongodb://localhost:27017/air';

mongoose.Promise = global.Promise;
mongoose.connect(DBURL, {
  useMongoClient: true,
}).catch(err => console.error(err));

module.exports = mongoose;
