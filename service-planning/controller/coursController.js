const CoursModel = require('../model/cours');


async function addCours(req, res)  {
  console.log('Cours creation route accessed');
  try {
    const { nom_cours, description, duree, niveau, type, statut } = req.body
    if (!nom_cours || !description || !duree || !niveau || !type || !statut ) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const cours = new CoursModel({ nom_cours, description, duree, niveau, type, statut })
    await cours.save()
    return res.status(201).json({ message: 'Cours created', cours })
  } catch (err) {
      console.error('Error creating cours:', err)
      if (err && (err.code === 11000 || err.name === 'MongoServerError')) {
        return res.status(409).json({ error: 'Cours already exists', details: err.keyValue })
      }
      return res.status(500).json({ error: 'Internal server error' })
  }
}

async function getCours (req, res) {
  try {
    const cours = await CoursModel.find()
    return res.status(200).json({ cours })
  } catch (err) {
    console.error('Error fetching cours:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function deleteCours (req, res)  {
  try {
    const result = await CoursModel.deleteOne({ nom_cours: req.params.nom_cours })
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Cours not found' })
    }
    return res.status(200).json({ message: 'Cours deleted' })
  } catch (err) {
    console.error('Error deleting cours:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function updateCours (req, res) {
  try {
    const { nom_cours, description, duree, niveau, type, statut } = req.body
    if (!nom_cours && !description && !duree && !niveau && !type && !statut) {
      return res.status(400).json({ error: ' required to update' })
    }
    const result = await CoursModel.updateOne({ nom_cours: req.params.nom_cours }, { $set: { nom_cours, description, duree, niveau, type, statut  } })
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Cour not found' })
    }
    return res.status(200).json({ message: ' Cours updated' })
  } catch (err) {
    console.error('Error updating user:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
async function getCoursByName(req, res) {
  try {
    const nom = req.params.nom; // on récupère le nom du cours depuis l'URL
    const cours = await CoursModel.findOne({ nom_cours: nom });

    if (!cours) {
      return res.status(404).json({ message: `Cours '${nom}' non trouvé.` });
    }

    return res.status(200).json(cours);
  } catch (err) {
    console.error('Error fetching cours by name:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
async function getCoursSortedByName(req, res) {
  try {
    const cours = await CoursModel.find().sort({ nom_cours: 1 }); // 1 = ordre croissant, -1 = décroissant
    return res.status(200).json({ cours });
  } catch (err) {
    console.error('Error fetching sorted courses:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { addCours, getCours, deleteCours, updateCours, getCoursByName, getCoursSortedByName}
