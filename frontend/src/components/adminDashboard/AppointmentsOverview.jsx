"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Calendar, Clock, Filter, ChevronDown } from "lucide-react"

const AppointmentsOverview = ({ appointments = [], updateStatus, onPatientSelect }) => {
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null)
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState(null)
  const [newDate, setNewDate] = useState("")

  useEffect(() => {
    const fetchAppointments = async () => {
      if (appointments.length > 0) {
        // Extract unique departments from appointments
        const uniqueDepartments = [...new Set(appointments.map((app) => app.department).filter(Boolean))]
        setDepartments(uniqueDepartments)
        filterAppointments()
        return
      }

      try {
        setLoading(true)
        const response = await axios.get("http://localhost:4000/api/v1/appointment/getall", {
          withCredentials: true,
        })

        if (response.data.success) {
          const allAppointments = response.data.appointments || []

          // Extract unique departments
          const uniqueDepartments = [...new Set(allAppointments.map((app) => app.department).filter(Boolean))]
          setDepartments(uniqueDepartments)

          // Apply filters to the fetched appointments
          let filtered = [...allAppointments]

          // Apply status filter
          if (statusFilter !== "all") {
            filtered = filtered.filter((app) => (app.status || "").toLowerCase() === statusFilter.toLowerCase())
          }

          // Apply department filter
          if (departmentFilter !== "all") {
            filtered = filtered.filter((app) => app.department === departmentFilter)
          }

          // Apply date filter
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          const nextWeek = new Date(today)
          nextWeek.setDate(nextWeek.getDate() + 7)
          const nextMonth = new Date(today)
          nextMonth.setMonth(nextMonth.getMonth() + 1)

          if (dateFilter === "today") {
            filtered = filtered.filter((app) => {
              const appDate = new Date(app.appointment_date)
              return appDate >= today && appDate < tomorrow
            })
          } else if (dateFilter === "week") {
            filtered = filtered.filter((app) => {
              const appDate = new Date(app.appointment_date)
              return appDate >= today && appDate < nextWeek
            })
          } else if (dateFilter === "month") {
            filtered = filtered.filter((app) => {
              const appDate = new Date(app.appointment_date)
              return appDate >= today && appDate < nextMonth
            })
          }

          // Sort by date
          filtered.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))

          setFilteredAppointments(filtered)
        } else {
          toast.error("Failed to load appointments")
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast.error("Failed to load appointments")
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [appointments, statusFilter, dateFilter, departmentFilter])

  const filterAppointments = () => {
    let filtered = [...appointments]

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => (app.status || "").toLowerCase() === statusFilter.toLowerCase())
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((app) => app.department === departmentFilter)
    }

    // Apply date filter
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const nextMonth = new Date(today)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    if (dateFilter === "today") {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.appointment_date)
        return appDate >= today && appDate < tomorrow
      })
    } else if (dateFilter === "week") {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.appointment_date)
        return appDate >= today && appDate < nextWeek
      })
    } else if (dateFilter === "month") {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.appointment_date)
        return appDate >= today && appDate < nextMonth
      })
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))

    setFilteredAppointments(filtered)
  }

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

  // Helper function to handle appointment status updates
  const handleUpdateStatus = async (appointmentId, status) => {
    setUpdatingAppointmentId(appointmentId)
    try {
      await updateStatus(appointmentId, status, newDate)
    } finally {
      setUpdatingAppointmentId(null)
    }
  }

  // Format status for display (capitalize first letter)
  const formatStatus = (status) => {
    if (!status) return "Pending"
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  // Group appointments by date
  const groupAppointmentsByDate = () => {
    const grouped = {}

    filteredAppointments.forEach((appointment) => {
      const date = new Date(appointment.appointment_date).toLocaleDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(appointment)
    })

    return grouped
  }

  const groupedAppointments = groupAppointmentsByDate()

  const handleReschedule = (appointmentId) => {
    setShowDatePicker(true)
  }

  if (loading) {
    return <div className="loading">Loading appointments...</div>
  }

  return (
    <div className="appointments-overview-container">
      <div className="section-header">
        <h2>Appointments Overview</h2>
        <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4 mr-1" />
          Filters
          <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
      </div>

      {showFilters && (
        <div className="filters-container">
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Department:</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Date:</label>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="filter-select">
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      )}

      <div className="appointments-by-date">
        {Object.keys(groupedAppointments).length > 0 ? (
          Object.entries(groupedAppointments).map(([date, dateAppointments]) => (
            <div key={date} className="date-group">
              <div className="date-header">
                <Calendar className="w-5 h-5 mr-2" />
                <h3>
                  {date} ({dateAppointments.length} appointments)
                </h3>
              </div>

              <div className="appointments-list">
                {dateAppointments.map((appointment) => (
                  <div key={appointment._id} className="appointment-card">
                    <div className="appointment-header">
                      <div className="appointment-time">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatTimeFromDate(appointment.appointment_date)}</span>
                      </div>
                      <div className={`appointment-status status-${(appointment.status || "pending").toLowerCase()}`}>
                        {formatStatus(appointment.status)}
                      </div>
                    </div>

                    <div className="appointment-body">
                      <h3 className="department">{appointment.department}</h3>
                      <div className="patient-info">
                        <p className="patient-name">
                          <strong>Patient:</strong> {appointment.firstName} {appointment.lastName}
                        </p>
                        <p className="patient-details">
                          <span>{appointment.gender}</span>
                          {appointment.dob && <span> • {new Date(appointment.dob).toLocaleDateString()}</span>}
                        </p>
                        {appointment.phone && (
                          <p className="patient-contact">
                            <strong>Phone:</strong> {appointment.phone}
                          </p>
                        )}
                        {appointment.doctor && (
                          <p className="doctor-info">
                            <strong>Doctor:</strong> {appointment.doctor.firstName} {appointment.doctor.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="appointment-actions">
                      <button
                        className="btn-primary"
                        onClick={() =>
                          onPatientSelect({
                            _id: appointment.patientId,
                            firstName: appointment.firstName,
                            lastName: appointment.lastName,
                          })
                        }
                      >
                        View Patient
                      </button>
                      <div className="status-update-container">
                        <button
                          className="btn-outline btn-sm"
                          onClick={() =>
                            setOpenStatusDropdown(openStatusDropdown === appointment._id ? null : appointment._id)
                          }
                          disabled={updatingAppointmentId === appointment._id}
                        >
                          {updatingAppointmentId === appointment._id ? "Updating..." : "Update Status"}
                          <ChevronDown
                            className={`w-4 h-4 ml-1 transition-transform ${openStatusDropdown === appointment._id ? "rotate-180" : ""}`}
                          />
                        </button>

                        {openStatusDropdown === appointment._id && (
                          <div className="status-options-row">
                            {["Pending", "Completed", "Cancelled", "Accepted", "Rejected"].map(
                              (status) => (
                                <button
                                  key={status}
                                  className="status-option-button"
                                  onClick={() => {
                                    handleUpdateStatus(appointment._id, status)
                                    setOpenStatusDropdown(null)
                                  }}
                                >
                                  {status}
                                </button>
                              ),
                            )}
                            <button
                              key="Rescheduled"
                              className="status-option-button"
                              onClick={() => {
                                setRescheduleAppointmentId(appointment._id);
                                setShowDatePicker(true);
                              }}
                            >
                              Reschedule
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-appointments">
            <p>No appointments found</p>
          </div>
        )}
      </div>

      {showDatePicker && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Pick a new date and time for the appointment</h3>
            <input
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="form-input"
            />
            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={async () => {
                  await updateStatus(rescheduleAppointmentId, "Rescheduled", newDate);
                  setShowDatePicker(false);
                  setRescheduleAppointmentId(null);
                  setNewDate("");
                }}
                disabled={!newDate}
              >
                Confirm
              </button>
              <button
                className="btn-outline"
                onClick={() => {
                  setShowDatePicker(false);
                  setRescheduleAppointmentId(null);
                  setNewDate("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentsOverview
