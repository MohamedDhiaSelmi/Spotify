const yup = require('yup');

const validateRepas = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      nom_repas: yup.string().required('Le nom du repas est requis'),
      calories: yup
        .number()
        .required('Les calories sont requises')
        .positive('Les calories doivent être un nombre positif'),
      proteines: yup
        .number()
        .required('La quantité de protéines est requise')
        //minimum allowed value is 0
        .min(0),
      glucides: yup
        .number()
        .required('La quantité de glucides est requise')
        .min(0),
      lipides: yup
        .number()
        .required('La quantité de lipides est requise')
        .min(0),
      id_plan: yup.string().required('L’identifiant du plan est requis')
    });

    await schema.validate(req.body)
    next();

  } catch (err) {
    res.status(404).json(err)
  }
};

module.exports = validateRepas;
