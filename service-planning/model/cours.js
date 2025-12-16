const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Cours = new Schema({
  nom_cours: {
    type: String,
    required: true,
    unique: true, 
  },
  description: {
    type: String,
    required: true,
  },
  duree: {
    type: Number, 
    required: true,
  },
  niveau: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  statut: {
    type: String,
  
  },
}, { timestamps: true });

module.exports = mongoose.model('Cours', Cours);
