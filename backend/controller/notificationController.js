import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/errorMiddleware.js"
import { Notification } from "../models/notificationSchema.js"

// Get user notifications
export const getUserNotifications = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id

  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    notifications,
  })
})

// Mark notification as read
export const markNotificationAsRead = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params

  const notification = await Notification.findById(id)

  if (!notification) {
    return next(new ErrorHandler("Notification not found!", 404))
  }

  // Check if the notification belongs to the user
  if (notification.userId.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to update this notification!", 403))
  }

  notification.read = true
  await notification.save()

  res.status(200).json({
    success: true,
    message: "Notification marked as read!",
  })
})

// Mark all notifications as read
export const markAllNotificationsAsRead = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id

  await Notification.updateMany({ userId, read: false }, { read: true })

  res.status(200).json({
    success: true,
    message: "All notifications marked as read!",
  })
})

// Delete a notification
export const deleteNotification = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params

  const notification = await Notification.findById(id)

  if (!notification) {
    return next(new ErrorHandler("Notification not found!", 404))
  }

  // Check if the notification belongs to the user
  if (notification.userId.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to delete this notification!", 403))
  }

  await notification.deleteOne()

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully!",
  })
})

// Create a notification (for system use)
export const createNotification = catchAsyncErrors(async (req, res, next) => {
  const { userId, message, type, relatedId, onModel } = req.body

  if (!userId || !message) {
    return next(new ErrorHandler("User ID and message are required!", 400))
  }

  const notification = await Notification.create({
    userId,
    message,
    type: type || "System",
    relatedId,
    onModel,
  })

  res.status(201).json({
    success: true,
    notification,
    message: "Notification created successfully!",
  })
})
