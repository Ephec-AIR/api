const {subYears, subMonths, subWeeks, subDays} = require('date-fns'); // date helpers

// functions
const {
  subtractAccordingToType,
  getRangeIndex,
  getConsumptionAccordingToType,
  getConsumptionAccordingToTypeWrapperSerial,
  calculateRange,
  calculateRangeWrapperSerial,
  matching,
  calculateAverage
} = require('../controllers/consumption');

const sampleConsumptions = require('../data'); // data

describe('[UNIT TEST] get consumption functions', () => {
  it('should subtract a date according to a type of range (year, month, week, day)', () => {
    const yearSubtract = subtractAccordingToType(new Date(), 'year');
    const monthSubtract = subtractAccordingToType(new Date(), 'month');
    const weekSubtract = subtractAccordingToType(new Date(), 'week');
    const daySubtract = subtractAccordingToType(new Date(), 'day');

    expect(yearSubtract).toBe(subYears(new Date(), 1));
    expect(monthSubtract).toBe(subMonths(new Date(), 1));
    expect(weekSubtract).toBe(subWeeks(new Date(), 1));
    expect(daySubtract).toBe(subDays(new Date(), 1));
  });

  it('should get an index (day, week, hour) according to a type of range (year, month, week, day)', () => {
    const yearIndex = getRangeIndex(new Date(), 'year');
    const monthIndex = getRangeIndex(new Date(), 'month');
    const weekIndex = getRangeIndex(new Date(), 'week');
    const dayIndex = getRangeIndex(new Date(), 'day');

    expect(yearSubtract).toBe(new Date().getMonth());
    expect(monthSubtract).toBe(new Date().getDate());
    expect(weekSubtract).toBe(new Date().getDay());
    expect(daySubtract).toBe(new Date().getHours());
  });

  it('should get get the start and end value of a consumption each hours, day, month according to a type of range', () => {
    const resultYear = getConsumptionAccordingToType(sampleConsumptions, 'year');
    const resultMonth = getConsumptionAccordingToType(sampleConsumptions, 'month');
    const resultWeek = getConsumptionAccordingToType(sampleConsumptions, 'week');
    const resultDay = getConsumptionAccordingToType(sampleConsumptions.slice(0, 5), 'day'); // first day of the week sample

    expect(resultYear).toEqual({
      "10": {start: 300, end: 1520}
    });

    expect(resultMonth).toEqual({
      "13": {start: 300, end: 450},
      "14": {start: 510, end: 610},
      "15": {start: 630, end: 705},
      "16": {start: 710, end: 820},
      "17": {start: 850, end: 1000},
      "18": {start: 1100, end: 1410},
      "19": {start: 1435, end: 1520}
    });

    expect(resultWeek).toEqual({
      "0": {start: 300, end: 450},
      "1": {start: 510, end: 610},
      "2": {start: 630, end: 705},
      "3": {start: 710, end: 820},
      "4": {start: 850, end: 1000},
      "5": {start: 1100, end: 1410},
      "6": {start: 1435, end: 1520}
    });

    expect(resultDay).toEqual({
      "12": {start: 300},
      "13": {start: 350},
      "14": {start: 400},
      "15": {start: 450}
    });
  });

  it('should get the calulated value of consumption each hours, day, month according to a type of range', () => {
    const resultYear = calculateRange(sampleConsumptions);
    const resultMonth = calculateRange(sampleConsumptions);
    const resultWeek = calculateRange(sampleConsumptions);
    const resultDay = calculateRange(sampleConsumptions.slice(0, 5)); // first day of the week sample

    expect(resultYear).toEqual({
      "10": 1220
    });

    expect(resultMonth).toEqual({
      "13": 150,
      "14": 100,
      "15": 75,
      "16": 110,
      "17": 150,
      "18": 310,
      "19": 85
    });

    expect(resultWeek).toEqual({
      "0": 150,
      "1": 100,
      "2": 75,
      "3": 110,
      "4": 150,
      "5": 310,
      "6": 85
    });

    // REVOIR L'IMPLEMENTATION (calculer start - end de l'heure précédente)
    expect(resultDay).toEqual({
      "12": 0,
      "13": 50,
      "14": 50,
      "15": 50
    });
  });

  it('should get get the start and end value of a consumption each hours, day, month according to a type of range and return the serial of the product', () => {
    const resultYear = getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions);
    const resultMonth = getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions);
    const resultWeek = getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions);
    const resultDay = getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions.slice(0, 5)); // first day of the week sample

    expect(resultYear).toEqual({
      "10": {start: 300, end: 1520}
    });

    expect(resultMonth).toEqual({
      "13": {start: 300, end: 450},
      "14": {start: 510, end: 610},
      "15": {start: 630, end: 705},
      "16": {start: 710, end: 820},
      "17": {start: 850, end: 1000},
      "18": {start: 1100, end: 1410},
      "19": {start: 1435, end: 1520}
    });

    expect(resultWeek).toEqual({
      "0": {start: 300, end: 450},
      "1": {start: 510, end: 610},
      "2": {start: 630, end: 705},
      "3": {start: 710, end: 820},
      "4": {start: 850, end: 1000},
      "5": {start: 1100, end: 1410},
      "6": {start: 1435, end: 1520}
    });

    expect(resultDay).toEqual({
      "12": {start: 300},
      "13": {start: 350},
      "14": {start: 400},
      "15": {start: 450}
    });
  });

  it('should get the calulated value of consumption each hours, day, month according to a type of range and return the serial of the product', () => {
    const resultYear = calculateRangeWrapperSerial(sampleConsumptions, 'abc-123');
    const resultMonth = calculateRangeWrapperSerial(sampleConsumptions, 'abc-123');
    const resultWeek = calculateRangeWrapperSerial(sampleConsumptions, 'abc-123');
    const resultDay = calculateRangeWrapperSerial(sampleConsumptions.slice(0, 5), 'abc-123'); // first day of the week sample

    expect(resultYear).toEqual({
      'abc-123': {"10": 1220}
    });

    expect(resultMonth).toEqual({
      'abc-123': {
        "13": 150,
        "14": 100,
        "15": 75,
        "16": 110,
        "17": 150,
        "18": 310,
        "19": 85
      }
    });

    expect(resultWeek).toEqual({
      'abc-123': {
        "0": 150,
        "1": 100,
        "2": 75,
        "3": 110,
        "4": 150,
        "5": 310,
        "6": 85
      }
    });

    expect(resultDay).toEqual({
      'abc-123': {
        "12": 0,
        "13": 50,
        "14": 50,
        "15": 50
      }
    });
  });

  it('should calculate an average value of consumption', () => {
    const resultMonth = getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions, 'abc-123');
    const result = calculateAverage(resultMonth);
    expect(result).toEqual({
      serial: 'abc-123',
      average: 154
    });
  });
});
