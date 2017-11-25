const {subYears, subMonths, subWeeks, subDays} = require('date-fns');
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
  const consumptions = await Promise.all([
    // ma consommation d'avant
    Consumption.find({serial: req.user.serial, date: {$gte: subtractAccordingToType(start, type), $lte: start}}),
    // ma consommation courante
    Consumption.find({serial: req.user.serial, date: {$gte: start, $lte: end}})
  ]);

  const Normalizedconsumptions = consumptions
    .map(consumption => getConsumptionAccordingToType(consumption, type))
    .map(consumption => calculateRange(consumption))

  res.status(200).json(Normalizedconsumptions);
}

/**
 * Substract 1 year, 1 month, 1 week, 1 day according to the type of graph asked
 * @param {Date} date Date to apply the subtraction
 * @param {String} type Type of graph (year, month, week, day)
 */
function subtractAccordingToType(date, type) {
  const types = {
    'year': date => subYears(date, 1),
    'month': date => subMonths(date, 1),
    'week': date => subMonths(date, 1),
    'day': date => subDays(date, 1)
  };
  return types[type](date);
}

function getRangeIndex (date, type) {
  const types = {
    'year': date => date.getMonth(),
    'month': date => date.getDate(),
    'week': date => date.getDay(),
    'day': date => date.getHours()
  };
  return types[type](date);
};

function getConsumptionAccordingToTypeWrapperSerial(consumption, type, serial) {
  const object = {};
  return object[serial] = getConsumptionAccordingToType(consumption, type);
}

function calculateRangeWrapperSerial(consumption, serial) {
  const object = {};
  return object[serial] = calculateAverage(consumption);
}

/**
 *
 * @param {*} consumption
 * @param {*} type
 * @returns {Object} {"0": {start: 300, end: 400}, "1": {start: 400, end: 500},...}
 */
function getConsumptionAccordingToType (consumption, type) {
  return consumption.reduce((prev, current) => {
    const index = getRangeIndex(current.date, type);
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
 * @returns {Object} {"0": 100, "1": 200}
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

async function matching (start, end, type) {
  const regionConsumption =
    await Consumption.find({serial: {postalCode: req.user.postalCode}, date: {$gte: start, $lte: end}});

  // {"123-abc": [{date: ..., value: ...}, {}],...}
  const consumptionGroupedBySerial = regionConsumption.reduce((prev, current) => {
    const serial = current.serial.serial;
    if (serial === req.user.serial) {
      return prev;
    }

    if (prev[serial]) {
      prev[serial].push({date: current.date, value: current.value});
    } else {
      prev[serial] = [];
    }
    return prev
  }, {});

  const rangeConsumption = Object.keys(consumptionGroupedBySerial)
    .map(serial => getConsumptionAccordingToTypeWrapperSerial(consumptionGroupedBySerial[serial], type, serial));

  const totalConsumption = rangeConsumption
    .map(consumption => calculateRangeWrapperSerial(consumption[serial], Object.keys(consumption)));

  const averages = totalConsumption
    .map(consumption => calculateAverage(consumption));

  const sortedAverages = averages.sort((a, b) => b.value - a.value);
  const best = sortedAverages[0];
  return {...best, values: totalConsumption.find(consumption.serial === best.serial)};
}

/**
 * calculate the average consumption for a date range given
 * @param {*} consumption with ranges calculated {"abc-123: {"0": 100, "1": 200}}
 * @returns {Object} {serial: "abc-123": value: 150}
 */
function calculateAverage(consumption) {
  const serial = Object.keys(consumption);
  const consumptionIdx = Object.keys(consumption.serial);
  const average = consumptionIdx.reduce((prev, current) => prev += current, 0) / consumptionIdx.length;
  return {serial, average}
}

module.exports = {
  addConsumtion: add,
  getConsumption: get
};
