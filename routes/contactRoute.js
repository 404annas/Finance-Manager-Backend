import express from "express";
import { submitContact } from "../controllers/contactController.js";

const contactRoute = express.Router();

contactRoute.post("/contact", submitContact);

export default contactRoute;