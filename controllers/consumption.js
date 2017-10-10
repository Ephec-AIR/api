const User = require('../models/User');
const Product = require('../models/Product');
const Consumption = require('../models/Consumption');

async function add(req, res) {
  const {ocr_secret, serial, value} = req.body;

  const pro = await Product.findOne({serial});
  if (!pro) {
    res.status(404).end();
    return;
  }
  if (pro.ocr_secret != ocr_secret) {
    res.status(403).end();
    return;
  }
  if (!pro.isActive) {
    res.status(402).end();
    return;
  }

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
  add,
  get
};
