"use client"
import { X, Save } from "lucide-react"
import { useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import AppointmentBookingForm from "./AppointmentBookingForm"

const AppointmentPopup = ({ isVisible, onClose, appointments, date, onBookAppointment, userRole }) => {
  const [notes, setNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)

  if (!isVisible || !date) return null

  const appointment = appointments && appointments.length > 0 ? appointments[0] : null

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  })

  // Format time from date string
  const formatTimeFromDate = (dateString) => {
    if (!dateString) return "No time specified"
    const date = new Date(dateString)
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")

    // Calculate end time (40 minutes later)
    const endDate = new Date(date)
    endDate.setMinutes(endDate.getMinutes() + 40)
    const endHours = endDate.getHours().toString().padStart(2, "0")
    const endMinutes = endDate.getMinutes().toString().padStart(2, "0")

    return `${hours}:${minutes} - ${endHours}:${endMinutes}`
  }

  const handleSaveNotes = async () => {
    if (!appointment || !notes.trim()) return

    setSavingNotes(true)
    try {
      const response = await axios.put(
        `http://localhost:4000/api/v1/appointment/update/${appointment._id}`,
        { doctorNotes: notes },
        { withCredentials: true },
      )

      if (response.data.success) {
        toast.success("Notes saved successfully")
        onClose()
      } else {
        toast.error("Failed to save notes")
      }
    } catch (error) {
      console.error("Error saving notes:", error)
      toast.error("Failed to save notes")
    } finally {
      setSavingNotes(false)
    }
  }

  const handleBookAppointment = () => {
    setShowBookingForm(true)
  }

  const handleBookingSuccess = () => {
    setShowBookingForm(false)
    onClose()
    // Refresh appointments if needed
    if (typeof onBookAppointment === "function") {
      onBookAppointment()
    }
  }

  // If booking form is visible, show it
  if (showBookingForm) {
    return (
      <AppointmentBookingForm
        isVisible={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        prefilledDate={date ? date.toISOString().slice(0, 16) : ""}
        onSubmitSuccess={handleBookingSuccess}
      />
    )
  }

  // If no appointment and user is patient, show book appointment option
  if (!appointment && userRole === "patient") {
    return (
      <div className="appointment-popup-overlay">
        <div className="appointment-popup">
          <div className="appointment-popup-header">
            <h3>Appointment Notes</h3>
            <button className="close-btn" onClick={onClose}>
              <X />
            </button>
          </div>
          <div className="appointment-popup-content">
            <p>No appointment scheduled for {formattedDate}</p>
            <button className="book-appointment-btn" onClick={handleBookAppointment}>
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    )
  }

  // For doctor viewing an appointment
  if (userRole === "doctor" && appointment) {
    return (
      <div className="appointment-popup-overlay">
        <div className="appointment-popup">
          <div className="appointment-popup-header">
            <h3>Appointment Notes</h3>
            <button className="close-btn" onClick={onClose}>
              <X />
            </button>
          </div>
          <div className="appointment-popup-content">
            <div className="appointment-details">
              <p>
                <strong>Patient:</strong> {appointment.firstName} {appointment.lastName}
              </p>
              <p>
                <strong>Date:</strong> {formattedDate}
              </p>
              <p>
                <strong>Department:</strong> {appointment.department}
              </p>
            </div>

            <div className="doctor-notes-section">
              <h4>Doctor's Notes</h4>
              <textarea
                placeholder="Enter your notes about this appointment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="notes-textarea"
              />
            </div>

            <div className="appointment-popup-actions">
              <button className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button className="save-notes-btn" onClick={handleSaveNotes} disabled={savingNotes}>
                <Save className="icon" />
                Save Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // For patient viewing their appointment
  if (userRole === "patient" && appointment) {
    return (
      <div className="appointment-popup-overlay">
        <div className="appointment-popup">
          <div className="appointment-popup-header">
            <h3>Appointment Details</h3>
            <button className="close-btn" onClick={onClose}>
              <X />
            </button>
          </div>
          <div className="appointment-popup-content">
            <div className="appointment-details">
              <p>
                <strong>Doctor:</strong> Dr.{" "}
                {appointment.doctorName || `${appointment.doctor?.firstName} ${appointment.doctor?.lastName}`}
              </p>
              <p>
                <strong>Date:</strong> {formattedDate}
              </p>
              <p>
                <strong>Time:</strong> {formatTimeFromDate(appointment.appointment_date || appointment.date)}
              </p>
              <p>
                <strong>Department:</strong> {appointment.department}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status-badge status-${appointment.status || "confirmed"}`}>
                  {appointment.status || "Confirmed"}
                </span>
              </p>
            </div>

            <div className="appointment-popup-actions">
              <button className="cancel-btn" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // For doctor with no appointments on this day
  if (userRole === "doctor" && (!appointments || appointments.length === 0)) {
    return (
      <div className="appointment-popup-overlay">
        <div className="appointment-popup">
          <div className="appointment-popup-header">
            <h3>Appointment Notes</h3>
            <button className="close-btn" onClick={onClose}>
              <X />
            </button>
          </div>
          <div className="appointment-popup-content">
            <p>No appointments scheduled for {formattedDate}</p>
            <div className="appointment-popup-actions">
              <button className="cancel-btn" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default AppointmentPopup
