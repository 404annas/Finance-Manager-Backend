import express from "express";
import deleteUsers from "../controllers/deleteUsers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { transactionLimiter } from "../middlewares/apiRateLimit.js";

const deleteUserRoute = express.Router();

deleteUserRoute.delete("/delete-user/:id", authMiddleware, transactionLimiter, deleteUsers);

export default deleteUserRoute;