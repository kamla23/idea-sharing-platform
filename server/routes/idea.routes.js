import express from "express";
import { createIdea, getIdeas, toggleLikeIdea, addComment,updateIdea , deleteIdea } from "../controllers/idea.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createIdea);       // POST /api/ideas (Idea banana)
router.get("/", getIdeas);                   // GET /api/ideas (Saare ideas dekhna)
router.put("/:id/like", protect, toggleLikeIdea); // PUT /api/ideas/:id/like (Like/Unlike)
router.post("/:id/comment", protect, addComment); // POST /api/ideas/:id/comment (Comment karna)
router.put('/:id', protect, updateIdea);
router.delete('/:id', protect, deleteIdea);

export default router;