import express from "express";
import { deletePendingInvite, getPendingInvites, inviteUser } from "../controllers/inviteUser.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const inviteRoute = express.Router();

inviteRoute.post("/invite", authMiddleware, inviteUser);

inviteRoute.get("/invites/pending", authMiddleware, getPendingInvites);

inviteRoute.delete("/invites/pending/:inviteId", authMiddleware, deletePendingInvite);

export default inviteRoute;
