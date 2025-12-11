const repasModel = require('../model/repas');

//Ajouter un repas
async function addRepas(req, res) {
  console.log('Repas creation route accessed');
  try {
    const { nom_repas, calories, proteines, glucides, lipides, id_plan } = req.body;

    if (!nom_repas || !calories || !proteines || !glucides || !lipides || !id_plan) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const repas = new repasModel({ nom_repas, calories, proteines, glucides, lipides, id_plan });
    await repas.save();

    return res.status(201).json({ message: 'Repas créé avec succès', repas });
  } catch (err) {
    console.error('Erreur lors de la création du repas:', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// Récupérer tous les repas
async function getRepas(req, res) {
  try {
    const repas = await repasModel.find().populate('id_plan', 'nom_plan objectif');
    return res.status(200).json({ repas });
  } catch (err) {
    console.error('Erreur lors de la récupération des repas:', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// Supprimer un repas par nom
async function deleteRepas(req, res) {
  try {
    const result = await repasModel.deleteOne({ nom_repas: req.params.nom_repas });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Repas non trouvé' });
    }
    return res.status(200).json({ message: 'Repas supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du repas:', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// Mettre à jour un repas
async function updateRepas(req, res) {
  try {
    const { calories, proteines, glucides, lipides, nom_repas } = req.body;

    if (!calories && !proteines && !glucides && !lipides) {
      return res.status(400).json({ error: 'Au moins un champ est requis pour la mise à jour' });
    }

    const result = await repasModel.updateOne(
      { nom_repas: req.params.nom_repas },
      { $set: { nom_repas, calories, proteines, glucides, lipides } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Repas non trouvé' });
    }

    return res.status(200).json({ message: 'Repas mis à jour avec succès' });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du repas:', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

async function searchRepasByNutriment(req, res) {
  try {
    const { nutriment, min, max } = req.query;

    // Vérification des paramètres
    if (!nutriment || (!min && !max)) {
      return res.status(400).json({ error: 'nutriment et min/max sont requis' });
    }

    // Liste des champs autorisés
    const champsAutorises = ['calories', 'proteines', 'glucides', 'lipides'];
    if (!champsAutorises.includes(nutriment)) {
      return res.status(400).json({ error: 'Nutriment invalide' });
    }

    // Construction du filtre MongoDB
    const filtre = {};
    filtre[nutriment] = {};
    if (min) filtre[nutriment]['$gte'] = Number(min);
    if (max) filtre[nutriment]['$lte'] = Number(max);

    // Requête
    const repasTrouves = await repasModel.find(filtre);

    if (repasTrouves.length === 0) {
      return res.status(404).json({ message: 'Aucun repas trouvé' });
    }

    return res.status(200).json({ results: repasTrouves });
  } catch (err) {
    console.error('Erreur lors de la recherche de repas par nutriment:', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
} 

/////////
async function getRepasSuggestion(req, res) {
  try {
    const objectif = parseFloat(req.query.objectif);

    if (!objectif || objectif <= 0) {
      return res.status(400).json({ error: 'Veuillez fournir un objectif calorique valide.' });
    }

    // Cherche les repas proches de l’objectif (± 100 kcal)
    const repasProches = await repasModel.find({
      calories: { $gte: objectif - 100, $lte: objectif + 100 }
    });

    if (repasProches.length === 0) {
      return res.status(404).json({
        message: "Aucun repas trouvé proche de cet objectif calorique 😕"
      });
    }

    // Choisit un repas aléatoire parmi ceux trouvés
    const repasChoisi = repasProches[Math.floor(Math.random() * repasProches.length)];

    return res.status(200).json({
      nom_repas: repasChoisi.nom_repas,
      calories: repasChoisi.calories,
      message: "Repas adapté à votre objectif calorique 👌"
    });
  } catch (err) {
    console.error('Erreur lors de la suggestion de repas:', err);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
/////////////
module.exports = { addRepas, getRepas, deleteRepas, updateRepas, searchRepasByNutriment, getRepasSuggestion };
