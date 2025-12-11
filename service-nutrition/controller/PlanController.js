const PlanNutritionModel = require('../model/plannutrition');
const PlanService = require('../service/PlanService')


async function addPlan(req, res)  {
  console.log('PlanNutrition creation route accessed');
  try {
    const { nom_plan, objectif, duree } = req.body
    if (!nom_plan || !objectif || !duree) {
      return res.status(400).json({ error: 'nom_plan, objectif et duree sont requis' })
    }

    const plan = new PlanNutritionModel({nom_plan, objectif, duree })
    await plan.save()
    return res.status(201).json({ message: 'Plan nutrition créé', plan })
  } catch (err) {
      console.error('Erreur lors de la création du plan:', err)
      // Handle duplicate  error from MongoDB
      if (err && (err.code === 11000 || err.name === 'MongoServerError')) {
        return res.status(409).json({ error: 'plan already exists', details: err.keyValue })
      }
      return res.status(500).json({ error: 'Internal server error' })
  }
}
//  Récupérer tous les plans
async function getPlans (req, res) {
  try {
    const plans = await PlanNutritionModel.find()
    return res.status(200).json({ plans })
  } catch (err) {
    console.error('Erreur lors de la récupération des plans:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
// Supprimer un plan par nom
async function deletePlan (req, res)  {
  try {
    const result = await PlanNutritionModel.deleteOne({ nom_plan: req.params.nom_plan })
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Plan non trouvé' })
    }
    return res.status(200).json({ message: 'Plan supprimé avec succès' })
  } catch (err) {
    console.error('Erreur lors de la suppression du plan:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

//  Mettre à jour un plan (objectif, durée)
async function updatePlan (req, res) {
  try {
    const { objectif, duree } = req.body
    if (!objectif && !duree) {
      return res.status(400).json({ error: 'Au moins un champ (objectif ou duree) est requis pour la mise à jour' })
    }
    const result = await PlanNutritionModel.updateOne({ nom_plan: req.params.nom_plan }, { $set: { objectif, duree } })
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Plan not found' })
    }
    return res.status(200).json({ message: 'Plan updated' })
  } catch (err) {
    console.error('Error updating plan:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
async function getTotalCaloriesByPlan(req, res) {
  try {
    const { id_plan } = req.params
    const result = await PlanService.getTotalCaloriesByPlan(id_plan)
    return res.status(200).json(result)
  } catch (err) {
    console.error('Erreur lors du calcul des calories totales:', err)
    const status = err.status || 500
    const message = err.status ? err.message : 'Erreur interne du serveur'
    return res.status(status).json({ error: message })
  }
}


module.exports = { addPlan, getPlans, deletePlan, updatePlan, getTotalCaloriesByPlan  };
