import express from 'express';
import { 
  searchPatients, 
  searchDoctors, 
  advancedSearch,
  searchUsers
} from '../controller/searchController.js';
import { 
  isAuthenticated, 
  isAdminAuthenticated, 
  isAdminOrDoctorAuthenticated 
} from '../middlewares/auth.js';

const router = express.Router();

// Basic search routes
router.get('/patients', isAdminOrDoctorAuthenticated, searchPatients);
router.get('/doctors', isAuthenticated, searchDoctors);
router.get('/users', isAdminAuthenticated, searchUsers);

// Advanced search with filters
router.get('/advanced', isAuthenticated, advancedSearch);

export default router;