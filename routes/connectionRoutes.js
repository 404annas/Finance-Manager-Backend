import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getPendingRequests, acceptRequest } from "../controllers/connectionController.js";

const connectionRoutes = express.Router();

connectionRoutes.get("/connection-requests", authMiddleware, getPendingRequests)

connectionRoutes.post("/connection-requests/:requestId/accept", authMiddleware, acceptRequest)

export default connectionRoutes;