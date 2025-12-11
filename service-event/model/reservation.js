const mongo = require('mongoose');
const schema = mongo.Schema;

const Reservation = new schema({
  event: { type: schema.Types.ObjectId, ref: 'event' },
  fullName: String,
  email: String,
  phone: String,
  reservedAt: { type: Date, default: Date.now }
});

module.exports = mongo.model('reservation', Reservation);
