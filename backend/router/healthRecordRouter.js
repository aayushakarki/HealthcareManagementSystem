import express from 'express';
import { 
  uploadHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getPatientHealthRecords,
  getMyHealthRecords,
  getHealthRecordById,
  downloadHealthRecord,
  summarizeHealthRecord,
  askHealthRecordAI
} from '../controller/healthrecordController.js';

import { isPatientAuthenticated, isAdminOrDoctorAuthenticated, isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

// Routes for doctor/admin
router.post('/upload', isAdminOrDoctorAuthenticated, uploadHealthRecord);
router.put('/update/:recordId', isAdminOrDoctorAuthenticated, updateHealthRecord);
router.delete('/delete/:recordId', isAdminOrDoctorAuthenticated, deleteHealthRecord);
router.get('/patient/:patientId', isAdminOrDoctorAuthenticated, getPatientHealthRecords);

// Routes for patients
router.get('/me', isPatientAuthenticated, getMyHealthRecords);

// Download route (accessible to both patients and doctors)
router.get('/download/:recordId', isPatientAuthenticated, downloadHealthRecord);

// Route for both (with authorization check in controller)
router.get('/:recordId', isPatientAuthenticated, getHealthRecordById);

router.post('/summarize', isPatientAuthenticated, summarizeHealthRecord);

router.post('/ask-ai', isPatientAuthenticated, askHealthRecordAI);



export default router;