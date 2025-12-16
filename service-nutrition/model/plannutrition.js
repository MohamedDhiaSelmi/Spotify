const mongoose = require('mongoose');
const schema= mongoose.Schema

const PlanNutrition = new schema({
  nom_plan: {
    type: String,
    required: true,
    unique: true
  },
  objectif: {
    type: String,
    required: true,
  },
  duree: {
    type: Number,
    required: true
  },
   date_creation: {
    type: Date,
    default : Date.now
  }
});

module.exports = mongoose.model('PlanNutrition', PlanNutrition);