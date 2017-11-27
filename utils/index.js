const mongoose = require('../mongoose');

async function cleanDB() {
  for (const collection in mongoose.connection.collections) {
    await mongoose.connection.collections[collection].remove({});
  }
}

function randomHelper(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

module.exports = {
  cleanDB,
  randomHelper
};
