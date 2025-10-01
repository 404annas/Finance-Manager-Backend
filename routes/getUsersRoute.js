import express from "express";
import viewUsers from "../controllers/viewUsers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const getUsersRoute = express.Router();

getUsersRoute.get("/users", authMiddleware, viewUsers);

export default getUsersRoute;