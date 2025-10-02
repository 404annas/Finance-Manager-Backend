import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createShare, deleteShare, getMyShares, getShareRecipients } from "../controllers/shareController.js";

const shareRoute = express.Router();

// Route to get the list of potential users to share with
shareRoute.get("/shares/recipients", authMiddleware, getShareRecipients);

// Routes for creating and getting shares
shareRoute.route("/shares")
    .post(authMiddleware, createShare)
    .get(authMiddleware, getMyShares);

shareRoute.delete("/shares/:id", authMiddleware, deleteShare);

export default shareRoute;