import { Segments, Joi } from "celebrate";
import { TAGS } from "../constants/tags.js";
import { isValidObjectId } from "mongoose";

export const getAllNotesSchema = {
[Segments.QUERY]: Joi.object({
  page: Joi.number().integer().min(1),
  perPage: Joi.number().integer().min(5).max(20),
  tag: Joi.string().valid(...TAGS),
  search:Joi.string().trim().allow(""),
}),
};
export const createNoteSchema = {
[Segments.BODY]: Joi.object({
  title: Joi.string().min(1).max(50).required(),
  content: Joi.string().allow("").max(100),
  tag: Joi.string().valid(...TAGS),
})
};

const objectValidator = (value, helpers) => {
  if(isValidObjectId(value)) {
    return value;
  }
  return helpers.message ("Invalid note id!");
};

export const noteIdParamSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectValidator).required()
  }),
};

export const updateNoteSchema = {
 [Segments.BODY]: Joi.object({
  title: Joi.string().min(3).max(50),
  content: Joi.string().min(3).max(500),
  tag: Joi.string().valid("Work", "Personal","Meeting","Shopping","Ideas","Travel","Finance","Health","Important","Todo"),
}). min(1),
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectValidator).required()
  }),
};
