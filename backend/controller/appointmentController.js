import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/errorMiddleware.js"
import { Appointment } from "../models/appointmentSchema.js"
import { User } from "../models/userSchema.js"
import { Notification } from "../models/notificationSchema.js"

export const bookAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    appointment_date,
    department,
    doctor_firstName,
    doctor_lastName,
    hasVisited,
    address,
  } = req.body
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !dob ||
    !gender ||
    !appointment_date ||
    !department ||
    !doctor_firstName ||
    !doctor_lastName ||
    !address
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400))
  }
  const isConflict = await User.find({
    firstName: doctor_firstName,
    lastName: doctor_lastName,
    role: "Doctor",
    doctorDepartment: department,
  })
  if (isConflict.length === 0) {
    return next(
      new ErrorHandler(
        `Doctor not found with name ${doctor_firstName} ${doctor_lastName} in department ${department}`,
        404,
      ),
    )
  }

  if (isConflict.length > 1) {
    return next(new ErrorHandler("Doctors Conflict! Please Contact Through Email Or Phone!", 400))
  }
  const doctorId = isConflict[0]._id
  const patientId = req.user._id
  const appointment = await Appointment.create({
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    appointment_date,
    department,
    doctor: {
      firstName: doctor_firstName,
      lastName: doctor_lastName,
    },
    hasVisited,
    address,
    doctorId,
    patientId,
  })

  // Create notification for the doctor
  await Notification.create({
    userId: doctorId,
    message: `New appointment request from ${firstName} ${lastName}`,
    type: "Appointment",
    relatedId: appointment._id,
    onModel: "Appointment",
  })

  res.status(200).json({
    success: true,
    appointment,
    message: "Appointment Sent Successfully!",
  })
})

// function to update a single appointment by ID
export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
  const { appointmentId } = req.params
  const { status } = req.body

  if (!status) {
    return next(new ErrorHandler("Please provide status", 400))
  }

  // Find the appointment
  const appointment = await Appointment.findById(appointmentId)

  if (!appointment) {
    return next(new ErrorHandler("Appointment not found", 404))
  }

  // Store old status
  const oldStatus = appointment.status

  // Update the appointment status
  const updatedAppointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    { status },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    },
  )

  // Create notification if the status has changed
  if (oldStatus !== status) {
    await Notification.create({
      userId: appointment.patientId,
      message: `Your appointment status has been updated to ${status}`,
      type: "Appointment",
      relatedId: appointment._id,
      onModel: "Appointment",
    })
  }

  res.status(200).json({
    success: true,
    appointment: updatedAppointment,
    message: "Appointment Status Updated!",
  })
})

export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { patientId } = req.params // Get patientId from the route parameters

  // Find all appointments for this patient
  const appointments = await Appointment.find({ patientId })

  if (appointments.length === 0) {
    return next(new ErrorHandler("No appointments found for this patient", 404))
  }

  // Create notifications and delete appointments
  for (const appointment of appointments) {
    // Create notification for the patient when appointment is deleted
    await Notification.create({
      userId: appointment.patientId,
      message: "Your appointment has been cancelled",
      type: "Appointment",
    })

    // Delete the appointment
    await appointment.deleteOne()
  }

  res.status(200).json({
    success: true,
    message: "Appointment Deleted!",
  })
})

// Get patient's appointments
export const getPatientAppointments = catchAsyncErrors(async (req, res, next) => {
  const patientId = req.user._id

  const appointments = await Appointment.find({ patientId }).sort({
    appointment_date: -1,
  })

  res.status(200).json({
    success: true,
    appointments,
  })
})

// Get doctor's own appointments
export const getDoctorAppointments = catchAsyncErrors(async (req, res, next) => {
  const doctorId = req.user._id

  // Make sure we have a valid doctorId
  if (!doctorId) {
    return next(new ErrorHandler("Doctor ID not found", 400))
  }

  const appointments = await Appointment.find({ doctorId }).sort({
    appointment_date: -1,
  })

  res.status(200).json({
    success: true,
    appointments,
  })
})

export const getAppointmentsByPatientId = catchAsyncErrors(async (req, res, next) => {
  const { patientId } = req.params

  // Verify the patient exists
  const patientExists = await User.findOne({
    _id: patientId,
    role: "Patient",
  })
  if (!patientExists) {
    return next(new ErrorHandler("Patient not found", 404))
  }

  // Allow Doctors and Admins to access any patient's appointments, but also allow the patient to access their own appointments
  if (req.user.role !== "Doctor" && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized to access this resource", 403))
  }

  const appointments = await Appointment.find({ patientId }).sort({
    appointment_date: -1,
  })

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments,
  })
})

// Get appointments for a specific doctor (Admin access)
export const getAppointmentsByDoctorId = catchAsyncErrors(async (req, res, next) => {
  const { doctorId } = req.params

  // Verify the doctor exists
  const doctorExists = await User.findOne({ _id: doctorId, role: "Doctor" })
  if (!doctorExists) {
    return next(new ErrorHandler("Doctor not found", 404))
  }

  // Only allow admins to access this endpoint
  if (req.user.role !== "Doctor" && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized to access this resource", 403))
  }

  const appointments = await Appointment.find({ doctorId }).sort({
    appointment_date: -1,
  })

  res.status(200).json({
    success: true,
    count: appointments.length,
    appointments,
  })
})

// Add this to appointmentController.js

export const getDoctorStats = catchAsyncErrors(async (req, res, next) => {
  const doctorId = req.user._id

  // Make sure we have a valid doctorId
  if (!doctorId) {
    return next(new ErrorHandler("Doctor ID not found", 400))
  }

  // Get all appointments for this doctor
  const appointments = await Appointment.find({ doctorId })

  // Get unique patient IDs
  const uniquePatientIds = [...new Set(appointments.map((app) => app.patientId))]

  // Calculate today's appointments
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todaysAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.appointment_date)
    return appointmentDate >= today && appointmentDate < tomorrow
  })

  // Count pending and completed appointments
  const pendingAppointments = appointments.filter((app) => app.status === "Pending").length
  const completedAppointments = appointments.filter((app) => app.status === "Completed").length

  res.status(200).json({
    success: true,
    stats: {
      totalPatients: uniquePatientIds.length,
      appointmentsToday: todaysAppointments.length,
      pendingAppointments,
      completedAppointments,
    },
  })
})

// New function to add doctor notes to an appointment
export const addDoctorNotes = catchAsyncErrors(async (req, res, next) => {
  const { appointmentId } = req.params
  const { notes } = req.body
  const doctorId = req.user._id

  // Validate input
  if (!notes) {
    return next(new ErrorHandler("Please provide notes", 400))
  }

  // Find the appointment
  const appointment = await Appointment.findById(appointmentId)

  if (!appointment) {
    return next(new ErrorHandler("Appointment not found", 404))
  }

  // Verify the doctor is authorized to add notes to this appointment
  if (appointment.doctorId.toString() !== doctorId.toString()) {
    return next(new ErrorHandler("Not authorized to add notes to this appointment", 403))
  }

  // Update the appointment with doctor notes
  const updatedAppointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    { doctorNotes: notes },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    },
  )

  res.status(200).json({
    success: true,
    appointment: updatedAppointment,
    message: "Notes added successfully",
  })
})

// Get all appointments (Admin access)
export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  // Only admins should access this endpoint
  if (req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized to access this resource", 403))
  }

  try {
    // Fetch all appointments without any ID filter
    const appointments = await Appointment.find().sort({
      appointment_date: -1,
    })

    // Populate doctor information if needed
    const populatedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        if (appointment.doctorId) {
          try {
            const doctor = await User.findById(appointment.doctorId).select("firstName lastName")
            if (doctor) {
              appointment = appointment.toObject() // Convert to plain object to modify
              appointment.doctor = {
                firstName: doctor.firstName,
                lastName: doctor.lastName,
              }
            }
          } catch (error) {
            console.error(`Error fetching doctor for appointment ${appointment._id}:`, error)
          }
        }
        return appointment
      }),
    )

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments: populatedAppointments,
    })
  } catch (error) {
    console.error("Error in getAllAppointments:", error)
    return next(new ErrorHandler(error.message || "Error fetching appointments", 500))
  }
})
