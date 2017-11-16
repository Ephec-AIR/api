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
  if (req.query.start && req.query.end) {
    const {start, end, type} = req.query;
    const consumption = await Consumption.find({serial: req.user.serial, date: {$gte: start, $lte: end}});
    res.status(200).json(getConsumptionAccordingToType(consumption, type));
    return;
  }
  res.status(200).json(await Consumption.find({serial: req.user.serial}));
}

function getConsumptionAccordingToType (consumption, type) {
  const getRangeIndex = {
    'year': date => new Date(date).getMonth(),
    'month': date => new Date(date).getDate(),
    'week': date => new Date(date).getDay(),
    'day': date => new Date(date).getHours()
  };

  return consumption.reduce((prev, current) => {
    const index = getRangeIndex[type]
    if (prev[index] && prev[index].start) {
      prev[index].end = current.value;
    } else {
      prev[index] = {};
      prev[index].start = current.value;
    }
    return prev;
  }, {});
}

module.exports = {
  addConsumtion: add,
  getConsumption: get
};
