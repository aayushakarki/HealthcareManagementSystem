import { User } from '../models/userSchema.js';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';

// Search patients by firstName and lastName
export const searchPatients = catchAsyncErrors(async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return next(new ErrorHandler('Search query is required', 400));
    }

    // Search for patients with matching firstName or lastName
    const patients = await User.find({
      role: 'Patient',
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');

    res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Search doctors by firstName, lastName, and department
export const searchDoctors = catchAsyncErrors(async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return next(new ErrorHandler('Search query is required', 400));
    }

    // Search for doctors with matching firstName, lastName, or department
    const doctors = await User.find({
      role: 'Doctor',
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { doctorDepartment: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Advanced search with filters
export const advancedSearch = catchAsyncErrors(async (req, res, next) => {
  try {
    const { 
      query, 
      role, 
      department, 
      gender,
      sortBy = 'firstName',
      order = 'asc'
    } = req.query;

    // Build search criteria
    const searchCriteria = {};
    
    // Add role filter if provided
    if (role) {
      searchCriteria.role = role;
    }
    
    // Add department filter for doctors
    if (department && (role === 'Doctor' || !role)) {
      searchCriteria.doctorDepartment = department;
    }
    
    // Add gender filter if provided
    if (gender) {
      searchCriteria.gender = gender;
    }
    
    // Add name search if query is provided
    if (query) {
      searchCriteria.$or = [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } }
      ];
      
      // Add department search for doctors
      if (role === 'Doctor' || !role) {
        searchCriteria.$or.push({ doctorDepartment: { $regex: query, $options: 'i' } });
      }
    }

    // Create sort object
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    // Execute search
    const results = await User.find(searchCriteria)
      .select('-password')
      .sort(sortOptions);

    res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Search users (patients, doctors, admins) by name
export const searchUsers = catchAsyncErrors(async (req, res, next) => {
  try {
    const { query, role } = req.query;

    if (!query) {
      return next(new ErrorHandler('Search query is required', 400));
    }

    // Build search criteria
    const searchCriteria = {
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } }
      ]
    };
    
    // Add role filter if provided
    if (role) {
      searchCriteria.role = role;
    }

    const users = await User.find(searchCriteria).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});