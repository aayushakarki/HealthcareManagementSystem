import express from "express"
import {
  getVitalsHistory,
  addVitals,
  getVitalsRecord,
  updateVitalsRecord,
  deleteVitalsRecord,
} from "../controller/vitalsController.js"
import { isDoctorAuthenticated, isPatientAuthenticated } from "../middlewares/auth.js"

const router = express.Router()

// Patient routes
router.get("/history", isPatientAuthenticated, getVitalsHistory)
router.post("/add", isPatientAuthenticated, addVitals)
router.get("/:id", isPatientAuthenticated, getVitalsRecord)

// Doctor routes
router.post("/doctor/add", isDoctorAuthenticated, addVitals)
router.put("/update/:id", isDoctorAuthenticated, updateVitalsRecord)
router.delete("/delete/:id", isDoctorAuthenticated, deleteVitalsRecord)

export default router
