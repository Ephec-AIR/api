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
  const {start, end, type} = req.query;
  const consumption = await Consumption.find({serial: req.user.serial, date: {$gte: start, $lte: end}});
  const rangeConsumption = getConsumptionAccordingToType(consumption, type);
  const finalConsumption = Object.keys(rangeConsumption).reduce((prev, range) => {
    if (!rangeConsumption[range].end) {
      prev[range] = rangeConsumption[range].start;
    } else {
      prev[range] = rangeConsumption[range].end - rangeConsumption[range].start;
    }
    return prev;
  }, {});
  res.status(200).json(finalConsumption);
}

function getConsumptionAccordingToType (consumption, type) {
  return consumption.reduce((prev, current) => {
    const index = getRangeIndex(type, current.date);
    if (prev[index] && prev[index].start) {
      prev[index].end = current.value;
    } else {
      prev[index] = {};
      prev[index].start = current.value;
    }
    return prev;
  }, {});
}

const getRangeIndex = (type, date) => {
  const types = {
    'year': date => date.getMonth(),
    'month': date => date.getDate(),
    'week': date => date.getDay(),
    'day': date => date.getHours()
  };
  return types[type](date);
};

module.exports = {
  addConsumtion: add,
  getConsumption: get
};
