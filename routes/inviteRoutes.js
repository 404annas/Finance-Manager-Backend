import express from "express";
import { deletePendingInvite, getPendingInvites, inviteUser } from "../controllers/inviteUser.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { apiLimiter, transactionLimiter } from "../middlewares/apiRateLimit.js";

const inviteRoute = express.Router();

inviteRoute.post("/invite", authMiddleware, transactionLimiter, inviteUser);

inviteRoute.get("/invites/pending", authMiddleware, apiLimiter, getPendingInvites);

inviteRoute.delete("/invites/pending/:inviteId", authMiddleware, transactionLimiter, deletePendingInvite);

export default inviteRoute;
