const {promisify} = require('util');
const path = require('path');
const fs = require('fs');
const readFile = promisify(fs.readFile);

async function tip(req, res) {
  const tips = JSON.parse(await readFile(path.join(__dirname, '../json/tips.json'), 'utf-8'));
  const tip = tips[Math.floor(Math.random() * (tips.length - 1))];
  res.status(200).json({tip});
}

async function events(req, res) {

}

module.exports = {
  tip,
  events
}
