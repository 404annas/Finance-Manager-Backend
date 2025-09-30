import express from "express";
import deleteUsers from "../controllers/deleteUsers.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const deleteUserRoute = express.Router();

deleteUserRoute.delete("/delete-user/:id", authMiddleware, isAdmin, deleteUsers);

export default deleteUserRoute;