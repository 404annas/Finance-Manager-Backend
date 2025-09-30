import express from "express";
import { inviteUser } from "../controllers/inviteUser.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const inviteRoute = express.Router();

inviteRoute.post("/invite", authMiddleware, isAdmin, inviteUser);

export default inviteRoute;
