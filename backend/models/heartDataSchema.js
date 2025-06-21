import mongoose from "mongoose";

const heartDataSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Features for the prediction model
  age: { type: Number, required: true },
  sex: { type: Number, required: true }, // 1 = male; 0 = female
  cp: { type: Number, required: true },
  trestbps: { type: Number, required: true },
  chol: { type: Number, required: true },
  fbs: { type: Number, required: true },
  restecg: { type: Number, required: true },
  thalach: { type: Number, required: true },
  exang: { type: Number, required: true },
  oldpeak: { type: Number, required: true },
  slope: { type: Number, required: true },
  ca: { type: Number, required: true },
  thal: { type: Number, required: true },
}, { timestamps: true });

export const HeartData = mongoose.model("HeartData", heartDataSchema);