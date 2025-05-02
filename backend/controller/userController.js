import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

export const patientRegister = catchAsyncErrors(async(req,res,next)=>{
    const {
      firstName,
      lastName,
      email,
      phone,
      dob,
      gender,
      password,
      confirmPassword,
      role,
    } = req.body;
    if(
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !dob ||
      !gender ||
      !password ||
      !confirmPassword ||
      !role
    ){
        return next(new ErrorHandler("Please Fill Full Form!", 400))
    }
    let user = await User.findOne({ email });
    if(user){
        return next(new ErrorHandler("User Already Registered!", 400))
    }
    if(password !== confirmPassword){
      return next(new ErrorHandler("Password and Confirm Password Do Not Match", 400));
  }
    user = await User.create ({
      firstName,
      lastName,
      email,
      phone,
      dob,
      gender,
      password,
      role,
    });
    generateToken(user, "User Registered!", 200, res)
});


export const login = catchAsyncErrors(async(req,res,next)=>{
  const {email, password, role} = req.body; // Removed confirmPassword as it's not needed for login
  
  if(!email || !password || !role){
      return next(new ErrorHandler("Please Provide All Details", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
      return next(new ErrorHandler("Invalid Password Or Email", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid Password Or Email", 400));
  }

  // Check if the role matches
  if (role !== user.role) {
      return next(new ErrorHandler("Role mismatch! Please check your role", 400));
  }

  // Generate a token
  generateToken(user, "User Logged In Successfully!", 200, res);
});


export const addNewAdmin = catchAsyncErrors(async(req,res,next)=>{
    const {
        firstName,
        lastName,
        email,
        phone,
        dob,
        gender,
        password,
    } = req.body;  

    if(
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !dob ||
        !gender ||
        !password 
    ){
        return next(new ErrorHandler("Please Fill Full Form!", 400))
    }  

    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
      return next(new ErrorHandler("Admin With This Email Already Exists!", 400));
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
    });
    res.status(200).json({
      success: true,
      message: "New Admin Registered",
      admin,
    });
  });

export const addNewDoctor = async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400));
    }
    const { docAvatar } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File Format Not Supported!", 400));
    }
    const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        dob, 
        gender, 
        password, 
        doctorDepartment 
    } = req.body;
  
    if (
        !firstName || 
        !lastName || 
        !email || 
        !phone || 
        !dob || 
        !gender || 
        !password || 
        !doctorDepartment
        ) {
      return next(new ErrorHandler("Please Provide Full Details", 400));
    }
  
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
      return next(
        new ErrorHandler(
          `${isRegistered.role} Already Registered With This Email`,
          400
        )
      );
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(
      docAvatar.tempFilePath
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        "Cloudinary Error:",
        cloudinaryResponse.error || "Unknown Cloudinary error"
      );
      return next(
        new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500)
      );
    }
    const doctor = await User.create({
      firstName,
      lastName,
      email,
      phone,
      dob,
      gender,
      password,
      doctorDepartment,   // Store the department
      role: "Doctor", // Set role to "Doctor"
      docAvatar:{
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      }
    });
  
    // Generate a token and send a response
    res.status(200).json({
        success: true,
        message: "New Doctor Resgistered!",
        doctor
    })
  };

  export const getAllDoctors = catchAsyncErrors(async(req,res,next)=>{
    const doctors = await User.find({role: "Doctor"});
    res.status(200).json({
        success: true,
        doctors,
    });
  });

  export const getUserDetails = catchAsyncErrors(async(req,res,next)=>{
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
  });

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
      });
  });

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
      });
  });

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
      });
  });