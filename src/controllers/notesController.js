 import createHttpError from "http-errors";
import { Note } from "../models/note.js";

export const getAllNotes = async (req, res) => {
  const {
     page = 1,
     perPage = 10,
     tag,
     search,
    } = req.query;

const limit = Number(perPage);
const skip = (Number(page) - 1) * limit;
let query = Note.find().where("userId").equals(req.user._id);

  if (tag) {
    query = query.where("tag").equals(tag);
  }

  if (search) {
    query = query.or([
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ]);
  }

  const [totalNotes, notes] = await Promise.all([
    query.clone().countDocuments(),
    query.skip(skip).limit(limit).lean(),
  ]);

  const totalPages = Math.ceil(totalNotes / limit);

  res.status(200).json({
    page: Number(page),
    perPage: limit,
    totalNotes,
    totalPages,
    notes,
  });
};

export const getNoteById = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOne({
    _id: noteId,
    userId: req.user._id,
  });

  if (!note) {
    throw createHttpError(404, "Note not found");
  }
  res.status(200).json(note);
};

export const createNote = async (req, res) => {
  const note = await Note.create({
    ...req.body,
    userId: req.user._id,
});
  res.status(201).json(note);
};

export const deleteNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndDelete({_id: noteId,
    userId: req.user._id,
  });

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};

export const updateNote = async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndUpdate({ _id: noteId,
    userId: req.user._id}, req.body, { returnDocument: "after",

  });

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  res.status(200).json(note);
};
