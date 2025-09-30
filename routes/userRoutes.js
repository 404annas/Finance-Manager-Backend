import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/userController.js";
import upload from "../config/multer.js";

const userRoutes = express.Router();

userRoutes.post("/register", upload.single("file"), registerUser);

userRoutes.post("/login", loginUser);

userRoutes.post("/logout", logoutUser);

export default userRoutes;