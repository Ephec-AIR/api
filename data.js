const casual = require('casual');
const {randomHelper} = require('./utils');
const {eachDay, addHours, subDays, subWeeks, addWeeks} = require('date-fns');
const START_VALUE = 300;
const NBR_VALUES_PER_DAY = 24;
const MAX_CPT_PER_HOUR = 2;
const MAX_EVENTS = 5;
let start;

// 1 week consumptions
const hardcoded = [
  {
    date: new Date(2017, 10, 13, 12),
    value: 300,
    serial: 0
  },{
    date: new Date(2017, 10, 13, 13),
    value: 350,
    serial: 0
  },{
    date: new Date(2017, 10, 13, 14),
    value: 400,
    serial: 0
  },{
    date: new Date(2017, 10, 13, 15),
    value: 450,
    serial: 0
  },{
    date: new Date(2017, 10, 14, 12),
    value: 510,
    serial: 0
  },{
    date: new Date(2017, 10, 14, 13),
    value: 520,
    serial: 0
  },{
    date: new Date(2017, 10, 14, 14),
    value: 560,
    serial: 0
  },{
    date: new Date(2017, 10, 14, 15),
    value: 610,
    serial: 0
  },{
    date: new Date(2017, 10, 15, 12),
    value: 630,
    serial: 0
  },{
    date: new Date(2017, 10, 15, 13),
    value: 670,
    serial: 0
  },{
    date: new Date(2017, 10, 15, 14),
    value: 700,
    serial: 0
  },{
    date: new Date(2017, 10, 15, 15),
    value: 705,
    serial: 0
  },{
    date: new Date(2017, 10, 16, 12),
    value: 710,
    serial: 0
  },{
    date: new Date(2017, 10, 16, 13),
    value: 717,
    serial: 0
  },{
    date: new Date(2017, 10, 16, 14),
    value: 800,
    serial: 0
  },{
    date: new Date(2017, 10, 16, 15),
    value: 820,
    serial: 0
  },{
    date: new Date(2017, 10, 17, 12),
    value: 850,
    serial: 0
  },{
    date: new Date(2017, 10, 17, 13),
    value: 920,
    serial: 0
  },{
    date: new Date(2017, 10, 17, 14),
    value: 970,
    serial: 0
  },{
    date: new Date(2017, 10, 17, 15),
    value: 1000,
    serial: 0
  },{
    date: new Date(2017, 10, 18, 12),
    value: 1100,
    serial: 0
  },{
    date: new Date(2017, 10, 18, 13),
    value: 1300,
    serial: 0
  },{
    date: new Date(2017, 10, 18, 14),
    value: 1350,
    serial: 0
  },{
    date: new Date(2017, 10, 18, 15),
    value: 1410,
    serial: 0
  },{
    date: new Date(2017, 10, 19, 12),
    value: 1435,
    serial: 0
  },{
    date: new Date(2017, 10, 19, 13),
    value: 1450,
    serial: 0
  },{
    date: new Date(2017, 10, 19, 14),
    value: 1480,
    serial: 0
  },{
    date: new Date(2017, 10, 19, 15),
    value: 1520,
    serial: 0
  }
];

function generateSample() {
  let dateRange;
  start = START_VALUE;
  const now = new Date();

  // 1 week before
  // https://date-fns.org/v1.29.0/docs/eachDay
  dateRange = eachDay(subWeeks(now, 1), subDays(now, 1));
  const beforeCpt = generateValues(dateRange);

  // 1 week now
  // https://date-fns.org/v1.29.0/docs/eachDay
  dateRange = eachDay(now, addWeeks(now, 1));
  const nowCpt = generateValues(dateRange);

  const consumptions = beforeCpt.concat(nowCpt);
  return consumptions;
}

function generateValues(dateRange) {
  const consumptions = [];
  for (const date of dateRange) {
    for (let i = 0; i < NBR_VALUES_PER_DAY; i++) {
      const cpt = randomHelper(0, MAX_CPT_PER_HOUR);
      consumptions.push({
        date: addHours(date, i),
        value: start + cpt,
        serial: 0
      });
      start += cpt;
    }
  }
  return consumptions;
}

function generateEvents () {
  const events = [];
  console.log(casual.moment, new Date(casual.moment));
  for (let i = 0; i < MAX_EVENTS; i++) {
    const event = {
      date: casual.moment,
      place: casual.address,
      title: casual.title,
      description: casual.text,
      url: casual.url
    }
    events.push(event);
  }
}

module.exports = {
  generateSample,
  generateEvents,
  hardcoded
}
