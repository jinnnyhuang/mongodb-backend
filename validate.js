// const Joi = require("joi");
import Joi from "joi";

export const createUserValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().min(8).max(255).required(),
    name: Joi.string().min(3).max(50).required(),
    // 允許空值，但輸入時長度必須為 10
    phone: Joi.string().optional().allow("").min(10).max(10),
  });
  return schema.validate(data);
};

export const loginUserValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().min(8).max(255).required(),
  });
  return schema.validate(data);
};

export const updateUserValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    phone: Joi.string().optional().allow("").min(10).max(10),
  });
  return schema.validate(data);
};

// module.exports.createUserValidation = createUserValidation;
// module.exports.loginUserValidation = loginUserValidation;
