const Joi = require("joi");
const registrationSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
}).with("email", "password");

const RigistrationValidate = async (body) => {
  let value = { complete: true };
  try {
    value.model = await registrationSchema.validateAsync(body);
  } catch (err) {
    value = {
      complete: false,
      model: {
        message: err.message,
      },
    };
  }
  return value;
};

module.exports = {
  RigistrationValidate,
};
