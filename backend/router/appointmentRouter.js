import express from "express"
import {
  deleteAppointment,
  // getAllAppointments,
  bookAppointment,
  updateAppointmentStatusByPatientId,
  getPatientAppointments,
  getAppointmentsByPatientId,
  getAppointmentsByDoctorId
} from "../controller/appointmentController.js"
import { isAdminAuthenticated, isDoctorAuthenticated, isPatientAuthenticated, isAdminOrDoctorAuthenticated} from "../middlewares/auth.js"

const router = express.Router()

// Patient routes
router.post("/book", isPatientAuthenticated, bookAppointment)
router.get("/patient", isPatientAuthenticated, getPatientAppointments)
router.get("/:patientId", isAdminOrDoctorAuthenticated, getAppointmentsByPatientId)

// Doctor routes
router.get("/doctor/:doctorId", isAdminOrDoctorAuthenticated, getAppointmentsByDoctorId)

// Admin routes
router.put("/update/:patientId", isAdminAuthenticated, updateAppointmentStatusByPatientId)
router.delete("/delete/:patientId", isAdminAuthenticated, deleteAppointment)

// Modified route to allow patients to see their own appointments
// router.get("/getall", isPatientAuthenticated, getAllAppointments) fix it later

export default router
