import express from "express"
import {
  deleteAppointment,
  // getAllAppointments,
  bookAppointment,
  updateAppointmentStatus,
  getPatientAppointments,
  getAppointmentsByPatientId,
  getAppointmentsByDoctorId,
  getDoctorAppointments,
  getDoctorStats,
  addDoctorNotes,
  getAllAppointments,
  deleteSingleAppointment
} from "../controller/appointmentController.js"
import { isAdminAuthenticated, isDoctorAuthenticated, isPatientAuthenticated, isAdminOrDoctorAuthenticated} from "../middlewares/auth.js"

const router = express.Router()

router.get("/getall", isAdminAuthenticated, getAllAppointments)

// Patient routes
router.post("/book", isPatientAuthenticated, bookAppointment)
router.get("/patient", isPatientAuthenticated, getPatientAppointments)
router.get("/:patientId", isAdminOrDoctorAuthenticated, getAppointmentsByPatientId)

// Doctor routes
router.get("/doctor/me", isDoctorAuthenticated, getDoctorAppointments)
router.get("/doctor/:doctorId", isAdminOrDoctorAuthenticated, getAppointmentsByDoctorId)
router.get("/doctor/stats/me", isDoctorAuthenticated, getDoctorStats); // Add this new route


// Admin routes
router.put("/update/:appointmentId", isAdminAuthenticated, updateAppointmentStatus)
router.delete("/delete/:patientId", isAdminAuthenticated, deleteAppointment)
router.post("/notes/:appointmentId", isDoctorAuthenticated, addDoctorNotes) // New route for adding notes
// Modified route to allow patients to see their own appointments
// router.get("/getall", isPatientAuthenticated, getAllAppointments) fix it
router.delete("/single/:appointmentId", isAdminAuthenticated, deleteSingleAppointment)

export default router