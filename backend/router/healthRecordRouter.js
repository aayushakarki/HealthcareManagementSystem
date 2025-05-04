import express from 'express';
import { 
  uploadHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getPatientHealthRecords,
  getMyHealthRecords,
  getHealthRecordById
} from '../controller/healthRecordController.js';
import { isPatientAuthenticated, isAdminOrDoctorAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

// Routes for doctor/admin
router.post('/upload', isAdminOrDoctorAuthenticated, uploadHealthRecord);
router.put('/update/:recordId', isAdminOrDoctorAuthenticated, updateHealthRecord);
router.delete('/delete/:recordId', isAdminOrDoctorAuthenticated, deleteHealthRecord);
router.get('/patient/:patientId', isAdminOrDoctorAuthenticated, getPatientHealthRecords);

// Routes for patients
router.get('/me', isPatientAuthenticated, getMyHealthRecords);

// Route for both (with authorization check in controller)
router.get('/:recordId', isPatientAuthenticated, getHealthRecordById);

export default router;