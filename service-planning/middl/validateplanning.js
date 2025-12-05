const yup = require('yup');

const validatePlanning = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      date: yup
        .date()
        .typeError("La date doit être valide")
        .required("La date est obligatoire"),

      heureDebut: yup
        .string()
        .required("L'heure de début est obligatoire"),

      heureFin: yup
        .string()
        .required("L'heure de fin est obligatoire"),

      salle: yup
        .string()
        .matches(/^[A-Za-zÀ-ÿ0-9\s]+$/, "Le nom de la salle doit contenir uniquement des lettres, chiffres et espaces")
        .required("La salle est obligatoire"),

      statut: yup
        .string()
        .oneOf(["Programmé", "Annulé", "Terminé"], "Le statut doit être 'Programmé', 'Annulé' ou 'Terminé'")
        .required("Le statut est obligatoire"),

      id_cours: yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "L'id du cours doit être un ObjectId MongoDB valide")
        .required("L'id du cours est obligatoire"),
    });

    // Valider les données de base

    await schema.validate(req.body, { abortEarly: false });
    next();

  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
};

module.exports = validate;

module.exports = validatePlanning;
