const {subYears, subMonths, subWeeks, subDays} = require('date-fns'); // date helpers

// functions
const {
  subtractAccordingToType,
  getRangeIndex,
  getConsumptionAccordingToType,
  getConsumptionAccordingToTypeWrapperSerial,
  calculatePrice,
  calculateAndPredictPriceIfNeeded,
  calculateRange,
  calculateRangeWrapperSerial,
  matching,
  calculateAverage,
  calculateAverageWrapperSerial
} = require('../controllers/consumption');

const {hardcoded: sampleConsumptions} = require('../data'); // data

describe('[UNIT TEST] get consumption functions', () => {
  it('should subtract a date according to a type of range (year, month, week, day)', () => {
    const d = new Date();

    const yearSubtract = subtractAccordingToType(d, 'year');
    const monthSubtract = subtractAccordingToType(d, 'month');
    const weekSubtract = subtractAccordingToType(d, 'week');
    const daySubtract = subtractAccordingToType(d, 'day');

    expect(yearSubtract.getTime()).toBe(subYears(d, 1).getTime());
    expect(monthSubtract.getTime()).toBe(subMonths(d, 1).getTime());
    expect(weekSubtract.getTime()).toBe(subWeeks(d, 1).getTime());
    expect(daySubtract.getTime()).toBe(subDays(d, 1).getTime());
  });

  it('should get an index (day, week, hour) according to a type of range (year, month, week, day)', () => {
    const yearIndex = getRangeIndex(new Date(), 'year');
    const monthIndex = getRangeIndex(new Date(), 'month');
    const weekIndex = getRangeIndex(new Date(), 'week');
    const dayIndex = getRangeIndex(new Date(), 'day');

    expect(yearIndex).toBe(new Date().getMonth());
    expect(monthIndex).toBe(new Date().getDate());
    expect(weekIndex).toBe(new Date().getDay()); // first day begins sunday in date api
    expect(dayIndex).toBe(new Date().getHours());
  });

  it('should get get the start and end value of a consumption each hours, day, month according to a type of range', () => {
    const resultYear = getConsumptionAccordingToType(sampleConsumptions, 'year');
    const resultMonth = getConsumptionAccordingToType(sampleConsumptions, 'month');
    const resultWeek = getConsumptionAccordingToType(sampleConsumptions, 'week');
    const resultDay = getConsumptionAccordingToType(sampleConsumptions.slice(0, 4), 'day'); // first day of the week sample

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
      "1": {start: 300, end: 450},
      "2": {start: 510, end: 610},
      "3": {start: 630, end: 705},
      "4": {start: 710, end: 820},
      "5": {start: 850, end: 1000},
      "6": {start: 1100, end: 1410},
      "0": {start: 1435, end: 1520}
    });

    expect(resultDay).toEqual({
      "12": {start: 300},
      "13": {start: 350},
      "14": {start: 400},
      "15": {start: 450}
    });
  });

  it('should get the calulated value of consumption each hours, day, month according to a type of range', () => {
    const resultYear = calculateRange(getConsumptionAccordingToType(sampleConsumptions, 'year'));
    const resultMonth = calculateRange(getConsumptionAccordingToType(sampleConsumptions, 'month'));
    const resultWeek = calculateRange(getConsumptionAccordingToType(sampleConsumptions, 'week'));
    const resultDay = calculateRange(getConsumptionAccordingToType(sampleConsumptions.slice(0, 4), 'day')); // first day of the week sample

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
      "1": 150,
      "2": 100,
      "3": 75,
      "4": 110,
      "5": 150,
      "6": 310,
      "0": 85
    });

    expect(resultDay).toEqual({
      "12": 0,
      "13": 50,
      "14": 50,
      "15": 50
    });
  });

  it('should get get the start and end value of a consumption each hours, day, month according to a type of range and return the serial of the product', () => {
    const resultYear = getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions, 'year', 'abc-123');
    const resultMonth = getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions, 'month', 'abc-123');
    const resultWeek = getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions, 'week', 'abc-123');
    const resultDay = getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions.slice(0, 4), 'day', 'abc-123'); // first day of the week sample

    expect(resultYear).toEqual({
      serial: 'abc-123',
      values: {
        "10": {start: 300, end: 1520}
      }
    });

    expect(resultMonth).toEqual({
      serial: 'abc-123',
      values: {
        "13": {start: 300, end: 450},
        "14": {start: 510, end: 610},
        "15": {start: 630, end: 705},
        "16": {start: 710, end: 820},
        "17": {start: 850, end: 1000},
        "18": {start: 1100, end: 1410},
        "19": {start: 1435, end: 1520}
      }
    });

    expect(resultWeek).toEqual({
      serial: 'abc-123',
      values: {
        "1": {start: 300, end: 450},
        "2": {start: 510, end: 610},
        "3": {start: 630, end: 705},
        "4": {start: 710, end: 820},
        "5": {start: 850, end: 1000},
        "6": {start: 1100, end: 1410},
        "0": {start: 1435, end: 1520}
      }
    });

    expect(resultDay).toEqual({
      serial: 'abc-123',
      values: {
        "12": {start: 300},
        "13": {start: 350},
        "14": {start: 400},
        "15": {start: 450}
      }
    });
  });

  it('should get the calulated value of consumption each hours, day, month according to a type of range and return the serial of the product', () => {
    const resultYear = calculateRangeWrapperSerial(getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions, 'year', 'abc-123'));
    const resultMonth = calculateRangeWrapperSerial(getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions, 'month', 'abc-123'));
    const resultWeek = calculateRangeWrapperSerial(getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions, 'week', 'abc-123'));
    const resultDay = calculateRangeWrapperSerial(getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions.slice(0, 4), 'day', 'abc-123')); // first day of the week sample

    expect(resultYear).toEqual({
      serial: 'abc-123',
      values: {
        "10": 1220
      }
    });

    expect(resultMonth).toEqual({
      serial: 'abc-123',
      values: {
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
      serial: 'abc-123',
      values: {
        "1": 150,
        "2": 100,
        "3": 75,
        "4": 110,
        "5": 150,
        "6": 310,
        "0": 85
      }
    });

    expect(resultDay).toEqual({
      serial: 'abc-123',
      values: {
        "12": 0,
        "13": 50,
        "14": 50,
        "15": 50
      }
    });
  });

  it('should calculate an average value of consumption', () => {
    const resultMonth = calculateRangeWrapperSerial(getConsumptionAccordingToTypeWrapperSerial(sampleConsumptions, 'month', 'abc-123'));
    const result = calculateAverageWrapperSerial(resultMonth);

    expect(result).toEqual({
      serial: 'abc-123',
      average: 140
    });
  });
});
