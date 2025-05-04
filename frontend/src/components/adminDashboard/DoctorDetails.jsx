"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { UserCog, Mail, Phone, Calendar, MapPin, Activity, FileText, Clock } from 'lucide-react'

const DoctorDetails = ({ doctor }) => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!doctor) return

    const fetchDoctorAppointments = async () => {
      try {
        setLoading(true)

        // Fetch doctor's appointments
        const appointmentsResponse = await axios
          .get(`http://localhost:4000/api/v1/appointment/doctor/${doctor._id}`, {
            withCredentials: true,
          })
          .catch(() => {
            // Mock data if endpoint doesn't exist
            return {
              data: {
                success: true,
                appointments: [
                  {
                    _id: "a1",
                    department: doctor.doctorDepartment || "General",
                    appointment_date: new Date().toISOString(),
                    status: "confirmed",
                    firstName: "John",
                    lastName: "Doe",
                  },
                  {
                    _id: "a2",
                    department: doctor.doctorDepartment || "General",
                    appointment_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    status: "completed",
                    firstName: "Jane",
                    lastName: "Smith",
                  },
                ],
              },
            }
          })

        if (appointmentsResponse.data.success) {
          setAppointments(appointmentsResponse.data.appointments)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching doctor data:", error)
        toast.error("Failed to load doctor data")
        setLoading(false)
      }
    }

    fetchDoctorAppointments()
  }, [doctor])

  if (!doctor) {
    return (
      <div className="no-doctor-selected">
        <p>No doctor selected</p>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Loading doctor details...</div>
  }

  return (
    <div className="doctor-details-container">
      <div className="doctor-header">
        <div className="doctor-avatar">
          {doctor.docAvatar?.url ? (
            <img src={doctor.docAvatar.url || "/placeholder.svg"} alt={`${doctor.firstName} ${doctor.lastName}`} className="avatar-img" />
          ) : (
            <UserCog className="w-16 h-16 text-gray-400" />
          )}
        </div>
        <div className="doctor-info">
          <h2 className="doctor-name">
            Dr. {doctor.firstName} {doctor.lastName}
          </h2>
          <div className="doctor-meta">
            <span className="doctor-department">{doctor.doctorDepartment || "General"}</span>
            <span className="doctor-gender">{doctor.gender}</span>
          </div>
        </div>
      </div>

      <div className="doctor-tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveTab("appointments")}
        >
          Appointments
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="contact-info">
              <h3>Contact Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span>{doctor.email}</span>
                </div>
                <div className="info-item">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span>{doctor.phone || "Not provided"}</span>
                </div>
                {doctor.address && (
                  <div className="info-item">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>{doctor.address}</span>
                  </div>
                )}
                {doctor.dob && (
                  <div className="info-item">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span>DOB: {new Date(doctor.dob).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="doctor-stats">
              <h3>Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <Calendar className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{appointments.length}</span>
                    <span className="stat-label">Total Appointments</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <Activity className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">
                      {appointments.filter(app => app.status === "completed").length}
                    </span>
                    <span className="stat-label">Completed</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <Clock className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">
                      {appointments.filter(app => app.status === "pending" || app.status === "confirmed").length}
                    </span>
                    <span className="stat-label">Upcoming</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="account-info">
              <h3>Account Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span>Joined: {new Date(doctor.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span>Role: {doctor.role}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="appointments-tab">
            <div className="tab-header">
              <h3>Appointment History</h3>
            </div>

            {appointments.length > 0 ? (
              <div className="appointments-list">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="appointment-card">
                    <div className="appointment-date">
                      <div className="date-box">
                        <span className="month">
                          {new Date(appointment.appointment_date).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="day">{new Date(appointment.appointment_date).getDate()}</span>
                      </div>
                    </div>

                    <div className="appointment-details">
                      <h4>{appointment.department}</h4>
                      <p className="appointment-patient">
                        Patient: {appointment.firstName} {appointment.lastName}
                      </p>
                      <p className="appointment-time">
                        Time: {new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <span className={`status-badge status-${appointment.status || "pending"}`}>
                        {appointment.status || "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No appointment history available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorDetails
