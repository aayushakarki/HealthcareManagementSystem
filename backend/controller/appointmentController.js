import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/errorMiddleware.js"
import { Appointment } from "../models/appointmentSchema.js"
import { User } from "../models/userSchema.js"
import { Notification } from "../models/notificationSchema.js"
import { sendEmail } from "../utils/sendEmail.js"

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

  const requestedStart = new Date(appointment_date);
  const requestedEnd = new Date(requestedStart);
  requestedEnd.setMinutes(requestedEnd.getMinutes() + 40);

  const conflict = await Appointment.findOne({
    doctorId,
    status: { $ne: "Cancelled" },
    $expr: {
      $and: [
        { $lt: [ { $toDate: "$appointment_date" }, requestedEnd ] },
        { $gt: [
            { $add: [ { $toDate: "$appointment_date" }, 1000 * 60 * 40 ] },
            requestedStart
          ]
        }
      ]
    }
  });
  if (conflict) {
    return next(new ErrorHandler("Doctor already has an appointment at this time!", 400))
  }

  const isoAppointmentDate = new Date(appointment_date).toISOString();

  const appointment = await Appointment.create({
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    appointment_date: isoAppointmentDate,
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

  await Notification.create({
    userId: doctorId,
    message: `New appointment request from ${firstName} ${lastName}`,
    type: "Appointment",
    relatedId: appointment._id,
    onModel: "Appointment",
  })

  const doctor = await User.findById(doctorId)
  if (doctor && doctor.email) {
    await sendEmail({
      to: doctor.email,
      subject: `MediCure: New Appointment Request`,
      text: `You have a new appointment request from ${firstName} ${lastName} for ${new Date(appointment_date).toLocaleString()}`,
      html: `
        <p>You have a new appointment request from <b>${firstName} ${lastName}</b></p>
        <p>Appointment Details:</p>
        <ul>
          <li>Date & Time: ${new Date(appointment_date).toLocaleString()}</li>
          <li>Department: ${department}</li>
          <li>Patient Email: ${email}</li>
          <li>Patient Phone: ${phone}</li>
        </ul>
      `
    })
  }

  const admin = await User.findOne({ role: "Admin" })
  if (admin && admin.email) {
    await sendEmail({
      to: admin.email,
      subject: `MediCure: New Appointment Request`,
      text: `A new appointment has been booked with Dr. ${doctor_firstName} ${doctor_lastName} by ${firstName} ${lastName}`,
      html: `
        <p>A new appointment has been booked with Dr. <b>${doctor_firstName} ${doctor_lastName}</b></p>
        <p>Patient Details:</p>
        <ul>
          <li>Name: ${firstName} ${lastName}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone}</li>
        </ul>
        <p>Appointment Details:</p>
        <ul>
          <li>Date & Time: ${new Date(appointment_date).toLocaleString()}</li>
          <li>Department: ${department}</li>
        </ul>
      `
    })
  }

  res.status(200).json({
    success: true,
    appointment,
    message: "Appointment Sent Successfully!",
  })
})


export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
  const { appointmentId } = req.params
  const { status, newDate } = req.body 

  console.log("Received request:", { appointmentId, status, newDate }) 

  if (!status) {
    return next(new ErrorHandler("Please provide status", 400))
  }

  const appointment = await Appointment.findById(appointmentId)

  if (!appointment) {
    return next(new ErrorHandler("Appointment not found", 404))
  }

  const oldStatus = appointment.status
  const oldDate = appointment.appointment_date

  const updateObj = { status }
  
  if (status === "Rescheduled" && newDate) {
    const parsedDate = new Date(newDate)
    if (isNaN(parsedDate.getTime())) {
      return next(new ErrorHandler("Invalid date format", 400))
    }
    updateObj.appointment_date = parsedDate.toISOString()
    console.log("Updating appointment date to:", updateObj.appointment_date) 
  }

  // Mark cancellation time when status becomes Cancelled; clear it otherwise
  if (status === "Cancelled") {
    updateObj.cancelledAt = new Date()
  } else if (oldStatus === "Cancelled") {
    updateObj.cancelledAt = null
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    updateObj,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  )

  console.log("Updated appointment:", updatedAppointment) 

  if (oldStatus !== status || (newDate && oldDate !== updateObj.appointment_date)) {
    let notificationMessage = `Your appointment status has been updated to ${status}`
    if (status === "Rescheduled" && newDate) {
      notificationMessage += ` (New date: ${new Date(newDate).toLocaleString()})`
    }
    
    await Notification.create({
      userId: appointment.patientId,
      message: notificationMessage,
      type: "Appointment",
      relatedId: appointment._id,
      onModel: "Appointment",
    })

    const user = await User.findById(appointment.patientId)
    if (user && user.email) {
      let emailText = `Your appointment status has been updated to ${status}.`
      let emailHtml = `<p>Your appointment status has been updated to <b>${status}</b>.</p>`
      
      if (status === "Rescheduled" && newDate) {
        emailText += ` New date: ${new Date(newDate).toLocaleString()}`
        emailHtml += `<p>New date: <b>${new Date(newDate).toLocaleString()}</b></p>`
      }
      
      await sendEmail({
        to: user.email,
        subject: `MediCure: Appointment Status Updated`,
        text: emailText,
        html: emailHtml,
      })
    }
  }

  res.status(200).json({
    success: true,
    appointment: updatedAppointment,
    message: "Appointment Status Updated!",
  })
})

export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { patientId } = req.params 

  const appointments = await Appointment.find({ patientId })

  if (appointments.length === 0) {
    return next(new ErrorHandler("No appointments found for this patient", 404))
  }

  for (const appointment of appointments) {
    await Notification.create({
      userId: appointment.patientId,
      message: "Your appointment has been cancelled",
      type: "Appointment",
    })

    await appointment.deleteOne()
  }

  res.status(200).json({
    success: true,
    message: "Appointment Deleted!",
  })
})

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

export const getDoctorAppointments = catchAsyncErrors(async (req, res, next) => {
  const doctorId = req.user._id

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

  const patientExists = await User.findOne({
    _id: patientId,
    role: "Patient",
  })
  if (!patientExists) {
    return next(new ErrorHandler("Patient not found", 404))
  }

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

export const getAppointmentsByDoctorId = catchAsyncErrors(async (req, res, next) => {
  const { doctorId } = req.params

  const doctorExists = await User.findOne({ _id: doctorId, role: "Doctor" })
  if (!doctorExists) {
    return next(new ErrorHandler("Doctor not found", 404))
  }

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


export const getDoctorStats = catchAsyncErrors(async (req, res, next) => {
  const doctorId = req.user._id

  if (!doctorId) {
    return next(new ErrorHandler("Doctor ID not found", 400))
  }

  const appointments = await Appointment.find({ doctorId })

  const uniquePatientIds = [...new Set(appointments.map((app) => app.patientId))]

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todaysAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.appointment_date)
    return appointmentDate >= today && appointmentDate < tomorrow
  })

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

export const addDoctorNotes = catchAsyncErrors(async (req, res, next) => {
  const { appointmentId } = req.params
  const { notes } = req.body
  const doctorId = req.user._id

  if (!notes) {
    return next(new ErrorHandler("Please provide notes", 400))
  }

  const appointment = await Appointment.findById(appointmentId)

  if (!appointment) {
    return next(new ErrorHandler("Appointment not found", 404))
  }

  if (appointment.doctorId.toString() !== doctorId.toString()) {
    return next(new ErrorHandler("Not authorized to add notes to this appointment", 403))
  }

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

export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized to access this resource", 403))
  }

  try {
    const appointments = await Appointment.find().sort({
      appointment_date: -1,
    })

    const populatedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        if (appointment.doctorId) {
          try {
            const doctor = await User.findById(appointment.doctorId).select("firstName lastName")
            if (doctor) {
              appointment = appointment.toObject() 
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

export const deleteSingleAppointment = catchAsyncErrors(async (req, res, next) => {
  const { appointmentId } = req.params;
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return next(new ErrorHandler("Appointment not found", 404));
  }
  await appointment.deleteOne();
  res.status(200).json({
    success: true,
    message: "Appointment deleted successfully",
  });
});
