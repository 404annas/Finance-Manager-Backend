import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getPendingRequests, acceptRequest, getSentRequests, resendConnectionRequest } from "../controllers/connectionController.js";
import { apiLimiter, transactionLimiter } from "../middlewares/apiRateLimit.js";

const connectionRoutes = express.Router();

connectionRoutes.get("/connection-requests", authMiddleware, apiLimiter, getPendingRequests);

connectionRoutes.get("/connection-requests/sent", authMiddleware, transactionLimiter, getSentRequests);

connectionRoutes.post("/connection-requests/:requestId/accept", transactionLimiter, authMiddleware, acceptRequest);

connectionRoutes.post("/connection-requests/resend", authMiddleware, transactionLimiter, resendConnectionRequest);

export default connectionRoutes;