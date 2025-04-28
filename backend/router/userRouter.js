import express from "express";
import { addNewAdmin, login, patientRegister, addNewDoctor, getAllDoctors, getUserDetails, logoutAdmin, logoutPatient } from "../controller/userController.js";
import { isAdminAuthenticated, isPatientAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/patient/register", patientRegister);
router.post("/doctor/addnew",isAdminAuthenticated, addNewDoctor);
router.post("/login", login);
router.post("/admin/addNew", isAdminAuthenticated, addNewAdmin);
router.get("/doctors", getAllDoctors);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/patient/me", isPatientAuthenticated, getUserDetails);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);

export default router;