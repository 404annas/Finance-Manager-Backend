import express from "express";
import { submitContact } from "../controllers/contactController.js";
import { emailLimiter } from "../middlewares/apiRateLimit.js";

const contactRoute = express.Router();

contactRoute.post("/contact", emailLimiter, submitContact);

export default contactRoute;