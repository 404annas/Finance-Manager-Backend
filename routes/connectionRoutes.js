import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getPendingRequests, acceptRequest, getSentRequests, resendConnectionRequest } from "../controllers/connectionController.js";

const connectionRoutes = express.Router();

connectionRoutes.get("/connection-requests", authMiddleware, getPendingRequests);

connectionRoutes.get("/connection-requests/sent", authMiddleware, getSentRequests);

connectionRoutes.post("/connection-requests/:requestId/accept", authMiddleware, acceptRequest);

connectionRoutes.post("/connection-requests/resend", authMiddleware, resendConnectionRequest);

export default connectionRoutes;