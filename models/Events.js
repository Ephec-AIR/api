const mongoose = require('../mongoose');

const EventSchema = new mongoose.Schema({
  // date of the event
  date: {
    type: Date,
    required: true,
    expires: 0 // document expire when finished
  },
  // place of the event (ex: 74 Union Terrace, London, United Kingdom)
  place: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String
  }
});

const Events = mongoose.model('Events', EventSchema);
module.exports = Events;
