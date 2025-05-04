import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/errorMiddleware.js"
import { User } from "../models/userSchema.js"
import { generateToken } from "../utils/jwtToken.js"
import cloudinary from "cloudinary"
import { Appointment } from "../models/appointmentSchema.js";
import { Notification } from "../models/notificationSchema.js";
import { HealthRecord } from "../models/healthRecordSchema.js";

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, dob, gender, password, confirmPassword, role } = req.body
  if (!firstName || !lastName || !email || !phone || !dob || !gender || !password || !confirmPassword || !role) {
    return next(new ErrorHandler("Please Fill Full Form!", 400))
  }
  let user = await User.findOne({ email })
  if (user) {
    return next(new ErrorHandler("User Already Registered!", 400))
  }
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Password and Confirm Password Do Not Match", 400))
  }
  if (!validator.isEmail(email)) {
    return next(new ErrorHandler("Invalid Email Format", 400))
  }
  user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    password,
    role,
  })
  generateToken(user, "User Registered!", 200, res)
})

import validator from "validator" // Make sure to import the validator module

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body

  // Check if all fields are provided
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please Provide All Details", 400))
  }

  // Check if email format is valid
  if (!validator.isEmail(email)) {
    return next(new ErrorHandler("Invalid Email Format", 400))
  }

  const user = await User.findOne({ email }).select("+password")
  if (!user) {
    return next(new ErrorHandler("User not Registered", 400))
  }

  const isPasswordMatched = await user.comparePassword(password)
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Password Or Email", 400))
  }

  // Check if the role matches
  if (role !== user.role) {
    return next(new ErrorHandler("User with Role not Registered", 400))
  }

  // Generate a token
  generateToken(user, "User Logged In Successfully!", 200, res)
})

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, dob, gender, password } = req.body

  if (!firstName || !lastName || !email || !phone || !dob || !gender || !password) {
    return next(new ErrorHandler("Please Fill Full Form!", 400))
  }

  const isRegistered = await User.findOne({ email })
  if (isRegistered) {
    return next(new ErrorHandler("Admin With This Email Already Exists!", 400))
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    password,
    role: "Admin",
  })
  res.status(200).json({
    success: true,
    message: "New Admin Registered",
    admin,
  })
})

export const addNewDoctor = async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400))
  }
  const { docAvatar } = req.files
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"]
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File Format Not Supported!", 400))
  }
  const { firstName, lastName, email, phone, dob, gender, password, doctorDepartment } = req.body

  if (!firstName || !lastName || !email || !phone || !dob || !gender || !password || !doctorDepartment) {
    return next(new ErrorHandler("Please Provide Full Details", 400))
  }

  const isRegistered = await User.findOne({ email })
  if (isRegistered) {
    return next(new ErrorHandler(`${isRegistered.role} Already Registered With This Email`, 400))
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath)
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary error")
    return next(new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500))
  }
  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    password,
    doctorDepartment, // Store the department
    role: "Doctor", // Set role to "Doctor"
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  })

  // Generate a token and send a response
  res.status(200).json({
    success: true,
    message: "New Doctor Resgistered!",
    doctor,
  })
}

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" })
  res.status(200).json({
    success: true,
    doctors,
  })
})

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user
  res.status(200).json({
    success: true,
    user,
  })
})

export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("adminToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Admin Logged Out Successfully.",
    })
})

export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("patientToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "User  Logged Out Successfully.",
    })
})

export const logoutDoctor = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("doctorToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Doctor Logged Out Successfully.",
    })
})

export const getDoctorsByDepartment = catchAsyncErrors(async (req, res, next) => {
  const { department } = req.params

  if (!department) {
    return next(new ErrorHandler("Department is required", 400))
  }

  const doctors = await User.find({
    role: "Doctor",
    doctorDepartment: department,
  })

  res.status(200).json({
    success: true,
    doctors,
  })
})

// Add this function to your userController.js file

export const getAllPatients = catchAsyncErrors(async (req, res, next) => {
  const patients = await User.find({ role: "Patient" })
  res.status(200).json({
    success: true,
    patients,
  })
})

export const deletePatient = catchAsyncErrors(async (req, res, next) => {
  const { patientId } = req.params;

  // Check if patient exists
  const patient = await User.findOne({ _id: patientId, role: "Patient" });
  if (!patient) {
    return next(new ErrorHandler("Patient not found", 404));
  }

  // Delete all appointments for this patient
  // Note: In a production environment, you might want to archive instead of delete
  try {
    // Delete appointments
    await Appointment.deleteMany({ patientId });
    
    // Delete health records if they exist
    try {
      await HealthRecord.deleteMany({ patientId });
    } catch (error) {
      console.log("No health records found or error deleting health records");
    }
    
    // Delete the patient
    await User.findByIdAndDelete(patientId);

    res.status(200).json({
      success: true,
      message: "Patient and all related data deleted successfully"
    });
  } catch (error) {
    return next(new ErrorHandler("Error deleting patient data", 500));
  }
});

export const deleteDoctor = catchAsyncErrors(async (req, res, next) => {
  const { doctorId } = req.params;

  // Check if doctor exists
  const doctor = await User.findOne({ _id: doctorId, role: "Doctor" });
  if (!doctor) {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  // Find all appointments with this doctor
  const appointments = await Appointment.find({ doctorId });

  // For each appointment, notify the patient that their doctor has been removed
  for (const appointment of appointments) {
    try {
      await Notification.create({
        userId: appointment.patientId,
        message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been cancelled as the doctor is no longer available.`,
        type: "Appointment",
        relatedId: appointment._id,
        onModel: "Appointment"
      });
    } catch (error) {
      console.log("Error creating notification", error);
    }
  }

  // Update appointments to mark them as cancelled
  await Appointment.updateMany(
    { doctorId },
    { status: "Cancelled", $set: { "doctor.notes": "Doctor is no longer available" } }
  );

  // Delete the doctor's avatar from cloudinary if it exists
  if (doctor.docAvatar && doctor.docAvatar.public_id) {
    try {
      await cloudinary.uploader.destroy(doctor.docAvatar.public_id);
    } catch (error) {
      console.log("Error deleting doctor avatar from cloudinary", error);
    }
  }

  // Delete the doctor
  await User.findByIdAndDelete(doctorId);

  res.status(200).json({
    success: true,
    message: "Doctor deleted successfully and related appointments updated"
  });
});
