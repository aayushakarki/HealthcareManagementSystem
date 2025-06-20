import express from "express"
import {
  getVitalsHistory,
  addVitals,
  getVitalsRecord,
  deleteVitalsRecord,
  summarizeVitals,
  askVitalAI
} from "../controller/vitalsController.js"
import { isDoctorAuthenticated, isPatientAuthenticated } from "../middlewares/auth.js"

const router = express.Router()

// Patient routes
router.get("/history", isPatientAuthenticated, getVitalsHistory)
router.get("/:id", isPatientAuthenticated, getVitalsRecord)

// Doctor routes
router.post("/add", isDoctorAuthenticated, addVitals)
router.delete("/delete/:id", isDoctorAuthenticated, deleteVitalsRecord)

router.post("/summarize", isPatientAuthenticated, summarizeVitals)
router.post("/ask-ai", isPatientAuthenticated, askVitalAI)



export default router
