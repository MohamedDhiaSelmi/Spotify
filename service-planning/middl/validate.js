const yup = require('yup');

const validate = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      nom_cours: yup
        .string()
        .required("Le nom du cours est obligatoire"),
      description: yup
        .string()
        .required("La description est obligatoire"),
      duree: yup
        .number()
        .positive("La durée doit être positive")
        .required("La durée est obligatoire"),
      niveau: yup
        .string()
        .required("Le niveau est obligatoire"),
      type: yup
        .string()
        .oneOf(["Collectif", "Individuel"], "Le type doit être 'Collectif' ou 'Individuel'")
        .required("Le type est obligatoire"),
      statut: yup
        .string()
        .oneOf(["disponible", "No"], "Le statut doit être 'Actif' ou 'Inactif'")
        .required("Le statut est obligatoire")
    });

    await schema.validate(req.body, { abortEarly: false });
    next();

  } catch (err) {
    res.status(400).json({ errors: err.errors });
  }
};

module.exports = validate;
