const yup = require('yup');

const validateBlog = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      titre: yup.string().required('Le titre est obligatoire'),
      contenu: yup.string().required('Le contenu est obligatoire'),
      auteur: yup.string().required('L’auteur est obligatoire'),
      categorie: yup.string(),
      image: yup.string().url('L’image doit être une URL valide').nullable(),
      tags: yup.array().of(yup.string()),
      status: yup
        .string()
        .oneOf(['publié', 'brouillon', 'archivé'])
        .default('publié'),
    });

    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    res.status(400).json({
      error: 'Validation échouée pour le blog',
      details: err.errors,
    });
  }
};

module.exports = validateBlog;
