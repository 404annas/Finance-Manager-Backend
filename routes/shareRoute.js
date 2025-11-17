import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createShare, deleteShare, getMyShares, getShareRecipients } from "../controllers/shareController.js";
import { apiLimiter, transactionLimiter } from "../middlewares/apiRateLimit.js";

const shareRoute = express.Router();

// Route to get the list of potential users to share with
shareRoute.get("/shares/recipients", authMiddleware, apiLimiter, getShareRecipients);

// Routes for creating and getting shares
shareRoute.route("/shares")
    .post(authMiddleware, transactionLimiter, createShare)
    .get(authMiddleware, apiLimiter, getMyShares);

shareRoute.delete("/shares/:id", authMiddleware, transactionLimiter, deleteShare);

export default shareRoute;