const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const planning = new Schema({
  date: {
    type: Date,
    required: true,
  },
  heureDebut: {
    type: String, // ou Date si tu veux stocker l'heure complète
    required: true,
  },
  heureFin: {
    type: String,
    required: true,
  },
  salle: {
    type: String,
    required: true,
  },
  statut: {
    type: String,
    required: true,
  },
  id_cours: {
    type: Schema.Types.ObjectId,
    ref: 'Cours',
    required: true, // si chaque planning doit obligatoirement avoir un cours
  },
});

module.exports = mongoose.model('Planning', planning);
