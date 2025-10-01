import express from "express";
import deleteUsers from "../controllers/deleteUsers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const deleteUserRoute = express.Router();

deleteUserRoute.delete("/delete-user/:id", authMiddleware, deleteUsers);

export default deleteUserRoute;