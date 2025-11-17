import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addPayment, getPaymentsForShare, deletePayment, updatePayment } from "../controllers/paymentController.js";
import upload from "../config/multer.js";
import { apiLimiter, transactionLimiter } from "../middlewares/apiRateLimit.js";

// Recipients Payments Routes

const paymentRoute = express.Router()

paymentRoute.route("/shares/:shareId/payments")
    .post(authMiddleware, upload.single('image'), transactionLimiter, addPayment)
    .get(authMiddleware, apiLimiter, getPaymentsForShare);

paymentRoute.route("/payments/:paymentId")
    .put(authMiddleware, upload.single('image'), transactionLimiter, updatePayment)
    .delete(authMiddleware, transactionLimiter, deletePayment);

export default paymentRoute;