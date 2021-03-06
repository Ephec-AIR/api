const {startOfWeek, subYears, subMonths, subWeeks, subDays, subHours} = require('date-fns');
const {mean} = require('simple-statistics');
const User = require('../models/User');
const Product = require('../models/Product');
const Consumption = require('../models/Consumption');
// https://www.killmybill.be/fr/tarifs-electricite-belgique/
const SUPPLIERS_PRICE_KWH = {
  'EDF Luminus': 6.02,
  'Engie Electrabel': 6.34,
  'Eni': 5.04,
  'Essent': 6.92,
  'Lampiris': 5.23
};

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
  //console.log(subtractAccordingToType(start, type));
  //console.log('BUG', subHours(start, 1));
  //console.log('CORRECT', subHours(startOfWeek(new Date(), {weekStartsOn: 1}), 1));
  //console.log(new Date(start));
  //console.log(new Date(end));
  const consumptions = await Promise.all([
    // ma consommation d'avant
    Consumption.find({serial: req.user.serial, date: {$gte: subtractAccordingToType(start, type), $lte: subHours(start, 1)}}),
    // ma consommation courante
    Consumption.find({serial: req.user.serial, date: {$gte: start, $lte: end}})
  ]);

  //console.log(start, end);
  //console.log(await Consumption.find({serial: req.user.serial, date: {$gte: start, $lte: end}}));

  const [beforeCpt, nowCpt] = consumptions
    .map(consumption => getConsumptionAccordingToType(consumption, type))
    .map(consumption => calculateRange(consumption))

  //console.log(beforeCpt, nowCpt);

  res.status(200).json({
    before: {
      values: beforeCpt,
      price: calculatePrice(req, beforeCpt)
    },
    now: {
      values: nowCpt,
      price: calculateAndPredictPriceIfNeeded(req, beforeCpt, nowCpt)
    }
  });
}

async function match(req, res) {
  const {start, end, type} = req.query;
  const result = await matching(start, end, type, req);
  res.status(200).json(result);
}

/**
 *
 * @param {Object} consumption {"0": 100, "1": 200}
 * @returns {Number} price the price that costs your consumption according to the supplier you are subscribed
 */
function calculatePrice (req, consumption) {
  const total = Object.keys(consumption).reduce((prev, range) => prev += consumption[range], 0);
  return total * SUPPLIERS_PRICE_KWH[req.user.supplier];
}

/**
 * @param {Object} beforeCpt past consumption {"0": 100, "1": 200}
 * @param {Object} nowCpt now consumption {"0": 100, "1": 200}
 * @returns {Number} price the price that costs your consumption according to the supplier you are subscribed
 */
function calculateAndPredictPriceIfNeeded (req, beforeCpt, nowCpt) {
  let consumption = Object.values(nowCpt);
  const diff = Object.keys(beforeCpt).length - Object.keys(nowCpt).length;
  if (diff > 0) {
    const {average} = calculateAverage(nowCpt);
    for (let i = 0; i < diff; i++) {
      consumption.push(average);
    }
  }

  const total = consumption.reduce((prev, value) => prev += value, 0);
  return total * SUPPLIERS_PRICE_KWH[req.user.supplier];
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
    'week': date => subWeeks(date, 1),
    'day': date => subDays(date, 1)
  };
  return types[type](date);
}

function getRangeIndex (date, type) {
  const types = {
    'year': date => date.getMonth(),
    'month': date => date.getDate(),
    'week': date => getDayOfWeek(date), // first day begins sunday in date api !
    'day': date => date.getHours()
  };
  return types[type](date);
}

function getDayOfWeek(date) {
  let day = date.getDay() - 1;
  if (day === -1) {
    day = 6
  }
  return day;
}

function getConsumptionAccordingToTypeWrapperSerial(consumption, type, serial) {
  const values = getConsumptionAccordingToType(consumption, type);
  return {serial, values};
}

function calculateRangeWrapperSerial({serial, values}) {
  return {serial, values: calculateRange(values)};
}

/**
 *
 * @param {Array} consumption
 * @param {String} type
 * @returns {Object} {"0": {start: 300, end: 400}, "1": {start: 400, end: 500},...}
 */
function getConsumptionAccordingToType (consumption, type) {
  const cpt = consumption.reduce((prev, current) => {
    const index = getRangeIndex(current.date, type);
    //console.log(current.date, index);
    //if (index === 1) console.log(current.date, new Date(current.date));
    if (prev[index] && prev[index].start) {
      prev[index].end = current.value;
    } else {
      prev[index] = {};
      prev[index].start = current.value;
    }
    return prev;
  }, {});
  //console.log(cpt);
  return cpt;
}

/**
 *
 * @param {Object} rangeConsumption
 * @returns {Object} {"0": 100, "1": 200}
 */
function calculateRange(rangeConsumption) {
  return Object.keys(rangeConsumption).reduce((prev, range) => {
    if (!rangeConsumption[range].end) {
      prev[range] =
        rangeConsumption[Number(range) - 1]
          ? rangeConsumption[range].start - rangeConsumption[Number(range) - 1].start
          : 0;
    } else {
      prev[range] = rangeConsumption[range].end - rangeConsumption[range].start;
    }
    return prev;
  }, {});
}

/**
 *
 * @param {Date} start
 * @param {Date} end
 * @param {String} type, type year, month, week, day
 */
async function matching (start, end, type, req) {
  let regionConsumption =
    await Consumption.find({date: {$gte: start, $lte: end}}).populate('product');
  regionConsumption = regionConsumption.filter(consumption => consumption.product.postalCode === req.user.postalCode);

  // {"123-abc": [{date: ..., value: ...}, {}],...}
  const consumptionGroupedBySerial = regionConsumption.reduce((prev, current) => {
    const serial = current.serial;
    if (prev[serial]) {
      prev[serial].push({date: current.date, value: current.value});
    } else {
      prev[serial] = [];
    }
    return prev;
  }, {});

  const rangeConsumption = Object.keys(consumptionGroupedBySerial)
    .map(serial => getConsumptionAccordingToTypeWrapperSerial(consumptionGroupedBySerial[serial], type, serial));

  const totalConsumption = rangeConsumption
    .map(consumption => calculateRangeWrapperSerial(consumption));

  //console.log(totalConsumption);
  const groupedByRange = {};
  totalConsumption.map(consumption => {
    for (const range in consumption.values) {
      const value = consumption.values[range];
      if (!groupedByRange[range]) {
        groupedByRange[range] = [];
      }
      groupedByRange[range].push(value);
    }
  });
  //console.log(groupedByRange);

  const average = Object.keys(groupedByRange).reduce((prev, current) => {
    prev[current] = mean(Object.values(groupedByRange[current]));
    return prev;
  }, {})

  //console.log(average);

  // sort averages
  //const sortedAverages = averages.sort((a, b) => b.value - a.value);
  // find the averages better than you
  //const bests = sortedAverages.slice(0, sortedAverages.findIndex(avg => avg.serial === req.user.serial));

  // Woops, no best, YOU IS THE BEST !
  //if (bests.length === 0) {
  //  return {error: 'Well... Vous semblez être le meilleur consommateur de votre région !'};
  //}

  // pick up one
  //const best = bests[Math.floor(Math.random() * (bests.length - 1))];
  // get his username
  //const {username} = await User.findOne({serial: best.serial});
  //return {...best, username, values: (totalConsumption.find(consumption => consumption.serial === best.serial)).values};
  return {values: average}
}

/**
 * calculate the average consumption for a date range given
 * @param {Object} consumption with ranges calculated {serial: "abc-123, values: {"0": 100, "1": 200}}
 * @returns {Object} {serial: "abc-123": value: 150}
 */
function calculateAverageWrapperSerial({serial, values}) {
  const {average} = calculateAverage(values);
  return {serial, average};
}

/**
 * calculate the average consumption for a date range given
 * @param {Object} consumption with ranges calculated {"0": 100, "1": 200}
 * @returns {Object} {value: 150}
 */
function calculateAverage(consumption) {
  const consumptionIdx = Object.values(consumption);
  const average = Math.round(consumptionIdx.reduce((prev, current) => prev += current, 0) / consumptionIdx.length);
  return {average};
}

module.exports = {
  addConsumtion: add,
  getConsumption: get,
  match,
  matching,
  subtractAccordingToType,
  getRangeIndex,
  getConsumptionAccordingToType,
  getConsumptionAccordingToTypeWrapperSerial,
  calculatePrice,
  calculateAndPredictPriceIfNeeded,
  calculateRange,
  calculateRangeWrapperSerial,
  calculateAverageWrapperSerial,
  calculateAverage
};
