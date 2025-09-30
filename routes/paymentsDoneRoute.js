import express from "express";
import { addPaymentDone, getAllPaymentsDone, deletePayment, deleteAllPayments } from "../controllers/paymentsDone.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const paymentsDoneRoute = express.Router();

paymentsDoneRoute.post("/payments-done", authMiddleware, addPaymentDone);
paymentsDoneRoute.get("/payments-done", authMiddleware, getAllPaymentsDone);
paymentsDoneRoute.delete("/payments-done/:id", authMiddleware, deletePayment);
paymentsDoneRoute.delete("/payments-done", authMiddleware, deleteAllPayments);

export default paymentsDoneRoute;