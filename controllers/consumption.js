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
  switch (type) {
    case 'year':
      return consumption.reduce((prev, current) => {
        const month = new Date(current.date).getMonth();
        console.log(month);
        if (prev[month] && prev[month].start) {
          prev[month].end = current.value;
        } else {
          prev[month] = {};
          prev[month].start = current.value;
        }
        return prev;
      }, {});
      break;
    case 'month':
      return consumption.reduce((prev, current) => {
        const day = new Date(current.date).getDate();
        if (prev[day] && prev[day].start) {
          prev[day].end = current.value;
        } else {
          prev[day] = {};
          prev[day].start = current.value;
        }
        return prev;
      }, {});
      break;
    case 'week':
      return consumption.reduce((prev, current) => {
        const day = new Date(current.date).getDay();
        if (prev[day] && prev[day].start) {
          prev[day].end = current.value;
        } else {
          prev[day] = {};
          prev[day].start = current.value;
        }
        return prev;
      }, {});
      break;
    case 'day':
      return consumption.reduce((prev, current) => {
        const hour = new Date(current.date).getHours();
        if (prev[hour] && prev[hour].start) {
          prev[hour].end = current.value;
        } else {
          prev[hour] = {};
          prev[hour].start = current.value;
        }
        return prev;
      }, {});
      break;
  }
}

module.exports = {
  addConsumtion: add,
  getConsumption: get
};
