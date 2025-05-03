import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";
import { Notification } from "../models/notificationSchema.js";

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
  } = req.body;
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
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  const isConflict = await User.find({
    firstName: doctor_firstName,
    lastName: doctor_lastName,
    role: "Doctor",
    doctorDepartment: department,
  });
  if (isConflict.length === 0) {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  if (isConflict.length > 1) {
    return next(
      new ErrorHandler(
        "Doctors Conflict! Please Contact Through Email Or Phone!",
        400
      )
    );
  }
  const doctorId = isConflict[0]._id;
  const patientId = req.user._id;
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
  });

  // Create notification for the doctor
  await Notification.create({
    userId: doctorId,
    message: `New appointment request from ${firstName} ${lastName}`,
    type: "Appointment",
    relatedId: appointment._id,
    onModel: "Appointment",
  });

  res.status(200).json({
    success: true,
    appointment,
    message: "Appointment Sent Successfully!",
  });
});

// export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
//   let appointments;

//   // If the user is a patient, only return their appointments
//   if (req.user.role === "Patient") {
//     appointments = await Appointment.find({ patientId: req.user._id });
//   } else {
//     // For doctors and admins, return all appointments
//     appointments = await Appointment.find();
//   }

//   res.status(200).json({
//     success: true,
//     appointments,
//   });
// });

// Update appointment status by patient ID
export const updateAppointmentStatusByPatientId = catchAsyncErrors(
  async (req, res, next) => {
    const { patientId } = req.params;
    const { status } = req.body;

    if (!status) {
      return next(new ErrorHandler("Please provide status", 400));
    }

    // Find all appointments for this patient
    const appointments = await Appointment.find({ patientId });

    if (appointments.length === 0) {
      return next(
        new ErrorHandler("No appointments found for this patient", 404)
      );
    }

    // Store old status and update appointments
    const updatedAppointments = [];
    for (let appointment of appointments) {
      const oldStatus = appointment.status;

      // Update the appointment status
      appointment = await Appointment.findByIdAndUpdate(
        appointment._id,
        { status },
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        }
      );

      // Create notification if the status has changed
      if (oldStatus !== status) {
        await Notification.create({
          userId: patientId,
          message: `Your appointment status has been updated to ${status}`,
          type: "Appointment",
          relatedId: appointment._id,
          onModel: "Appointment",
        });
      }

      updatedAppointments.push(appointment);
    }

    res.status(200).json({
      success: true,
      appointments: updatedAppointments,
      message: "Appointment Status Updated!",
    });
  }
);

export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { patientId } = req.params; // Get patientId from the route parameters

  // Find all appointments for this patient
  const appointments = await Appointment.find({ patientId });

  if (appointments.length === 0) {
    return next(
      new ErrorHandler("No appointments found for this patient", 404)
    );
  }

  // Create notifications and delete appointments
  for (let appointment of appointments) {
    // Create notification for the patient when appointment is deleted
    await Notification.create({
      userId: appointment.patientId,
      message: "Your appointment has been cancelled",
      type: "Appointment",
    });

    // Delete the appointment
    await appointment.deleteOne();
  }

  res.status(200).json({
    success: true,
    message: "Appointment Deleted!",
  });
});

// Get patient's appointments
export const getPatientAppointments = catchAsyncErrors(
  async (req, res, next) => {
    const patientId = req.user._id;

    const appointments = await Appointment.find({ patientId }).sort({
      appointment_date: -1,
    });

    res.status(200).json({
      success: true,
      appointments,
    });
  }
);

export const getAppointmentsByPatientId = catchAsyncErrors(
  async (req, res, next) => {
    const { patientId } = req.params;

    // Verify the patient exists
    const patientExists = await User.findOne({
      _id: patientId,
      role: "Patient",
    });
    if (!patientExists) {
      return next(new ErrorHandler("Patient not found", 404));
    }

    // Allow Doctors and Admins to access any patient's appointments, but also allow the patient to access their own appointments
    if (req.user.role !== "Doctor" && req.user.role !== "Admin") {
      return next(
        new ErrorHandler("Not authorized to access this resource", 403)
      );
    }

    const appointments = await Appointment.find({ patientId }).sort({
      appointment_date: -1,
    });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  }
);

// Get appointments for a specific doctor (Admin access)
export const getAppointmentsByDoctorId = catchAsyncErrors(
  async (req, res, next) => {
    const { doctorId } = req.params;

    // Verify the doctor exists
    const doctorExists = await User.findOne({ _id: doctorId, role: "Doctor" });
    if (!doctorExists) {
      return next(new ErrorHandler("Doctor not found", 404));
    }

    // Only allow admins to access this endpoint
    if (req.user.role !== "Doctor" && req.user.role !== "Admin") {
      return next(
        new ErrorHandler("Not authorized to access this resource", 403)
      );
    }

    const appointments = await Appointment.find({ doctorId }).sort({
      appointment_date: -1,
    });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  }
);
