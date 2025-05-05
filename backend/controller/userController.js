import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/errorMiddleware.js"
import { User } from "../models/userSchema.js"
import { generateToken } from "../utils/jwtToken.js"
import cloudinary from "cloudinary"
import validator from "validator" // Import validator
import { Appointment } from "../models/appointmentSchema.js";
import { Notification } from "../models/notificationSchema.js";
import { HealthRecord } from "../models/healthRecordSchema.js";
import { sendEmail } from "../utils/sendEmail.js"

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  // Extract data from request body
  const { firstName, lastName, email, phone, dob, gender, password, confirmPassword, role } = req.body

  // Validate required fields
  if (!firstName || !lastName || !email || !phone || !dob || !gender || !password || !confirmPassword || !role) {
    return next(new ErrorHandler("Please Fill Full Form!", 400))
  }

  // Check if user already exists
  let user = await User.findOne({ email })
  if (user) {
    return next(new ErrorHandler("User Already Registered!", 400))
  }

  // Validate password match
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Password and Confirm Password Do Not Match", 400))
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    return next(new ErrorHandler("Invalid Email Format", 400))
  }

  // Create new patient user
  user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    password,
    role,
    // Set a default value for nmcNumber for patients to avoid schema validation error
    nmcNumber: role === "Patient" ? "NA-PATIENT" : undefined,
  })

  // Send email to admin about new patient registration
  const admin = await User.findOne({ role: "Admin" })
  if (admin && admin.email) {
    await sendEmail({
      to: admin.email,
      subject: `MediCure: New Patient Registration`,
      text: `A new patient has registered: ${firstName} ${lastName}`,
      html: `
        <p>A new patient has registered in the system:</p>
        <ul>
          <li>Name: ${firstName} ${lastName}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone}</li>
          <li>Date of Birth: ${new Date(dob).toLocaleDateString()}</li>
          <li>Gender: ${gender}</li>
        </ul>
      `
    })
  }

  generateToken(user, "User Registered!", 200, res)
})

// Keep all other controller functions the same
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

  if (user.role === "Doctor" && user.status !== "Verified") {
    return next(new ErrorHandler("Doctor registration not yet verified. Please wait for admin approval.", 403))
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

export const registerDoctor = catchAsyncErrors(async (req, res, next) => {
  console.log("Doctor registration request body:", req.body)
  console.log("Doctor registration request files:", req.files)

  // Check if signature file is provided
  if (!req.files || !req.files.signatureFile) {
    return next(new ErrorHandler("Digital Signature File Required!", 400))
  }

  const { signatureFile } = req.files
  const allowedFormats = ["image/png", "image/jpeg", "application/pdf"]

  // Validate file format
  if (!allowedFormats.includes(signatureFile.mimetype)) {
    return next(new ErrorHandler("Invalid signature file format! Allowed formats: PNG, JPEG, PDF", 400))
  }

  // Extract data from request body
  const {
    firstName,
    lastName,
    email,
    phone,
    nmcNumber,
    dob,
    gender,
    password,
    confirmPassword,
    role,
    doctorDepartment,
  } = req.body

  // Validate required fields
  if (!firstName || !lastName || !email || !phone || !dob || !gender || !password || !doctorDepartment || !nmcNumber) {
    return next(new ErrorHandler("All fields are required!", 400))
  }

  // Validate password match
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Password and Confirm Password Do Not Match", 400))
  }

  // Check if email is already registered
  const isRegistered = await User.findOne({ email })
  if (isRegistered) {
    return next(new ErrorHandler("Email is already registered!", 400))
  }

  // Check if NMC number is already registered
  const existsByNmc = await User.findOne({ nmcNumber })
  if (existsByNmc) {
    return next(new ErrorHandler("This NMC number is already registered!", 400))
  }

  try {
    // Upload signature file to cloudinary
    const signatureResult = await cloudinary.uploader.upload(signatureFile.tempFilePath, {
      folder: "doctor_signatures",
      resource_type: "auto",
    })

    // Create new doctor user
    const doctor = await User.create({
      firstName,
      lastName,
      email,
      phone,
      nmcNumber,
      dob,
      gender,
      password,
      doctorDepartment,
      role: "Doctor",
      signature: {
        public_id: signatureResult.public_id,
        url: signatureResult.secure_url,
      },
      status: "PendingVerification",
    })

    // Send email to admin about new doctor registration
    const admin = await User.findOne({ role: "Admin" })
    if (admin && admin.email) {
      await sendEmail({
        to: admin.email,
        subject: `MediCure: New Doctor Registration - Verification Required`,
        text: `A new doctor has registered and requires verification: Dr. ${firstName} ${lastName}`,
        html: `
          <p>A new doctor has registered and requires verification:</p>
          <ul>
            <li>Name: Dr. ${firstName} ${lastName}</li>
            <li>Email: ${email}</li>
            <li>Phone: ${phone}</li>
            <li>Department: ${doctorDepartment}</li>
            <li>NMC Number: ${nmcNumber}</li>
          </ul>
          <p>Please verify their NMC number and approve their registration.</p>
        `
      })
    }

    res.status(201).json({
      success: true,
      message: "Doctor registered. Awaiting verification.",
      doctorId: doctor._id,
    })
  } catch (error) {
    console.error("Error in doctor registration:", error)
    return next(new ErrorHandler(`Registration failed: ${error.message}`, 500))
  }
})

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

  // Delete the doctor
  await User.findByIdAndDelete(doctorId);

  res.status(200).json({
    success: true,
    message: "Doctor deleted successfully and related appointments updated"
  });
});

export const getUnverifiedDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor", status: "PendingVerification" });

  res.status(200).json({
    success: true,
    count: doctors.length,
    doctors,
  });
});

export const updateDoctorVerificationStatus = catchAsyncErrors(async (req, res, next) => {
  const { doctorId } = req.params;
  const { nmcVerified } = req.body;

  const doctor = await User.findOne({ _id: doctorId, role: "Doctor" });
  if (!doctor) {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  if (typeof nmcVerified === "boolean") doctor.isNmcVerified = nmcVerified;

  // If doctor is rejected, delete their data
  if (nmcVerified === false) {
    // Delete doctor's signature from cloudinary if it exists
    if (doctor.signature && doctor.signature.public_id) {
      await cloudinary.uploader.destroy(doctor.signature.public_id);
    }

    // Delete doctor's avatar from cloudinary if it exists
    if (doctor.docAvatar && doctor.docAvatar.public_id) {
      await cloudinary.uploader.destroy(doctor.docAvatar.public_id);
    }

    // Delete the doctor from database
    await User.findByIdAndDelete(doctorId);

    // Send rejection email
    if (doctor.email) {
      await sendEmail({
        to: doctor.email,
        subject: `MediCure: Doctor Registration Rejected`,
        text: `Your doctor registration has been rejected.`,
        html: `
          <p>Dear Dr. ${doctor.firstName} ${doctor.lastName},</p>
          <p>We regret to inform you that your doctor registration has been rejected.</p>
          <p>If you believe this is an error, please contact the admin for further assistance.</p>
        `
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor registration rejected and data deleted successfully",
    });
  }

  // If verified, update status to Verified
  if (doctor.isNmcVerified) {
    doctor.status = "Verified";
    await doctor.save();

    // Send approval email
    if (doctor.email) {
      await sendEmail({
        to: doctor.email,
        subject: `MediCure: Doctor Registration Approved`,
        text: `Your doctor registration has been approved.`,
        html: `
          <p>Dear Dr. ${doctor.firstName} ${doctor.lastName},</p>
          <p>Your doctor registration has been approved.</p>
          <p>You can now log in to your account and start accepting appointments.</p>
        `
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor verification updated. Current status: Verified",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Doctor verification status updated",
  });
});

export const uploadDoctorAvatar = catchAsyncErrors(async (req, res, next) => {
  // Check if file is uploaded
  if (!req.files || !req.files.avatar) {
    return next(new ErrorHandler("No file uploaded", 400));
  }

  const file = req.files.avatar;

  // Validate file type (optional)
  if (!["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
    return next(new ErrorHandler("Only JPG and PNG files are allowed", 400));
  }

  // Upload to Cloudinary
  const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "doctor_avatars",
    resource_type: "image",
  });

  // Update user in DB
  const doctor = await User.findByIdAndUpdate(
    req.user._id,
    { docAvatar: { public_id: result.public_id, url: result.secure_url } },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Avatar uploaded successfully",
    avatarUrl: result.secure_url,
    doctor,
  });
});

export const uploadPatientAvatar = catchAsyncErrors(async (req, res, next) => {
  // Check if file is uploaded
  if (!req.files || !req.files.avatar) {
    return next(new ErrorHandler("No file uploaded", 400));
  }

  const file = req.files.avatar;

  // Validate file type (optional)
  if (!["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
    return next(new ErrorHandler("Only JPG and PNG files are allowed", 400));
  }

  // Upload to Cloudinary
  const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "patient_avatars",
    resource_type: "image",
  });

  // Update user in DB
  const patient = await User.findByIdAndUpdate(
    req.user._id,
    { userAvatar: { public_id: result.public_id, url: result.secure_url } },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Avatar uploaded successfully",
    avatarUrl: result.secure_url,
    patient,
  });
});

