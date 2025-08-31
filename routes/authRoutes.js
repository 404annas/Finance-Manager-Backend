import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import parser from "../config/multer.js";

const router = express.Router();

router.post("/register", authMiddleware, parser.single("image"), registerUser);
router.post("/login", loginUser);

router.post("/logout", authMiddleware, logoutUser);

export default router;