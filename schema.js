const Joi = require("joi");

// ---------------------
// Listing Validation
// ---------------------
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required().messages({
      "string.empty": "Title cannot be empty",
    }),
    price: Joi.number().required().min(0).messages({
      "number.base": "Price must be a number",
      "number.min": "Price cannot be negative",
      "any.required": "Price is required",
    }),
    description: Joi.string().required().messages({
      "string.empty": "Description cannot be empty",
    }),
    location: Joi.string().required().messages({
      "string.empty": "Location cannot be empty",
    }),
    country: Joi.string().required().messages({
      "string.empty": "Country cannot be empty",
    }),
    features: Joi.array().items(Joi.string()).default([]).messages({
      "array.base": "Features must be an array of strings",
    }),
  }).required(),
});

// ---------------------
// Review Validation
// ---------------------
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Name is required",
    }),
    rating: Joi.number().required().min(1).max(5).messages({
      "any.required": "Rating is required",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating cannot exceed 5",
    }),
    comment: Joi.string().required().messages({
      "string.empty": "Comment is required",
    }),
  }).required(),
});
