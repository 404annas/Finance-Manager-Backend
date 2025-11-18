import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { getPictureUploadSignature } from "../controllers/transactionsPictureUploadController.js";
import { apiLimiter } from "../middlewares/apiRateLimit.js";

const transactionPictureUploadRoute = express.Router();

transactionPictureUploadRoute.get("/upload-signature", authMiddleware, apiLimiter, getPictureUploadSignature);

export default transactionPictureUploadRoute;