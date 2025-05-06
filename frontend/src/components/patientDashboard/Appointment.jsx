"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Calendar, Clock, X, Edit, Plus } from "lucide-react"
import { toast } from "react-toastify"
import AppointmentBookingForm from "../patientDashboard/AppointmentBookingForm"

const AppointmentList = ({ showBookingForm = false, setShowBookingForm = () => {}, prefilledDate = "" }) => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("upcoming") // upcoming, past, all
  const [isBookingFormVisible, setIsBookingFormVisible] = useState(showBookingForm)

  useEffect(() => {
    setIsBookingFormVisible(showBookingForm)
  }, [showBookingForm])

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:4000/api/v1/appointment/patient", {
          withCredentials: true,
        })

        if (response.data.success) {
          // Transform backend data to match frontend structure
          const formattedAppointments = response.data.appointments.map((appointment) => ({
            _id: appointment._id,
            doctorName: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
            date: appointment.appointment_date,
            time: formatTimeFromDate(appointment.appointment_date),
            reason: appointment.department,
            specialty: appointment.department,
            status: appointment.status || "confirmed",
            doctorNotes: appointment.doctorNotes,
          }))

          setAppointments(formattedAppointments)
        } else {
          setAppointments([])
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast.error("Failed to load appointments")
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  // Helper function to format time from date string
  const formatTimeFromDate = (dateString) => {
    const date = new Date(dateString)
    const hours = date.getHours()
    const minutes = date.getMinutes()

    // Format start time
    const startHour = hours.toString().padStart(2, "0")
    const startMinutes = minutes.toString().padStart(2, "0")

    // Format end time (assume 40 minutes appointment)
    const endDate = new Date(date)
    endDate.setMinutes(endDate.getMinutes() + 40)
    const endHour = endDate.getHours().toString().padStart(2, "0")
    const endMinutes = endDate.getMinutes().toString().padStart(2, "0")

    return `${startHour}:${startMinutes} - ${endHour}:${endMinutes}`
  }

  // Filter appointments based on selected filter
  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (filter === "upcoming") {
      return appointmentDate >= today && appointment.status !== "cancelled"
    } else if (filter === "past") {
      return appointmentDate < today || appointment.status === "completed"
    } else {
      return true // all appointments
    }
  })

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "status-confirmed"
      case "completed":
        return "status-completed"
      case "cancelled":
        return "status-cancelled"
      default:
        return ""
    }
  }

  const handleReschedule = (appointmentId) => {
    // Implement reschedule functionality
    toast.info(`Reschedule functionality for appointment ${appointmentId} will be implemented soon`)
  }

  const handleCancel = (appointmentId) => {
    // Implement cancel functionality
    toast.info(`Cancel functionality for appointment ${appointmentId} will be implemented soon`)
  }

  const handleBookingSuccess = () => {
    setIsBookingFormVisible(false)
    if (typeof setShowBookingForm === "function") {
      setShowBookingForm(false)
    }

    // Refresh appointments list
    fetchAppointments()
  }

  const fetchAppointments = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/v1/appointment/patient", {
        withCredentials: true,
      })

      if (response.data.success) {
        const formattedAppointments = response.data.appointments.map((appointment) => ({
          _id: appointment._id,
          doctorName: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
          date: appointment.appointment_date,
          time: formatTimeFromDate(appointment.appointment_date),
          reason: appointment.department,
          specialty: appointment.department,
          status: appointment.status || "confirmed",
          doctorNotes: appointment.doctorNotes,
        }))

        setAppointments(formattedAppointments)
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast.error("Failed to refresh appointments")
    }
  }

  if (loading) {
    return <div className="loading">Loading appointments...</div>
  }

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h2>Your Appointments</h2>
        <div className="header-actions">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === "upcoming" ? "active" : ""}`}
              onClick={() => setFilter("upcoming")}
            >
              Upcoming
            </button>
            <button className={`filter-tab ${filter === "past" ? "active" : ""}`} onClick={() => setFilter("past")}>
              Past
            </button>
            <button className={`filter-tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
              All
            </button>
          </div>
          <button className="book-appointment-btn" onClick={() => setIsBookingFormVisible(true)}>
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      <div className="appointments-list-container">
        {filteredAppointments.length > 0 ? (
          <div className="appointments-table">
            <div className="table-header-box">
              <div className="table-header">
                <div className="header-cell">Doctor</div>
                <div className="header-cell">Date & Time</div>
                <div className="header-cell">Reason</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Notes</div>
              </div>
            </div>
            {filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="table-row">
                <div className="cell doctor-cell">
                  <div className="doctor-info">
                    <div className="doctor-name">Dr. {appointment.doctorName}</div>
                    <div className="doctor-specialty">{appointment.specialty}</div>
                  </div>
                </div>
                <div className="cell date-cell">
                  <div className="date">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(appointment.date).toLocaleDateString()}</span>
                  </div>
                  <div className="time">
                    <Clock className="w-4 h-4" />
                    <span>{appointment.time}</span>
                  </div>
                </div>
                <div className="cell reason-cell">{appointment.reason}</div>
                <div className="cell status-cell">
                  <span className={`status-badge ${getStatusClass(appointment.status)}`}>{appointment.status}</span>
                </div>
                <div className="cell notes-cell">
                  {appointment.doctorNotes ? (
                    <span>{appointment.doctorNotes}</span>
                  ) : (
                    <span className="no-notes">No notes</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-appointments">No appointments found</p>
        )}
      </div>

      {/* Appointment Booking Form */}
      <AppointmentBookingForm
        isVisible={isBookingFormVisible}
        onClose={() => {
          setIsBookingFormVisible(false)
          if (typeof setShowBookingForm === "function") {
            setShowBookingForm(false)
          }
        }}
        prefilledDate={prefilledDate}
        onSubmitSuccess={handleBookingSuccess}
      />
    </div>
  )
}

export default AppointmentList
