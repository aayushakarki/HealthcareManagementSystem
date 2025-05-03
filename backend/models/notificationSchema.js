import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "User ID is required!"],
  },
  message: {
    type: String,
    required: [true, "Notification message is required!"],
  },
  type: {
    type: String,
    enum: ["Appointment", "HealthRecord", "Vitals", "System", "Other"],
    default: "System",
  },
  read: {
    type: Boolean,
    default: false,
  },
  relatedId: {
    type: mongoose.Schema.ObjectId,
    refPath: "onModel",
  },
  onModel: {
    type: String,
    enum: ["Appointment", "HealthRecord", "Vitals"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const Notification = mongoose.model("Notification", notificationSchema)
