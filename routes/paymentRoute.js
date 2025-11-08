import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { addPayment, getPaymentsForShare, deletePayment, updatePayment } from "../controllers/paymentController.js";
import upload from "../config/multer.js";

// Recipients Payments Routes

const paymentRoute = express.Router()

paymentRoute.route("/shares/:shareId/payments")
    .post(authMiddleware, upload.single('image'), addPayment)
    .get(authMiddleware, getPaymentsForShare);

paymentRoute.route("/payments/:paymentId")
    .put(authMiddleware, upload.single('image'), updatePayment)
    .delete(authMiddleware, deletePayment);

export default paymentRoute;