const PlanNutritionModel = require('../model/plannutrition')
const RepasModel = require('../model/repas')

async function createPlan({ nom_plan, objectif, duree }) {
  if (!nom_plan || !objectif || !duree) {
    const err = new Error('nom_plan, objectif et duree sont requis')
    err.status = 400
    throw err
  }

  const plan = new PlanNutritionModel({ nom_plan, objectif, duree })
  return await plan.save()
}

async function listPlans() {
  return await PlanNutritionModel.find()
}

async function deleteByNom(nom_plan) {
  const result = await PlanNutritionModel.deleteOne({ nom_plan })
  return result.deletedCount
}

async function updateByNom(nom_plan, { objectif, duree }) {
  if (!objectif && !duree) {
    const err = new Error('Au moins un champ (objectif ou duree) est requis pour la mise à jour')
    err.status = 400
    throw err
  }
  const result = await PlanNutritionModel.updateOne(
    { nom_plan },
    { $set: { objectif, duree } }
  )
  return result.modifiedCount
}

async function getTotalCaloriesByPlan(id_plan) {
  const plan = await PlanNutritionModel.findById(id_plan)
  if (!plan) {
    const err = new Error('Plan non trouvé')
    err.status = 404
    throw err
  }

  const repas = await RepasModel.find({ id_plan })
  const totalCalories = repas.reduce((acc, r) => acc + (r.calories || 0), 0)

  return {
    id_plan,
    nom_plan: plan.nom_plan,
    calories_totales: totalCalories,
    a_repas: repas.length > 0
  }
}

module.exports = {
  createPlan,
  listPlans,
  deleteByNom,
  updateByNom,
  getTotalCaloriesByPlan
}


