const mongo = require('mongoose');
const schema = mongo.Schema;

const Event = new schema({
  title: String,
  description: String,
  date: Date,
  capacity: Number,
  location: String
});

module.exports = mongo.model('event', Event);