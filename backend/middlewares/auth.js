import { User } from "../models/userSchema.js"
import { catchAsyncErrors } from "./catchAsyncErrors.js"
import ErrorHandler from "./errorMiddleware.js"
import jwt from "jsonwebtoken"

// Middleware to check if the user is an Admin
export const isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.adminToken
  if (!token) {
    return next(new ErrorHandler("Dashboard User is not authenticated!", 400))
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
  req.user = await User.findById(decoded.id)
  if (req.user.role !== "Admin") {
    return next(new ErrorHandler(`${req.user.role} not authorized for this resource!`, 403))
  }
  next()
})

// Middleware to check if the user is a Patient
export const isPatientAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.patientToken || req.headers.authorization?.split(" ")[1]; // Check cookies or Authorization header
  console.log("Token received:", token);
  if (!token) {
    return next(new ErrorHandler("Patient Not Authenticated", 400))
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
  req.user = await User.findById(decoded.id)

  if (req.user.role !== "Patient") {
    return next(new ErrorHandler(`${req.user.role} not authorized for this resources!`, 403))
  }

  next()
})

// Middleware to check if the user is a Doctor
export const isDoctorAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.doctorToken // Doctor-specific token cookie
  if (!token) {
    return next(new ErrorHandler("Doctor Not Authenticated", 400))
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
  req.user = await User.findById(decoded.id)
  if (!req.user || req.user.role !== "Doctor") {
    return next(new ErrorHandler("Not authorized to access this resource", 403))
  }
  next()
})

// Middleware to check if the user is either an Admin or Doctor
export const isAdminOrDoctorAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.adminToken || req.cookies.doctorToken // Check for either adminToken or doctorToken cookie
  if (!token) {
    return next(new ErrorHandler("User Not Authenticated", 400))
  }

  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
  req.user = await User.findById(decoded.id)

  // Ensure the user is either an Admin or Doctor
  if (req.user.role !== "Admin" && req.user.role !== "Doctor") {
    return next(new ErrorHandler("Not authorized to access this resource", 403))
  }
  next()
})

// Generic authentication middleware that works for any user role
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { patientToken, doctorToken, adminToken } = req.cookies
  if (!patientToken && !doctorToken && !adminToken) {
    return next(new ErrorHandler("Please Login To Access!", 401))
  }

  try {
    let decoded
    let token

    if (patientToken) {
      token = patientToken
    } else if (doctorToken) {
      token = doctorToken
    } else {
      token = adminToken
    }

    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    req.user = await User.findById(decoded.id)

    if (!req.user) {
      return next(new ErrorHandler("User not found!", 404))
    }

    next()
  } catch (error) {
    return next(new ErrorHandler("Invalid Token! Please login again.", 401))
  }
})
