import express from "express";
import { sendInvite } from "../controllers/inviteUserController.js";

const router = express.Router();

router.post("/", sendInvite);

export default router