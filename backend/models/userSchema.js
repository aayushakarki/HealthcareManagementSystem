import mongoose from "mongoose"
import validator from "validator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: [3, "First Name Must Contain At Least 3 Characters!"],
  },
  lastName: {
    type: String,
    required: true,
    minLength: [3, "Last Name Must Contain At Least 3 Characters!"],
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, "Please Provide A Valid Email!"],
  },
  phone: {
    type: String,
    required: true,
    minLength: [10, "Phone Number Must Contain Exact 10 Digits!"],
    maxLength: [10, "Phone Number Must Contain Exact 10 Digits!"],
  },
  dob: {
    type: Date,
    required: [true, "DOB Is Required"],
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Others"],
  },
  password: {
    type: String,
    required: true,
    minLength: [8, "Password Must Contain At Least 8 Character!"],
    select: false,
  },
  role: {
    type: String,
    required: true,
    enum: ["Admin", "Patient", "Doctor"],
  },
  doctorDepartment: {
    type: String,
    required: function () {
      return this.role === "Doctor"
    },
  },
  docAvatar: {
    public_id: String,
    url: String,
  },
  userAvatar: {
    public_id: String,
    url: String,
  },
  signature: {
    public_id: String,
    url: String,
  },
  status: {
    type: String,
    enum: ["PendingVerification", "Verified", "Rejected"],
    default: function () {
      return this.role === "Doctor" ? "PendingVerification" : "Verified"
    },
  },
  nmcNumber: {
    type: String,
    required: function () {
      return this.role === "Doctor"
    },
    unique: function () {
      return this.role === "Doctor"
    },
  },
  isNmcVerified: {
    type: Boolean,
    default: false,
  },
})

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  })
}

export const User = mongoose.model("User", userSchema)
