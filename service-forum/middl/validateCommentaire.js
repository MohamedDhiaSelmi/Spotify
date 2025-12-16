const yup = require('yup');

const validateCommentaire = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      auteurC: yup.string().required('Le nom de l’auteur est obligatoire'),
      description: yup
        .string()
        .required('Le contenu du commentaire est obligatoire')
        .min(2, 'Le commentaire doit contenir au moins 2 caractères'),
    });

    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    res.status(400).json({
      error: 'Validation échouée pour le commentaire',
      details: err.errors,
    });
  }
};

module.exports = validateCommentaire;
