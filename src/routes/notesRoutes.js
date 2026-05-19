import { Router } from "express";
import { celebrate } from "celebrate";
import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from "../controllers/notesController.js";
import {
  getAllNotesSchema,
  createNoteSchema,
  noteIdParamSchema,
  updateNoteSchema,
 } from "../validations/notesValidation.js";

const router = Router();

router.get("/notes", celebrate (getAllNotesSchema), getAllNotes);
router.get("/notes/:noteId", celebrate(noteIdParamSchema), getNoteById);
router.post("/notes", celebrate(createNoteSchema), createNote);
router.delete("/notes/:noteId", celebrate (noteIdParamSchema), deleteNote);
router.patch("/notes/:noteId", celebrate(updateNoteSchema), updateNote);

export default router;
