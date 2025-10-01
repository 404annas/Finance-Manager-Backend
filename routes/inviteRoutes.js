import express from "express";
import { inviteUser } from "../controllers/inviteUser.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const inviteRoute = express.Router();

inviteRoute.post("/invite", authMiddleware, inviteUser);

export default inviteRoute;
