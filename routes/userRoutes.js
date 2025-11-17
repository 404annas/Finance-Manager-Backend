import express from "express";
import { registerUser, loginUser, logoutUser, updateUserProfile, forgotPassword, resetPassword, removeConnection } from "../controllers/userController.js";
import upload from "../config/multer.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { apiLimiter, authLimiter } from "../middlewares/apiRateLimit.js";

const userRoutes = express.Router();

userRoutes.post("/register", authLimiter, upload.single("profileImage"), registerUser);

userRoutes.post("/login", authLimiter, loginUser);

userRoutes.post("/logout", apiLimiter, logoutUser);

userRoutes.put("/profile", apiLimiter, authMiddleware, upload.single("profileImage"), updateUserProfile);

userRoutes.post("/forgot-password", authLimiter, forgotPassword);

userRoutes.post("/reset-password/:token", authLimiter, resetPassword);

userRoutes.delete("/connections/:userId", apiLimiter, authMiddleware, removeConnection);

export default userRoutes;