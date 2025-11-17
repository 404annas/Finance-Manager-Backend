import express from "express";
import { addPaymentDone, getAllPaymentsDone, deletePayment, deleteAllPayments } from "../controllers/paymentsDone.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { apiLimiter, transactionLimiter } from "../middlewares/apiRateLimit.js";

const paymentsDoneRoute = express.Router();

paymentsDoneRoute.post("/payments-done", authMiddleware, transactionLimiter, addPaymentDone);
paymentsDoneRoute.get("/payments-done", authMiddleware, apiLimiter, getAllPaymentsDone);
paymentsDoneRoute.delete("/payments-done/:id", authMiddleware, transactionLimiter, deletePayment);
paymentsDoneRoute.delete("/payments-done", authMiddleware, transactionLimiter, deleteAllPayments);

export default paymentsDoneRoute;