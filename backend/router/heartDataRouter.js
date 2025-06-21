import express from "express";
import { addHeartDataForPatient, getLatestHeartData } from "../controller/heartDataController.js";
import { isDoctorAuthenticated, isPatientAuthenticated} from "../middlewares/auth.js";

const router = express.Router();

// Route for a doctor to add heart data for a patient
router.post("/add", isDoctorAuthenticated, addHeartDataForPatient);

// Route for a patient to get their latest heart data
router.get("/me", isPatientAuthenticated, getLatestHeartData);

export default router; 