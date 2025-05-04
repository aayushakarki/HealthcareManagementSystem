"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { Context } from "../../main"
import {
  Calendar,
  Search,
  LayoutDashboard,
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  Clock,
  UserRound,
  ClipboardList,
  BarChart,
} from "lucide-react"

// Import components for each section
import PatientList from "../../components/doctorDashboard/PatientsList"
import DoctorAppointments from "../../components/doctorDashboard/DoctorAppointments"
import PatientHealthRecords from "../../components/doctorDashboard/PatientHealthRecords"
import HealthRecordUpload from "../../components/doctorDashboard/HealthRecordUpload"
import PatientDetailsModal from "../../components/modals/PatientDetailsModal"

const DoctorDashboard = () => {
  const { user, setIsAuthenticated, setUser } = useContext(Context)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [recentHealthRecords, setRecentHealthRecords] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState("May 2025")
  const [selectedDate, setSelectedDate] = useState(new Date().getDate())
  const [todayAppointments, setTodayAppointments] = useState([])
  const [stats, setStats] = useState({
    totalPatients: 0,
    appointmentsToday: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
  })
  const navigateTo = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.get(`http://localhost:4000/api/v1/user/doctor/logout`, {
        withCredentials: true,
      })
      toast.success("Logged out successfully!")
      setIsAuthenticated(false)
      setUser({})
      navigateTo("/")
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed")
    }
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch doctor's stats from the new endpoint
        const statsResponse = await axios.get("http://localhost:4000/api/v1/appointment/doctor/stats/me", {
          withCredentials: true,
        })

        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats)
        }

        // Fetch doctor's appointments
        const appointmentsResponse = await axios.get("http://localhost:4000/api/v1/appointment/doctor/me", {
          withCredentials: true,
        })

        if (appointmentsResponse.data.success) {
          const allAppointments = appointmentsResponse.data.appointments
          setAppointments(allAppointments)

          // Filter today's appointments
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)

          const todaysAppts = allAppointments.filter((appointment) => {
            const appointmentDate = new Date(appointment.appointment_date)
            return appointmentDate >= today && appointmentDate < tomorrow
          })

          setTodayAppointments(todaysAppts)
        }

        // Fetch recent health records (assuming we can get the most recent ones)
        const recentRecordsResponse = await axios
          .get("http://localhost:4000/api/v1/health-records/recent", {
            withCredentials: true,
          })
          .catch(() => {
            // If this endpoint doesn't exist, we'll mock the data
            return {
              data: {
                success: true,
                healthRecords: [],
              },
            }
          })

        if (recentRecordsResponse.data.success) {
          setRecentHealthRecords(recentRecordsResponse.data.healthRecords)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast.error("Failed to load dashboard data")
        setLoading(false)
      }
    }

    fetchDashboardData()
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

  function formatAMPM(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number)
    const date = new Date()
    date.setHours(hours)
    date.setMinutes(minutes)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour24: true })
  }

  const handlePatientSelect = async (patientId) => {
    try {
      // Fetch patient details
      const patientResponse = await axios
        .get(`http://localhost:4000/api/v1/user/patient/${patientId}`, {
          withCredentials: true,
        })
        .catch(() => {
          // If this endpoint doesn't exist, we'll use the patient from appointments
          const patient = appointments.find((app) => app.patientId === patientId)
          return {
            data: {
              success: true,
              user: {
                _id: patientId,
                firstName: patient?.firstName || "Patient",
                lastName: patient?.lastName || "Name",
                email: patient?.email || "patient@example.com",
                phone: patient?.phone || "123-456-7890",
                dob: patient?.dob || "1990-01-01",
                gender: patient?.gender || "Not specified",
              },
            },
          }
        })

      if (patientResponse.data.success) {
        setSelectedPatient(patientResponse.data.user)
        setShowPatientModal(true)
      }
    } catch (error) {
      console.error("Error fetching patient details:", error)
      toast.error("Failed to load patient details")
    }
  }

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/v1/appointment/update/${appointmentId}`,
        { status },
        { withCredentials: true },
      )

      if (response.data.success) {
        toast.success(`Appointment marked as ${status}`)

        // Update appointments in state
        setAppointments((prevAppointments) =>
          prevAppointments.map((app) => (app._id === appointmentId ? { ...app, status } : app)),
        )
      }
    } catch (error) {
      console.error("Error updating appointment status:", error)
      toast.error("Failed to update appointment status")
    }
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = []
    for (let i = 1; i <= 31; i++) {
      days.push(i)
    }
    return days
  }

  // Check if a day has an appointment
  const hasAppointmentOnDay = (day) => {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    return appointments.some((appointment) => {
      const appointmentDate = new Date(appointment.appointment_date)
      return (
        appointmentDate.getDate() === day &&
        appointmentDate.getMonth() === month &&
        appointmentDate.getFullYear() === year
      )
    })
  }

  const renderDashboardContent = () => {
    return (
      <div className="dashboardContent">
        {/* Stats Cards */}
        <div className="stats-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Total Patients</h3>
                <p className="text-2xl font-semibold">{stats.totalPatients}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <UserRound className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Today's Appointments</h3>
                <p className="text-2xl font-semibold">{stats.appointmentsToday}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Pending Appointments</h3>
                <p className="text-2xl font-semibold">{stats.pendingAppointments}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Completed Appointments</h3>
                <p className="text-2xl font-semibold">{stats.completedAppointments}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <ClipboardList className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Today's Appointments</h2>
            <button className="view-all" onClick={() => setActiveSection("appointments")}>
              View All
            </button>
          </div>
          <div className="appointments-container">
            {todayAppointments.length > 0 ? (
              <ul className="appointment-list">
                {todayAppointments.map((appointment) => (
                  <li key={appointment._id} className="appointment-item">
                    <div className="appointment-details">
                      <h3>{appointment.department}</h3>
                      <p>
                        Patient: {appointment.firstName} {appointment.lastName}
                      </p>
                      <p>Time: {formatTimeFromDate(appointment.appointment_date)}</p>
                      <p className={`status status-${appointment.status || "pending"}`}>
                        Status: {appointment.status || "Pending"}
                      </p>

                      {/* Display doctor notes if available */}
                      {appointment.doctorNotes && (
                        <div className="doctor-notes mt-2 p-2 bg-blue-50 rounded-md">
                          <p className="text-sm font-medium text-blue-700">Notes:</p>
                          <p className="text-sm text-gray-700">{appointment.doctorNotes}</p>
                        </div>
                      )}
                    </div>
                    <div className="appointment-actions">
                      <button className="btn-primary" onClick={() => handlePatientSelect(appointment.patientId)}>
                        View Patient
                      </button>
                      <div className="status-buttons">
                        <button
                          className="btn-outline btn-sm"
                          onClick={() => updateAppointmentStatus(appointment._id, "completed")}
                        >
                          Complete
                        </button>
                        <button
                          className="btn-outline btn-sm"
                          onClick={() => updateAppointmentStatus(appointment._id, "rescheduled")}
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No appointments scheduled for today</p>
            )}
          </div>
        </div>

        {/* Patient Activity */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Patient Activity</h2>
            <ChevronDown className="w-5 h-5" />
          </div>
          <div className="patient-activity-chart">
            <div className="chart-placeholder">
              <BarChart className="w-full h-32 text-blue-500" />
            </div>
            <div className="activity-stats">
              <div className="stat-card">
                <div className="stat-value">{stats.totalPatients}</div>
                <div className="stat-label">Active Patients</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{appointments.length}</div>
                <div className="stat-label">Total Appointments</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{recentHealthRecords.length}</div>
                <div className="stat-label">Recent Records</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Health Records */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Health Records</h2>
            <button className="view-all" onClick={() => setActiveSection("healthrecords")}>
              View All
            </button>
          </div>
          <div className="records-container">
            {recentHealthRecords.length > 0 ? (
              <ul className="record-list">
                {recentHealthRecords.map((record) => (
                  <li key={record.id || record._id} className="record-item">
                    <div className="record-details">
                      <h3>{record.type || record.recordType}</h3>
                      <p>Patient: {record.patientName || "Patient"}</p>
                      <p>Date: {new Date(record.date || record.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button className="btn-view">View</button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-data-container">
                <p className="no-data">No recent health records</p>
                <button className="btn-primary mt-2" onClick={() => setActiveSection("healthrecordupload")}>
                  Upload New Record
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardContent()
      case "patients":
        return <PatientList onPatientSelect={handlePatientSelect} />
      case "appointments":
        return <DoctorAppointments appointments={appointments} onUpdateStatus={updateAppointmentStatus} />
      case "healthrecords":
        return <PatientHealthRecords />
      case "healthrecordupload":
        return <HealthRecordUpload />
      default:
        return renderDashboardContent()
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="doctor-dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <div className="logo-square bg-red-500"></div>
              <div className="logo-square bg-green-500"></div>
              <div className="logo-square bg-blue-500"></div>
              <div className="logo-square bg-yellow-500"></div>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={activeSection === "dashboard" ? "active" : ""}>
              <button onClick={() => setActiveSection("dashboard")}>
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li className={activeSection === "patients" ? "active" : ""}>
              <button onClick={() => setActiveSection("patients")}>
                <UserRound className="w-5 h-5" />
                <span>Patients</span>
              </button>
            </li>
            <li className={activeSection === "appointments" ? "active" : ""}>
              <button onClick={() => setActiveSection("appointments")}>
                <Calendar className="w-5 h-5" />
                <span>Appointments</span>
              </button>
            </li>
            <li className={activeSection === "healthrecords" ? "active" : ""}>
              <button onClick={() => setActiveSection("healthrecords")}>
                <FileText className="w-5 h-5" />
                <span>Health Records</span>
              </button>
            </li>
            <li className={activeSection === "healthrecordupload" ? "active" : ""}>
              <button onClick={() => setActiveSection("healthrecordupload")}>
                <Plus className="w-5 h-5" />
                <span>Upload Records</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Add logout button at the bottom of sidebar */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="top-bar">
          <div className="search-bar">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search patients or appointments" />
          </div>
          <div className="action-buttons">
            <button className="create-schedule-btn" onClick={() => setActiveSection("healthrecordupload")}>
              <Plus className="w-4 h-4" />
              Upload Record
            </button>
            <div className="user-avatar">
              <img src="/placeholder.svg?height=40&width=40" alt="User" className="avatar" />
              <span className="ml-2 hidden md:inline-block">{user?.firstName || "Doctor"}</span>
            </div>
          </div>
        </div>

        <div className="content-wrapper">
          <div className="content-main">{renderContent()}</div>

          {/* Right Sidebar - Appointments */}
          <div className="appointments-sidebar">
            <div className="appointments-header">
              <h2>Upcoming appointments</h2>
            </div>

            <div className="calendar-section">
              <div className="month-selector">
                <h3>{currentMonth}</h3>
                <div className="month-navigation">
                  <button className="month-nav-btn">
                    <ChevronRight className="w-4 h-4 transform rotate-180" />
                  </button>
                  <button className="month-nav-btn">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="weekdays">
                <span>SUN</span>
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
              </div>

              <div className="calendar-days">
                {generateCalendarDays().map((day) => (
                  <button
                    key={day}
                    className={`calendar-day ${day === selectedDate ? "selected" : ""} ${hasAppointmentOnDay(day) ? "has-appointment" : ""}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="appointments-list">
              {appointments.length > 0 ? (
                appointments.slice(0, 3).map((appointment) => (
                  <div key={appointment._id} className="appointment-item">
                    <div className="appointment-time">
                      <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                      <span>{formatTimeFromDate(appointment.appointment_date)}</span>
                    </div>
                    <div className="appointment-details">
                      <h3>{appointment.department}</h3>
                      <p>
                        {appointment.firstName} {appointment.lastName}
                      </p>
                      <span className={`status-badge status-${appointment.status || "pending"}`}>
                        {appointment.status || "Pending"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-appointments">No upcoming appointments</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Details Modal */}
      {showPatientModal && <PatientDetailsModal patient={selectedPatient} onClose={() => setShowPatientModal(false)} />}
    </div>
  )
}

export default DoctorDashboard
