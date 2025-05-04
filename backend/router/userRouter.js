import express from "express";
import { addNewAdmin, login, patientRegister, addNewDoctor, getAllDoctors, getUserDetails, logoutAdmin, logoutPatient, logoutDoctor, getDoctorsByDepartment, getAllPatients, deleteDoctor, deletePatient } from "../controller/userController.js";
import { isAdminAuthenticated, isDoctorAuthenticated, isPatientAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/patient/register", patientRegister);
router.post("/doctor/addnew",isAdminAuthenticated, addNewDoctor);
router.post("/login", login);
router.post("/admin/addNew", isAdminAuthenticated, addNewAdmin);
router.get("/doctors", getAllDoctors);
router.get("/patients", getAllPatients);
router.get("/doctors/:department", getDoctorsByDepartment)
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/patient/me", isPatientAuthenticated, getUserDetails);
router.get("/doctor/me", isDoctorAuthenticated, getUserDetails);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);
router.get("/doctor/logout", isDoctorAuthenticated, logoutDoctor);
router.delete("/patient/delete/:patientId", isAdminAuthenticated, deletePatient);
router.delete("/doctor/delete/:doctorId", isAdminAuthenticated, deleteDoctor);


export default router;