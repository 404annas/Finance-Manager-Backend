import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addPayment, getPaymentsForShare, deletePayment } from "../controllers/paymentController.js";

const paymentRoute = express.Router()

paymentRoute.route("/shares/:shareId/payments")
    .post(authMiddleware, addPayment)
    .get(authMiddleware, getPaymentsForShare);

paymentRoute.delete("/payments/:paymentId", authMiddleware, deletePayment);

export default paymentRoute;