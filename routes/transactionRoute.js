import express from "express";
import { createTransaction, getUserTransactions, deleteTransaction, deleteAllTransactions } from "../controllers/transactionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";

const transactionRoute = express.Router();

transactionRoute.post("/transactions", authMiddleware, upload.single("image"), createTransaction);
transactionRoute.get("/transactions", authMiddleware, getUserTransactions);
transactionRoute.delete("/transactions/:id", authMiddleware, deleteTransaction);
transactionRoute.delete("/transactions", authMiddleware, deleteAllTransactions);

export default transactionRoute;