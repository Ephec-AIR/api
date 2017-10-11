const User = require('../models/User');
const Product = require('../models/Product');
const Consumption = require('../models/Consumption');

async function add(req, res) {
  const {serial, value} = req.body;
  const cons = {
    date: new Date(),
    serial,
    value
  }

  await new Consumption(cons).save();
  res.status(200).end();
}

async function get(req, res) {
  if (!req.user.serial) {
    res.status(400).end();
    return;
  }
  res.status(200).json(await Consumption.find({serial: req.user.serial}));
}

module.exports = {
  addConsumtion: add,
  getConsumption: get
};
