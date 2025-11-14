import express from "express";
import { registerUser, loginUser, logoutUser, updateUserProfile, forgotPassword, resetPassword, removeConnection } from "../controllers/userController.js";
import upload from "../config/multer.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const userRoutes = express.Router();

userRoutes.post("/register", upload.single("profileImage"), registerUser);

userRoutes.post("/login", loginUser);

userRoutes.post("/logout", logoutUser);

userRoutes.put("/profile", authMiddleware, upload.single("profileImage"), updateUserProfile);

userRoutes.post("/forgot-password", forgotPassword);

userRoutes.post("/reset-password/:token", resetPassword);

userRoutes.delete("/connections/:userId", authMiddleware, removeConnection);

export default userRoutes;