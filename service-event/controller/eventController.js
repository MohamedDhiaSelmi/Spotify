const Event = require("../model/event");
const Reservation = require("../model/reservation");

// ----------------------
// CRUD EVENTS
// ----------------------

// Create
async function add(req, res) {
  try {
    const ev = new Event(req.body);
    await ev.save(); // 👈 important: await
    return res.status(200).json(ev);
  } catch (err) {
    console.error(err);
    return res.status(500).send("server error");
  }
}

// Read all
async function showevents(req, res) {
  try {
    const events = await Event.find().sort({ date: 1 });
    return res.status(200).json(events);
  } catch (err) {
    console.error(err);
    return res.status(500).send("server error");
  }
}

// Read one by id + count reservations
async function showeventbyid(req, res) {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).send("event not found");

    const count = await Reservation.countDocuments({ event: ev._id });
    return res
      .status(200)
      .json({ ...ev.toObject(), reservationsCount: count });
  } catch (err) {
    console.error(err);
    return res.status(500).send("server error");
  }
}

// Update
async function updateevent(req, res) {
  try {
    const ev = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!ev) return res.status(404).send("event not found");
    return res.status(200).json(ev);
  } catch (err) {
    console.error(err);
    return res.status(500).send("server error");
  }
}

// Delete + cascade delete reservations
async function deleteevent(req, res) {
  try {
    const ev = await Event.findByIdAndDelete(req.params.id);
    if (!ev) return res.status(404).send("event not found");

    await Reservation.deleteMany({ event: ev._id });
    return res.status(200).send("event deleted");
  } catch (err) {
    console.error(err);
    return res.status(500).send("server error");
  }
}

// ----------------------
// 📊 STATS EVENT
// ----------------------
async function getEventStats(req, res) {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const totalReservations = await Reservation.countDocuments({ event: id });

    const remainingCapacity = Math.max(event.capacity - totalReservations, 0);
    const occupancy =
      event.capacity > 0
        ? Math.round((totalReservations / event.capacity) * 100)
        : 0;

    const reservationsByDay = await Reservation.aggregate([
      { $match: { event: event._id } },
      {
        $group: {
          _id: {
            year: { $year: "$reservedAt" },
            month: { $month: "$reservedAt" },
            day: { $dayOfMonth: "$reservedAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          count: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    return res.status(200).json({
      event: {
        id: event._id,
        title: event.title,
        date: event.date,
        capacity: event.capacity,
        location: event.location,
      },
      stats: {
        totalReservations,
        remainingCapacity,
        occupancyPercentage: occupancy,
      },
      reservationsByDay,
    });
  } catch (err) {
    console.error("getEventStats error:", err);
    return res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération des stats." });
  }
}

// ----------------------
// EXPORTS
// ----------------------
module.exports = {
  add,
  showevents,
  showeventbyid,
  updateevent,
  deleteevent,
  getEventStats,
};
