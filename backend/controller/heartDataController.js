import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { HeartData } from "../models/heartDataSchema.js";
import { User } from "../models/userSchema.js";

/**
 * @route POST /api/v1/heart-data/add
 * @description Add new heart disease feature data for a patient.
 * @access Doctor only
 */
export const addHeartDataForPatient = catchAsyncErrors(async (req, res, next) => {
  // Check if the user is a doctor
  if (req.user.role !== "Doctor") {
    return next(new ErrorHandler("You are not authorized to perform this action.", 403));
  }

  const {
    patientId, age, sex, cp, trestbps, chol, fbs,
    restecg, thalach, exang, oldpeak, slope, ca, thal
  } = req.body;

  // --- Basic Validation ---
  if (!patientId || !age || sex === undefined || cp === undefined || !trestbps || !chol || fbs === undefined ||
      restecg === undefined || !thalach || exang === undefined || oldpeak === undefined ||
      slope === undefined || ca === undefined || thal === undefined) {
    return next(new ErrorHandler("Please provide all required fields.", 400));
  }

  // Verify the patient exists
  const patient = await User.findById(patientId);
  if (!patient || patient.role !== 'Patient') {
    return next(new ErrorHandler("Patient not found.", 404));
  }

  // --- Create and Save Data ---
  const heartData = await HeartData.create({
    patientId,
    recordedBy: req.user._id,
    age, sex, cp, trestbps, chol, fbs,
    restecg, thalach, exang, oldpeak, slope, ca, thal
  });

  res.status(201).json({
    success: true,
    message: "Heart data recorded successfully.",
    heartData,
  });
});


/**
 * @route GET /api/v1/heart-data/me
 * @description Get the latest heart disease feature data for the logged-in patient.
 * @access Patient only
 */
export const getLatestHeartData = catchAsyncErrors(async (req, res, next) => {
  // Check if the user is a patient
  if (req.user.role !== "Patient") {
    return next(new ErrorHandler("You are not authorized to view this data.", 403));
  }

  const latestData = await HeartData.findOne({ patientId: req.user._id })
    .sort({ createdAt: -1 }) // Get the most recent record
    .populate("recordedBy", "firstName lastName"); // Show which doctor recorded it

  if (!latestData) {
    return next(new ErrorHandler("No heart disease prediction data found for you.", 404));
  }

  res.status(200).json({
    success: true,
    latestData,
  });
}); 