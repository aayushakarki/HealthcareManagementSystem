import mongoose from "mongoose"

const vitalsSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Patient ID is required!"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  bloodPressure: {
    systolic: {
      type: Number,
      required: [true, "Systolic blood pressure is required!"],
    },
    diastolic: {
      type: Number,
      required: [true, "Diastolic blood pressure is required!"],
    },
  },
  heartRate: {
    type: Number,
    required: [true, "Heart rate is required!"],
  },
  cholesterol: {
    type: Number,
  },
  hdlCholesterol: {
    type: Number,
  },
  respiratoryRate: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  height: {
    type: Number,
  },
  notes: {
    type: String,
  },
  recordedBy: {
    type: String,
    enum: ["Patient", "Doctor", "Nurse"],
    default: "Patient",
  },
})

export const Vitals = mongoose.model("Vitals", vitalsSchema)
