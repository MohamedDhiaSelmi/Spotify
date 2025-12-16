const PlanningModel = require('../model/planning');

async function addPlanning(req, res) {
  try {
    const { date, heureDebut, heureFin, salle, statut, id_cours } = req.body;

    const planning = new PlanningModel({ date, heureDebut, heureFin, salle, statut, id_cours });
    await planning.save();
    return res.status(201).json({ message: 'Planning created', planning });
  } catch (err) {
    console.error('Error creating planning:', err);
    if (err && (err.code === 11000 || err.name === 'MongoServerError')) {
      return res.status(409).json({ error: 'Planning already exists', details: err.keyValue });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getPlanning(req, res) {
  try {
    const planning = await PlanningModel.find().populate('id_cours', 'nom'); // jointure avec le cours
    return res.status(200).json({ planning });
  } catch (err) {
    console.error('Error fetching planning:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deletePlanning(req, res) {
  try {
    const result = await PlanningModel.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Planning not found' });
    }
    return res.status(200).json({ message: 'Planning deleted' });
  } catch (err) {
    console.error('Error deleting planning:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updatePlanning(req, res) {
  try {
    const { date, heureDebut, heureFin, salle, statut, id_cours } = req.body;

    const result = await PlanningModel.updateOne(
      { _id: req.params.id },
      { $set: { date, heureDebut, heureFin, salle, statut, id_cours } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Planning not found' });
    }
    return res.status(200).json({ message: 'Planning updated' });
  } catch (err) {
    console.error('Error updating planning:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
  
}
async function filterPlanning(req, res) {
  try {
    const { statut, salle } = req.query;
    const filter = {};
    if (statut) filter.statut = statut;
    if (salle) filter.salle = salle;

    const plannings = await PlanningModel.find(filter).populate('id_cours', 'nom_cours');
    if (!plannings.length) {
      return res.status(404).json({ message: 'Aucun planning trouvé pour ces critères.' });
    }

    return res.status(200).json(plannings);
  } catch (err) {
    console.error('Error filtering plannings:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


module.exports = { addPlanning, getPlanning, deletePlanning, updatePlanning, filterPlanning };
