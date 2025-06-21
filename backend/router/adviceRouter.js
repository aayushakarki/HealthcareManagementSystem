import express from "express";
import { getAdvice, askQuestion } from "../controller/adviceController.js";
import { isPatientAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Route to get initial advice based on heart data
router.post("/heart", isPatientAuthenticated, getAdvice);

// Route to ask a follow-up question
router.post("/heart/ask", isPatientAuthenticated, askQuestion);

export default router; 