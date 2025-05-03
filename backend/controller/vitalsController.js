import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/errorMiddleware.js"
import { Vitals } from "../models/vitalsSchema.js"
import { Notification } from "../models/notificationSchema.js"

// Get patient's vitals history
export const getVitalsHistory = catchAsyncErrors(async (req, res, next) => {
  const patientId = req.user._id

  const vitals = await Vitals.find({ patientId }).sort({ date: -1 })

  res.status(200).json({
    success: true,
    vitals,
  })
})

// Add new vitals record
export const addVitals = catchAsyncErrors(async (req, res, next) => {
  const { bloodPressure, heartRate, temperature, respiratoryRate, oxygenSaturation, weight, height, notes } = req.body

  if (!bloodPressure || !heartRate || !temperature) {
    return next(new ErrorHandler("Please provide required vital signs!", 400))
  }

  // If a doctor is adding vitals for a patient
  let patientId = req.user._id
  let recordedBy = "Patient"

  if (req.user.role === "Doctor" && req.body.patientId) {
    patientId = req.body.patientId
    recordedBy = "Doctor"
  }

  const vitals = await Vitals.create({
    patientId,
    bloodPressure,
    heartRate,
    temperature,
    respiratoryRate,
    oxygenSaturation,
    weight,
    height,
    notes,
    recordedBy,
  })

  // Create notification if doctor recorded the vitals
  if (recordedBy === "Doctor") {
    await Notification.create({
      userId: patientId,
      message: "Your vital signs were recorded by your doctor",
      type: "Vitals",
      relatedId: vitals._id,
      onModel: "Vitals",
    })
  }

  res.status(201).json({
    success: true,
    vitals,
    message: "Vitals recorded successfully!",
  })
})

// Get a specific vitals record
export const getVitalsRecord = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params

  const vitals = await Vitals.findById(id)

  if (!vitals) {
    return next(new ErrorHandler("Vitals record not found!", 404))
  }

  // Check if the user is authorized to view this record
  if (req.user.role === "Patient" && vitals.patientId.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to view this record!", 403))
  }

  res.status(200).json({
    success: true,
    vitals,
  })
})

// Update a vitals record
export const updateVitalsRecord = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params

  let vitals = await Vitals.findById(id)

  if (!vitals) {
    return next(new ErrorHandler("Vitals record not found!", 404))
  }

  // Only allow the patient who owns the record or doctors to update it
  if (req.user.role === "Patient" && vitals.patientId.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to update this record!", 403))
  }

  vitals = await Vitals.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })

  res.status(200).json({
    success: true,
    vitals,
    message: "Vitals record updated successfully!",
  })
})

// Delete a vitals record
export const deleteVitalsRecord = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params

  const vitals = await Vitals.findById(id)

  if (!vitals) {
    return next(new ErrorHandler("Vitals record not found!", 404))
  }

  // Only allow the patient who owns the record or doctors to delete it
  if (req.user.role === "Patient" && vitals.patientId.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to delete this record!", 403))
  }

  await vitals.deleteOne()

  res.status(200).json({
    success: true,
    message: "Vitals record deleted successfully!",
  })
})
