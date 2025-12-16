const Reservation = require("../model/reservation");
const Event = require("../model/event");

async function add(req, res) {
  try {
    const { event, email } = req.body;

    const ev = await Event.findById(event);
    if (!ev) return res.status(404).send("event not found");

    const current = await Reservation.countDocuments({ event });
    if (current >= ev.capacity) return res.status(400).send("event is full");

    const already = await Reservation.findOne({ event, email });
    if (already) return res.status(400).send("you already reserved for this event");

    const r = new Reservation(req.body);
    r.save();
    res.status(200).json(r);
  } catch (err) {
    console.log(err);
  }
}

async function showByEvent(req, res) {
  try {
    const list = await Reservation.find({ event: req.params.eventId }).sort({ reservedAt: -1 });
    res.status(200).json(list);
  } catch (err) {
    console.log(err);
  }
}

async function cancel(req, res) {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.status(200).send("reservation canceled");
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  add,
  showByEvent,
  cancel,
};
