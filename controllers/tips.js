const {promisify} = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);

async function tip(req, res) {
  const tips = await readFile('../json/tips.json');
  const tip = tips[Math.floor(Math.random() * (tips.length - 1))];
  res.status(200).json({tip});
}

module.exports = {
  tip
}
