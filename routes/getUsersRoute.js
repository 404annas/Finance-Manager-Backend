import express from "express";
import viewUsers from "../controllers/viewUsers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { apiLimiter } from "../middlewares/apiRateLimit.js";

const getUsersRoute = express.Router();

getUsersRoute.get("/users", authMiddleware, apiLimiter, viewUsers);

export default getUsersRoute;