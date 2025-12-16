const yup = require("yup");

const validateReservation = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      event: yup.string().required(),
      fullName: yup.string().trim().required(),
      email: yup.string().email().required(),
      phone: yup.string().trim().required()
    });

    await schema.validate(req.body);
    next();
  } catch (err) {
    res.status(404).json(err);
  }
};

module.exports = validateReservation;
