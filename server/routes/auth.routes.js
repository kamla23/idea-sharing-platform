import express from "express";
import { signup, login ,getMe,logout} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);


router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});
router.get("/me", protect, getMe);
router.post('/logout', logout);
export default router;  
