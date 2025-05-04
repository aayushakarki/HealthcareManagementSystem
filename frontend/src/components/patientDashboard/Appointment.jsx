"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Calendar, Clock, X, Edit, Plus } from "lucide-react"
import { toast } from "react-toastify"

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("upcoming") // upcoming, past, all
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [departments, setDepartments] = useState([
    "General Physician",
    "Cardiology",
    "Dermatology",
    "Orthopedics",
    "Neurology",
    "Pediatrics",
    "Gynecology",
    "Ophthalmology",
    "Dentistry",
    "Psychiatry",
  ])
  const [doctors, setDoctors] = useState([])
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Male",
    appointment_date: "",
    department: "",
    doctor_firstName: "",
    doctor_lastName: "",
    hasVisited: false,
    address: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)

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

    // Fetch user profile to pre-fill form data
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/v1/user/patient/me", {
          withCredentials: true,
        })

        if (response.data.success) {
          const user = response.data.user
          setFormData((prev) => ({
            ...prev,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            phone: user.phone || "",
            dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
            gender: user.gender || "Male",
            address: user.address || "",
          }))
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }

    fetchUserProfile()
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      })
    }
  }

  const handleDepartmentChange = async (e) => {
    const department = e.target.value
    setFormData({
      ...formData,
      department,
      doctor_firstName: "",
      doctor_lastName: "",
    })

    if (department) {
      try {
        setLoadingDoctors(true)
        // Fetch doctors by department from the backend
        const response = await axios.get(`http://localhost:4000/api/v1/user/doctors/${department}`, {
          withCredentials: true,
        })

        if (response.data.success) {
          setDoctors(response.data.doctors)
        } else {
          setDoctors([])
          toast.error("No doctors found for this department")
        }
      } catch (error) {
        console.error("Error fetching doctors:", error)
        toast.error("Failed to load doctors for this department")
        setDoctors([])
      } finally {
        setLoadingDoctors(false)
      }
    } else {
      setDoctors([])
    }
  }

  const handleDoctorChange = (e) => {
    const [firstName, lastName] = e.target.value.split(" ")
    setFormData({
      ...formData,
      doctor_firstName: firstName || "",
      doctor_lastName: lastName || "",
    })
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.firstName) errors.firstName = "First name is required"
    if (!formData.lastName) errors.lastName = "Last name is required"
    if (!formData.email) errors.email = "Email is required"
    if (!formData.phone) errors.phone = "Phone number is required"
    if (!formData.dob) errors.dob = "Date of birth is required"
    if (!formData.gender) errors.gender = "Gender is required"
    if (!formData.appointment_date) errors.appointment_date = "Appointment date is required"
    if (!formData.department) errors.department = "Department is required"
    if (!formData.doctor_firstName || !formData.doctor_lastName) errors.doctor = "Doctor is required"
    if (!formData.address) errors.address = "Address is required"

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setSubmitting(true)

    try {
      const response = await axios.post("http://localhost:4000/api/v1/appointment/book", formData, {
        withCredentials: true,
      })

      if (response.data.success) {
        toast.success("Appointment booked successfully!")
        setShowBookingForm(false)

        // Refresh appointments list
        const appointmentsResponse = await axios.get("http://localhost:4000/api/v1/appointment/patient", {
          withCredentials: true,
        })

        if (appointmentsResponse.data.success) {
          const formattedAppointments = appointmentsResponse.data.appointments.map((appointment) => ({
            _id: appointment._id,
            doctorName: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
            date: appointment.appointment_date,
            time: formatTimeFromDate(appointment.appointment_date),
            reason: appointment.department,
            specialty: appointment.department,
            status: appointment.status || "confirmed",
          }))

          setAppointments(formattedAppointments)
        }
      } else {
        toast.error(response.data.message || "Failed to book appointment")
      }
    } catch (error) {
      console.error("Error booking appointment:", error)
      toast.error(error.response?.data?.message || "Failed to book appointment")
    } finally {
      setSubmitting(false)
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
          <button className="book-appointment-btn" onClick={() => setShowBookingForm(true)}>
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      <div className="appointments-list-container">
        {filteredAppointments.length > 0 ? (
          <div className="appointments-table">
            <div className="table-header">
              <div className="header-cell">Doctor</div>
              <div className="header-cell">Date & Time</div>
              <div className="header-cell">Reason</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Actions</div>
            </div>

            {filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="table-row">
                <div className="cell doctor-cell">
                  <div className="doctor-avatar">
                    <img src="/placeholder.svg?height=40&width=40" alt={appointment.doctorName} />
                  </div>
                  <div className="doctor-info">
                    <h4>Dr. {appointment.doctorName}</h4>
                    <p>{appointment.specialty}</p>
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

                <div className="cell actions-cell">
                  {appointment.status === "confirmed" && (
                    <>
                      <button className="action-btn edit-btn" onClick={() => handleReschedule(appointment._id)}>
                        <Edit className="w-4 h-4" />
                        <span>Reschedule</span>
                      </button>
                      <button className="action-btn cancel-btn" onClick={() => handleCancel(appointment._id)}>
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                  {appointment.status === "completed" && (
                    <button className="action-btn">
                      <span>View Details</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-appointments">No appointments found</p>
        )}
      </div>

      {/* Appointment Booking Modal */}
      {showBookingForm && (
        <div className="modal-overlay">
          <div className="booking-modal">
            <div className="modal-header">
              <h3>Book New Appointment</h3>
              <button className="close-btn" onClick={() => setShowBookingForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-section">
                <h4>Personal Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name*</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={formErrors.firstName ? "error" : ""}
                    />
                    {formErrors.firstName && <span className="error-message">{formErrors.firstName}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name*</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={formErrors.lastName ? "error" : ""}
                    />
                    {formErrors.lastName && <span className="error-message">{formErrors.lastName}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email*</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? "error" : ""}
                    />
                    {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number*</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={formErrors.phone ? "error" : ""}
                    />
                    {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dob">Date of Birth*</label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className={formErrors.dob ? "error" : ""}
                    />
                    {formErrors.dob && <span className="error-message">{formErrors.dob}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender">Gender*</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={formErrors.gender ? "error" : ""}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors.gender && <span className="error-message">{formErrors.gender}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address*</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={formErrors.address ? "error" : ""}
                    rows="2"
                  ></textarea>
                  {formErrors.address && <span className="error-message">{formErrors.address}</span>}
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="hasVisited"
                      checked={formData.hasVisited}
                      onChange={handleInputChange}
                    />
                    <span>I have visited </span>
                  </label>
                </div>
              </div>

              <div className="form-section">
                <h4>Appointment Details</h4>

                <div className="form-group">
                  <label htmlFor="department">Department/Specialty*</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleDepartmentChange}
                    className={formErrors.department ? "error" : ""}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {formErrors.department && <span className="error-message">{formErrors.department}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="doctor">Doctor*</label>
                  <select
                    id="doctor"
                    name="doctor"
                    value={
                      formData.doctor_firstName && formData.doctor_lastName
                        ? `${formData.doctor_firstName} ${formData.doctor_lastName}`
                        : ""
                    }
                    onChange={handleDoctorChange}
                    className={formErrors.doctor ? "error" : ""}
                    disabled={!formData.department || loadingDoctors}
                  >
                    <option value="">{loadingDoctors ? "Loading doctors..." : "Select Doctor"}</option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={`${doctor.firstName} ${doctor.lastName}`}>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </option>
                    ))}
                  </select>
                  {formErrors.doctor && <span className="error-message">{formErrors.doctor}</span>}
                  {doctors.length === 0 && formData.department && !loadingDoctors && (
                    <span className="info-message">No doctors available for this department</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="appointment_date">Appointment Date and Time*</label>
                  <input
                    type="datetime-local"
                    id="appointment_date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleInputChange}
                    className={formErrors.appointment_date ? "error" : ""}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  {formErrors.appointment_date && <span className="error-message">{formErrors.appointment_date}</span>}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowBookingForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={submitting}>
                  {submitting ? "Booking..." : "Book Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentList
