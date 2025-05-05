"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { Context } from "../../main"
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  MessageSquare,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  UserCog,
  FileText,
  BarChart,
  Activity,
  User,
} from "lucide-react"

// Import components for each section
import AppointmentsOverview from "../../components/adminDashboard/AppointmentsOverview"
import DoctorsList from "../../components/adminDashboard/DoctorsList"
import PatientsList from "../../components/adminDashboard/PatientsList"
import Messages from "../../components/adminDashboard/Messages"
import DoctorDetails from "../../components/adminDashboard/DoctorDetails"
// import PatientDetails from "../../components/adminDashboard/PatientDetails"
import DoctorVerificationRequests from "../../components/adminDashboard/DoctorVerificationRequests"

const AdminDashboard = () => {
  const { user, setIsAuthenticated, setUser } = useContext(Context)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
    pendingVerifications: 0,
  })
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const navigateTo = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.get(`http://localhost:4000/api/v1/user/admin/logout`, {
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

        // Fetch all appointments
        const appointmentsResponse = await axios
          .get("http://localhost:4000/api/v1/appointment/getall", {
            withCredentials: true,
          })
          .catch((err) => {
            console.error("Error fetching appointments:", err)
            return { data: { success: true, appointments: [] } }
          })

        if (appointmentsResponse.data.success) {
          const allAppointments = appointmentsResponse.data.appointments || []
          setAppointments(allAppointments)

          // Calculate today's appointments
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)

          const todaysAppts = allAppointments.filter((appointment) => {
            const appointmentDate = new Date(appointment.appointment_date)
            return appointmentDate >= today && appointmentDate < tomorrow
          })

          // Calculate pending appointments
          const pendingAppts = allAppointments.filter((app) => app.status === "pending")

          // Update stats
          setStats((prev) => ({
            ...prev,
            totalAppointments: allAppointments.length,
            pendingAppointments: pendingAppts.length,
            todayAppointments: todaysAppts.length,
          }))
        }

        // Fetch all doctors
        const doctorsResponse = await axios
          .get("http://localhost:4000/api/v1/user/doctors", {
            withCredentials: true,
          })
          .catch((err) => {
            console.error("Error fetching doctors:", err)
            return { data: { success: true, doctors: [] } }
          })

        if (doctorsResponse.data.success) {
          const allDoctors = doctorsResponse.data.doctors || []
          setDoctors(allDoctors)
          setStats((prev) => ({ ...prev, totalDoctors: allDoctors.length }))
        }

        // Fetch all patients
        const patientsResponse = await axios
          .get("http://localhost:4000/api/v1/user/patients", {
            withCredentials: true,
          })
          .catch((err) => {
            console.error("Error fetching patients:", err)
            return { data: { success: false } }
          })

        if (patientsResponse.data.success) {
          const allPatients = patientsResponse.data.patients || []
          setPatients(allPatients)
          setStats((prev) => ({ ...prev, totalPatients: allPatients.length }))
        }

        // Fetch all messages
        const messagesResponse = await axios
          .get("http://localhost:4000/api/v1/message/getall", {
            withCredentials: true,
          })
          .catch((err) => {
            console.error("Error fetching messages:", err)
            return { data: { success: true, messages: [] } }
          })

        if (messagesResponse.data.success) {
          setMessages(messagesResponse.data.messages || [])
        }

        // Fetch notifications (if available)
        const notificationsResponse = await axios
          .get("http://localhost:4000/api/v1/notifications", {
            withCredentials: true,
          })
          .catch((err) => {
            console.error("Error fetching notifications:", err)
            return { data: { success: true, notifications: [] } }
          })

        if (notificationsResponse.data.success) {
          setNotifications(notificationsResponse.data.notifications || [])
        }

        // Fetch unverified doctors
        const unverifiedDoctorsResponse = await axios
          .get("http://localhost:4000/api/v1/user/admin/doctors/pending", {
            withCredentials: true,
          })
          .catch((err) => {
            console.error("Error fetching unverified doctors:", err)
            return { data: { success: true, count: 0 } }
          })

        if (unverifiedDoctorsResponse.data.success) {
          setStats((prev) => ({
            ...prev,
            pendingVerifications: unverifiedDoctorsResponse.data.count || 0,
          }))
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

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor)
    setActiveSection("doctordetails")
  }

  const handlePatientSelect = async (patient) => {
    try {
      // Fetch detailed patient information if needed
      const patientResponse = await axios
        .get(`http://localhost:4000/api/v1/user/patient/${patient._id}`, {
          withCredentials: true,
        })
        .catch((err) => {
          console.error("Error fetching patient details:", err)
          return { data: { success: true, user: patient } }
        })

      if (patientResponse.data.success) {
        setSelectedPatient(patientResponse.data.user || patient)
        setActiveSection("patientdetails")
      }
    } catch (error) {
      console.error("Error fetching patient details:", error)
      // If there's an error, still show the patient details with the data we have
      setSelectedPatient(patient)
      setActiveSection("patientdetails")
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

  const renderDashboardContent = () => {
    return (
      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="stats-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Total Doctors</h3>
                <p className="text-2xl font-semibold">{stats.totalDoctors}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <UserCog className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Total Patients</h3>
                <p className="text-2xl font-semibold">{stats.totalPatients}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <User className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Total Appointments</h3>
                <p className="text-2xl font-semibold">{stats.totalAppointments}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Today's Appointments</h3>
                <p className="text-2xl font-semibold">{stats.todayAppointments}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Activity className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Pending Appointments</h3>
                <p className="text-2xl font-semibold">{stats.pendingAppointments}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <FileText className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Pending Verifications</h3>
                <p className="text-2xl font-semibold">{stats.pendingVerifications}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <UserCog className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Appointments</h2>
            <button className="view-all" onClick={() => setActiveSection("appointments")}>
              View All
            </button>
          </div>
          <div className="appointments-container">
            {appointments.length > 0 ? (
              <ul className="appointment-list">
                {appointments.slice(0, 5).map((appointment) => (
                  <li key={appointment._id} className="appointment-item">
                    <div className="appointment-details">
                      <h3>{appointment.department}</h3>
                      <p>
                        Patient: {appointment.firstName} {appointment.lastName}
                      </p>
                      <p>
                        Doctor: {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                      </p>
                      <p>Date: {new Date(appointment.appointment_date).toLocaleDateString()}</p>
                      <p className={`status status-${appointment.status || "pending"}`}>
                        Status: {appointment.status || "Pending"}
                      </p>
                    </div>
                    <div className="appointment-actions">
                      <button
                        className="btn-primary"
                        onClick={() =>
                          handlePatientSelect(
                            patients.find((p) => p._id === appointment.patientId) || {
                              _id: appointment.patientId,
                              firstName: appointment.firstName,
                              lastName: appointment.lastName,
                            },
                          )
                        }
                      >
                        View Patient
                      </button>
                      <div className="status-buttons">
                        <button
                          className="btn-outline btn-sm"
                          onClick={() => updateAppointmentStatus(appointment._id, "confirmed")}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn-outline btn-sm"
                          onClick={() => updateAppointmentStatus(appointment._id, "cancelled")}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No appointments found</p>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Messages</h2>
            <button className="view-all" onClick={() => setActiveSection("messages")}>
              View All
            </button>
          </div>
          <div className="messages-container">
            {messages.length > 0 ? (
              <ul className="message-list">
                {messages.slice(0, 3).map((message) => (
                  <li key={message._id} className="message-item">
                    <div className="message-details">
                      <h3>
                        {message.firstName} {message.lastName}
                      </h3>
                      <p>Email: {message.email}</p>
                      <p>Phone: {message.phone}</p>
                      <p className="message-content">{message.message.substring(0, 100)}...</p>
                    </div>
                    <div className="message-actions">
                      <button className="btn-outline" onClick={() => setActiveSection("messages")}>
                        View Full Message
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No messages found</p>
            )}
          </div>
        </div>

        {/* Activity Chart */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Appointment Activity</h2>
            <ChevronDown className="w-5 h-5" />
          </div>
          <div className="chart-placeholder">
            <BarChart className="w-full h-32 text-blue-500" />
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardContent()
      case "appointments":
        return (
          <AppointmentsOverview
            appointments={appointments}
            updateStatus={updateAppointmentStatus}
            onPatientSelect={handlePatientSelect}
          />
        )
      case "doctors":
        return <DoctorsList doctors={doctors} onDoctorSelect={handleDoctorSelect} />
      case "patients":
        return <PatientsList patients={patients} onPatientSelect={handlePatientSelect} />
      case "doctorverification":
        return <DoctorVerificationRequests />
      case "messages":
        return <Messages messages={messages} />
      case "doctordetails":
        return <DoctorDetails doctor={selectedDoctor} />
      case "patientdetails":
        return <PatientDetails patient={selectedPatient} />
      default:
        return renderDashboardContent()
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="admin-dashboard-container">
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
            <h1 className="ml-2">Admin</h1>
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
            <li className={activeSection === "appointments" ? "active" : ""}>
              <button onClick={() => setActiveSection("appointments")}>
                <Calendar className="w-5 h-5" />
                <span>Appointments</span>
              </button>
            </li>
            <li className={activeSection === "doctors" ? "active" : ""}>
              <button onClick={() => setActiveSection("doctors")}>
                <UserCog className="w-5 h-5" />
                <span>Doctors</span>
              </button>
            </li>
            <li className={activeSection === "patients" ? "active" : ""}>
              <button onClick={() => setActiveSection("patients")}>
                <Users className="w-5 h-5" />
                <span>Patients</span>
              </button>
            </li>
            <li className={activeSection === "doctorverification" ? "active" : ""}>
              <button onClick={() => setActiveSection("doctorverification")}>
                <UserPlus className="w-5 h-5" />
                <span>Doctor Verification</span>
                {stats.pendingVerifications > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {stats.pendingVerifications}
                  </span>
                )}
              </button>
            </li>
            <li className={activeSection === "messages" ? "active" : ""}>
              <button onClick={() => setActiveSection("messages")}>
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Add logout button at the bottom of sidebar */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="top-bar">
          <div className="search-bar">
            <Search className="w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="action-buttons">
            <div className="relative">
              <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
              </button>
              {showNotifications && (
                <div className="notification-dropdown">
                  <h3>Notifications</h3>
                  {notifications.length > 0 ? (
                    <ul>
                      {notifications.map((notification) => (
                        <li key={notification._id} className="notification-item">
                          <p>{notification.message}</p>
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No notifications</p>
                  )}
                </div>
              )}
            </div>
            <div className="user-avatar">
              <img src="/placeholder.svg?height=40&width=40" alt="User" className="avatar" />
              <span className="ml-2 hidden md:inline-block">{user?.firstName || "Admin"}</span>
            </div>
          </div>
        </div>

        <div className="content-wrapper">
          <div className="content-main">{renderContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
