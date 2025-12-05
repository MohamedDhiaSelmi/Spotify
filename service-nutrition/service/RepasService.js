const RepasModel = require('../model/repas')
const PlanNutritionModel = require('../model/plannutrition')

async function createRepas({ nom_repas, calories, proteines, glucides, lipides, id_plan }) {
  if (!nom_repas || !calories || !proteines || !glucides || !lipides || !id_plan) {
    const err = new Error('Tous les champs sont requis')
    err.status = 400
    throw err
  }

  const plan = await PlanNutritionModel.findById(id_plan)
  if (!plan) {
    const err = new Error('Plan non trouvé')
    err.status = 404
    throw err
  }

  const repas = new RepasModel({ nom_repas, calories, proteines, glucides, lipides, id_plan })
  return await repas.save()
}

async function listRepas() {
  return await RepasModel.find().populate('id_plan', 'nom_plan objectif')
}

async function deleteByNom(nom_repas) {
  const result = await RepasModel.deleteOne({ nom_repas })
  return result.deletedCount
}

async function updateByNom(nom_repas_param, { nom_repas, calories, proteines, glucides, lipides }) {
  if (!calories && !proteines && !glucides && !lipides && !nom_repas) {
    const err = new Error('Au moins un champ est requis pour la mise à jour')
    err.status = 400
    throw err
  }
  const result = await RepasModel.updateOne(
    { nom_repas: nom_repas_param },
    { $set: { nom_repas, calories, proteines, glucides, lipides } }
  )
  return result.modifiedCount
}

module.exports = {
  createRepas,
  listRepas,
  deleteByNom,
  updateByNom
}


