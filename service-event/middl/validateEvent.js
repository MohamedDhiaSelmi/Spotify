const yup = require("yup");

const validateEvent = async (req, res, next) => {
  try {
    const schema = yup.object().shape({
      title: yup.string().trim().required(),
      description: yup.string().trim().required().default(""),
      date: yup.date().required(),
      capacity: yup.number().integer().min(1).required(),
      location: yup.string().trim().required().default("")
    });

    await schema.validate(req.body);
    next();
  } catch (err) {
    res.status(404).json(err);
  }
};

module.exports = validateEvent;
