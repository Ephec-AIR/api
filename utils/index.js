const mongoose = require('../mongoose');

async function cleanDB() {
  for (const collection in mongoose.connection.collections) {
    await mongoose.connection.collections[collection].remove({});
  }
}

/**
 * renvoi un nombre à 1 virgule, compris entre min et max
 * @param {Number} min
 * @param {Number} max
 * @returns {Number} random
 */
function randomHelper(min, max) {
  const number = Math.random() * (max - min) + min;
  return Number(number.toFixed(1));
}

module.exports = {
  cleanDB,
  randomHelper
};
