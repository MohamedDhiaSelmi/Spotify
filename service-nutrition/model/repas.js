const mongoose = require('mongoose');
const schema= mongoose.Schema

const RepasSchema = new schema({
  nom_repas: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true,
  },
  proteines: {
    type: Number,
    required: true
  },
  glucides: {
    type: Number,
    required: true
  },
  lipides: {
    type: Number,
    required: true
  },
   id_plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'PlanNutrition',
    required: true
  }
});

module.exports = mongoose.model('Repas', RepasSchema);