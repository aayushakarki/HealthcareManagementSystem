import express from "express";
import {
  deleteAppointment,
  getAllAppointments,
  bookAppointment,
  updateAppointmentStatus,
} from "../controller/appointmentController.js";
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
  isAdminOrDoctorAuthenticated
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/book", isPatientAuthenticated, bookAppointment);
router.get("/getall", isAdminOrDoctorAuthenticated, getAllAppointments);
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

export default router;