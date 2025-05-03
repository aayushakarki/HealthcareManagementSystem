"use client"

import { useState, useEffect } from "react"
import { Bell, Calendar, Pill, FileText, X, Check } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:4000/api/v1/notifications/user", {
          withCredentials: true,
        })

        if (response.data.success) {
          setNotifications(response.data.notifications)
        } else {
          setNotifications([])
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        toast.error("Failed to load notifications")
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const unreadNotifications = notifications.filter((notification) => !notification.read)
  const readNotifications = notifications.filter((notification) => notification.read)

  const markAsRead = async (notificationId) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/v1/notifications/read/${notificationId}`,
        {},
        {
          withCredentials: true,
        },
      )

      if (response.data.success) {
        setNotifications(
          notifications.map((notification) =>
            notification._id === notificationId ? { ...notification, read: true } : notification,
          ),
        )
        toast.success("Notification marked as read")
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast.error("Failed to update notification")
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await axios.put(
        "http://localhost:4000/api/v1/notifications/read-all",
        {},
        {
          withCredentials: true,
        },
      )

      if (response.data.success) {
        setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
        toast.success("All notifications marked as read")
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast.error("Failed to update notifications")
    }
  }

  const dismissNotification = async (notificationId) => {
    try {
      const response = await axios.delete(`http://localhost:4000/api/v1/notifications/delete/${notificationId}`, {
        withCredentials: true,
      })

      if (response.data.success) {
        setNotifications(notifications.filter((notification) => notification._id !== notificationId))
        toast.success("Notification deleted")
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.error("Failed to delete notification")
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "Appointment":
        return <Calendar className="w-5 h-5" />
      case "Medication":
        return <Pill className="w-5 h-5" />
      case "HealthRecord":
        return <FileText className="w-5 h-5" />
      case "Vitals":
        return <FileText className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getPriorityClass = (type) => {
    switch (type) {
      case "Appointment":
        return "priority-high"
      case "Medication":
        return "priority-medium"
      case "HealthRecord":
        return "priority-medium"
      case "Vitals":
        return "priority-low"
      default:
        return "priority-low"
    }
  }

  if (loading) {
    return <div className="loading">Loading notifications...</div>
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Notifications</h2>
        <div className="notification-actions">
          <button className="mark-all-read" onClick={markAllAsRead}>
            Mark all as read
          </button>
        </div>
      </div>

      {unreadNotifications.length > 0 && (
        <div className="notification-section">
          <h3>New Notifications</h3>
          <div className="notifications-list">
            {unreadNotifications.map((notification) => (
              <div key={notification._id} className={`notification-card ${getPriorityClass(notification.type)}`}>
                <div className="notification-icon">{getNotificationIcon(notification.type)}</div>
                <div className="notification-content">
                  <div className="notification-type">{notification.type || "System"}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-date">{new Date(notification.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="notification-actions">
                  <button className="action-btn read-btn" onClick={() => markAsRead(notification._id)}>
                    <Check className="w-4 h-4" />
                  </button>
                  <button className="action-btn dismiss-btn" onClick={() => dismissNotification(notification._id)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {readNotifications.length > 0 && (
        <div className="notification-section">
          <h3>Earlier Notifications</h3>
          <div className="notifications-list">
            {readNotifications.map((notification) => (
              <div key={notification._id} className="notification-card read">
                <div className="notification-icon">{getNotificationIcon(notification.type)}</div>
                <div className="notification-content">
                  <div className="notification-type">{notification.type || "System"}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-date">{new Date(notification.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="notification-actions">
                  <button className="action-btn dismiss-btn" onClick={() => dismissNotification(notification._id)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {notifications.length === 0 && (
        <div className="no-notifications">
          <Bell className="w-12 h-12 text-gray-300" />
          <p>You have no notifications</p>
        </div>
      )}
    </div>
  )
}

export default Notifications
