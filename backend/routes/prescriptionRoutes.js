import express from "express"
import {
  addPrescription,
  updatePrescription,
  deletePrescription,
  getPatientPrescriptions,
  getMyPrescriptions,
  getPrescriptionById,
  getAllPrescriptions,
  getActivePrescriptions,
  generatePrescriptionPDF
} from "../controller/prescriptionController.js"
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js"

const router = express.Router()

// ... existing routes ...

// Add new route for PDF generation
router.get("/pdf", isAuthenticated, generatePrescriptionPDF)

export default router 