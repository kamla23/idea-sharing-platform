import express from "express";
import { createIdea, getIdeas, toggleLikeIdea, addComment,updateIdea , deleteIdea } from "../controllers/idea.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createIdea);       
router.get("/", getIdeas);                  
router.put("/:id/like", protect, toggleLikeIdea); 
router.post("/:id/comment", protect, addComment); 
router.put('/:id', protect, updateIdea);
router.delete('/:id', protect, deleteIdea);

export default router;