import express from "express"
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
} from "../controller/notificationController.js"
import { isAdminAuthenticated, isPatientAuthenticated } from "../middlewares/auth.js"

const router = express.Router()

// User notifications (works for all authenticated users)
router.get("/user", isPatientAuthenticated, getUserNotifications)
router.put("/read/:id", isPatientAuthenticated, markNotificationAsRead)
router.put("/read-all", isPatientAuthenticated, markAllNotificationsAsRead)
router.delete("/delete/:id", isPatientAuthenticated, deleteNotification)

// Admin only - create notifications for users
router.post("/create", isAdminAuthenticated, createNotification)

export default router
