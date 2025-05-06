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
  const { patientId, bloodPressure, heartRate, cholesterol, hdlCholesterol, respiratoryRate, weight, height, notes } = req.body

  if (!patientId || !bloodPressure || !heartRate || !cholesterol || !hdlCholesterol) {
    return next(new ErrorHandler("Please provide required vital signs and patient ID!", 400))
  }

  const vitals = await Vitals.create({
    patientId,
    bloodPressure,
    heartRate,
    cholesterol,
    hdlCholesterol,
    respiratoryRate,
    weight,
    height,
    notes,
    recordedBy: "Doctor",
  })

  // Create notification for the patient
    await Notification.create({
      userId: patientId,
      message: "Your vital signs were recorded by your doctor",
      type: "Vitals",
      relatedId: vitals._id,
      onModel: "Vitals",
    })

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
