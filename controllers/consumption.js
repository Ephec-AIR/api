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
  const finalConsumption = calculateRange(rangeConsumption);
  res.status(200).json(finalConsumption);
}

/**
 *
 * @param {*} consumption
 * @param {*} type
 * @returns {"0": {start: 300, end: 400}, "1": {start: 400, end: 500},...}
 */
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

/**
 *
 * @param {*} rangeConsumption
 * @returns {"0": 100, "1": 200}
 */
function calculateRange(rangeConsumption) {
  return Object.keys(rangeConsumption).reduce((prev, range) => {
    if (!rangeConsumption[range].end) {
      prev[range] = rangeConsumption[range].start;
    } else {
      prev[range] = rangeConsumption[range].end - rangeConsumption[range].start;
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

async function matching (start, end) {
  const regionConsumption =
    await Consumption.find({serial: {postalCode: req.user.postalCode}, date: {$gte: start, $lte: end}});

  const match =
    regionConsumption.filter(c => {

    });
}

module.exports = {
  addConsumtion: add,
  getConsumption: get
};
