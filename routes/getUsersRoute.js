import express from "express";
import viewUsers from "../controllers/viewUsers.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const getUsersRoute = express.Router();

getUsersRoute.get("/users", authMiddleware, isAdmin, viewUsers);

export default getUsersRoute;