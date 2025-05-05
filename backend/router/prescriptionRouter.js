import express from 'express';
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
} from '../controller/prescriptionController.js';
import { 
  isPatientAuthenticated, 
  isAdminAuthenticated, 
  isDoctorAuthenticated,
  isAdminOrDoctorAuthenticated,
  isAuthenticated
} from '../middlewares/auth.js';

const router = express.Router();

// Routes for doctor
router.post('/add', isDoctorAuthenticated, addPrescription);
router.put('/update/:prescriptionId', isDoctorAuthenticated, updatePrescription);
router.delete('/delete/:prescriptionId', isPatientAuthenticated, deletePrescription);
router.get('/patient/:patientId', isAdminOrDoctorAuthenticated, getPatientPrescriptions);
router.get('/active/patient/:patientId', isAdminOrDoctorAuthenticated, getActivePrescriptions);

// Routes for patients
router.get('/me', isPatientAuthenticated, getMyPrescriptions);
router.get('/active/me', isPatientAuthenticated, getActivePrescriptions);

// Routes for admin
router.get('/all', isAdminAuthenticated, getAllPrescriptions);
router.get("/pdf", isAuthenticated, generatePrescriptionPDF)

// Route for both (with authorization check in controller)
router.get('/:prescriptionId', isAuthenticated, getPrescriptionById);

export default router;