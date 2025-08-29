"use client"

import { useState, useEffect, useContext, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { Context } from "../../main"
import { Calendar, Search, LayoutDashboard, FileText, ChevronDown, Plus, Clock, UserRound, ClipboardList, BarChart, Pill, Activity, ChevronLeft, HeartPulse } from 'lucide-react'

import PatientList from "../../components/doctorDashboard/PatientsList"
import DoctorAppointments from "../../components/doctorDashboard/DoctorAppointments"
import PatientHealthRecords from "../../components/doctorDashboard/PatientHealthRecords"
import HealthRecordUpload from "../../components/doctorDashboard/HealthRecordUpload"
import PatientDetailsModal from "../../components/modals/PatientDetailsModal"
import AddPrescriptions from "../../components/doctorDashboard/AddPrescriptions"
import AppointmentPopup from "../../components/patientDashboard/AppointmentPopup"
import AppointmentCalendar from "../../components/calendar/AppointmentCalendar"
import AddVitals from "../../components/doctorDashboard/AddVitals"
import AddHeartData from "../../components/doctorDashboard/AddHeartData"

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
  const [selectedDate, setSelectedDate] = useState(null) 
  const [todayDate] = useState(new Date().getDate()) 
  const [todayAppointments, setTodayAppointments] = useState([])
  const [stats, setStats] = useState({
    totalPatients: 0,
    appointmentsToday: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
  })
  const navigateTo = useNavigate()

  const [showAppointmentPopup, setShowAppointmentPopup] = useState(false)
  const [selectedDateAppointments, setSelectedDateAppointments] = useState([])
  const [selectedFullDate, setSelectedFullDate] = useState(null)

  const [avatar, setAvatar] = useState("/default-avatar.png")

  const fileInputRef = useRef(null)

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

  const refreshAppointments = async () => {
    try {
      console.log("Refreshing appointments data..."); 
      
      const appointmentsResponse = await axios.get("http://localhost:4000/api/v1/appointment/doctor/me", {
        withCredentials: true,
      });

      if (appointmentsResponse.data.success) {
        const allAppointments = appointmentsResponse.data.appointments;
        console.log("Fresh appointments received:", allAppointments); 
        setAppointments(allAppointments);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaysAppts = allAppointments.filter((appointment) => {
          const appointmentDate = new Date(appointment.appointment_date);
          return appointmentDate >= today && appointmentDate < tomorrow;
        });

        setTodayAppointments(todaysAppts);
        
        const statsResponse = await axios.get("http://localhost:4000/api/v1/appointment/doctor/stats/me", {
          withCredentials: true,
        });

        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
        }
      }
    } catch (error) {
      console.error("Error refreshing appointments:", error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        const statsResponse = await axios.get("http://localhost:4000/api/v1/appointment/doctor/stats/me", {
          withCredentials: true,
        })

        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats)
        }

        const appointmentsResponse = await axios.get("http://localhost:4000/api/v1/appointment/doctor/me", {
          withCredentials: true,
        })

        if (appointmentsResponse.data.success) {
          const allAppointments = appointmentsResponse.data.appointments
          setAppointments(allAppointments)

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

        const recentRecordsResponse = await axios
          .get("http://localhost:4000/api/v1/health-records/recent", {
            withCredentials: true,
          })
          .catch(() => {
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

    const interval = setInterval(() => {
      refreshAppointments();
    }, 60000); 

    return () => clearInterval(interval);
  }, [])

  useEffect(() => {

    axios.get("http://localhost:4000/api/v1/user/doctor/me", {
      withCredentials: true,
    }).then(res => {
      if (res.data.user?.docAvatar?.url) {
        setAvatar(res.data.user.docAvatar.url);
      }
    });
  }, []);

  const formatTimeFromDate = (dateString) => {
    const date = new Date(dateString)
    const hours = date.getHours()
    const minutes = date.getMinutes()

    const startHour = hours.toString().padStart(2, "0")
    const startMinutes = minutes.toString().padStart(2, "0")

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
      const patientResponse = await axios
        .get(`http://localhost:4000/api/v1/user/patient/${patientId}`, {
          withCredentials: true,
        })
        .catch(() => {
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

        setAppointments((prevAppointments) =>
          prevAppointments.map((app) => (app._id === appointmentId ? { ...app, status } : app)),
        )

        await refreshAppointments();
      }
    } catch (error) {
      console.error("Error updating appointment status:", error)
      toast.error("Failed to update appointment status")
    }
  }

  const generateCalendarDays = () => {
    const days = []
    for (let i = 1; i <= 31; i++) {
      days.push(i)
    }
    return days
  }

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

  const handleCalendarDayClick = (day) => {


    setSelectedDate(day)

    const currentDate = new Date()
    const selectedDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 0, 0, 0)

    setSelectedFullDate(selectedDateObj)

    const appointmentsForDay = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointment_date)
      return (
        appointmentDate.getDate() === day &&
        appointmentDate.getMonth() === currentDate.getMonth() &&
        appointmentDate.getFullYear() === currentDate.getFullYear()
      )
    })

    setSelectedDateAppointments(appointmentsForDay)
    setShowAppointmentPopup(true)
  }

  const handleMonthChange = (direction) => {
    const [monthName, year] = currentMonth.split(" ")
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth()
    const currentYear = Number.parseInt(year)

    let newMonthIndex, newYear

    if (direction === "prev") {
      newMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1
      newYear = monthIndex === 0 ? currentYear - 1 : currentYear
    } else {
      newMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1
      newYear = monthIndex === 11 ? currentYear + 1 : currentYear
    }

    const newMonth = new Date(newYear, newMonthIndex, 1).toLocaleString("default", { month: "long" })
    setCurrentMonth(`${newMonth} ${newYear}`)

    setSelectedDate(null)
  }

  const handleAvatarUpload = (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    axios.post("http://localhost:4000/api/v1/user/doctor/upload-avatar", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(res => {
      setAvatar(res.data.avatarUrl);
      toast.success("Avatar uploaded successfully!");
    })
    .catch(err => {
      toast.error(err.response?.data?.message || "Failed to upload avatar");
    });
  };

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

        <div className="doctor-dashboard-section">
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

        <div className="doctor-dashboard-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="recent-activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="recent-activity-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <UserRound className="w-6 h-6 text-blue-500" />
              <div>
                <div style={{ fontWeight: 600, color: '#22223b' }}>Total Active Patients</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats.totalPatients}</div>
              </div>
            </div>

            <div className="recent-activity-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Clock className="w-6 h-6 text-green-500" />
              <div>
                <div style={{ fontWeight: 600, color: '#22223b' }}>Last Patient Seen</div>
                {appointments && appointments.length > 0 ? (
                  (() => {
                    const sorted = [...appointments].sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
                    const last = sorted[0];
                    return (
                      <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                        {last.firstName} {last.lastName} <span style={{ color: '#6b7280', fontWeight: 400 }}>(
                          {new Date(last.appointment_date).toLocaleDateString()} {new Date(last.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        )</span>
                      </div>
                    );
                  })()
                ) : (
                  <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>No recent appointments</div>
                )}
              </div>
            </div>

            <div className="recent-activity-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FileText className="w-6 h-6 text-purple-500" />
              <div>
                <div style={{ fontWeight: 600, color: '#22223b' }}>Recent Uploads</div>
                {recentHealthRecords && recentHealthRecords.length > 0 ? (
                  (() => {
                    const sorted = [...recentHealthRecords].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
                    const last = sorted[0];
                    return (
                      <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                        {last.type || last.recordType} <span style={{ color: '#6b7280', fontWeight: 400 }}>(
                          {new Date(last.date || last.createdAt).toLocaleDateString()}
                        )</span>
                      </div>
                    );
                  })()
                ) : (
                  <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>No recent uploads</div>
                )}
              </div>
            </div>
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
        return (
          <DoctorAppointments 
            appointments={appointments} 
            onUpdateStatus={updateAppointmentStatus}
            onRefreshAppointments={refreshAppointments} 
          />
        )
      case "healthrecords":
        return <PatientHealthRecords />
      case "healthrecordupload":
        return <HealthRecordUpload />
      case "prescriptions":
        return <AddPrescriptions />
      case "vitals":
        return <AddVitals />
      case "heartdata":
        return <AddHeartData />
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
            <li className={activeSection === "prescriptions" ? "active" : ""}>
              <button onClick={() => setActiveSection("prescriptions")}>
                <Pill className="w-5 h-5" />
                <span>Prescriptions</span>
              </button>
            </li>
            <li className={activeSection === "vitals" ? "active" : ""}>
              <button onClick={() => setActiveSection("vitals")}>
                <Activity className="w-5 h-5" />
                <span>Add Vitals</span>
              </button>
            </li>
            <li className={activeSection === "heartdata" ? "active" : ""}>
              <button onClick={() => setActiveSection("heartdata")}>
                <HeartPulse className="w-5 h-5" />
                <span>Heart Data Entry</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="top-bar">
          <div className="action-buttons">
            <button
              className="upload-avatar"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              type="button"
            >
              <Plus className="w-4 h-4" />
              Upload Avatar
            </button>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  handleAvatarUpload(file);
                }
              }}
            />
            <div className="user-avatar">
              <img src={avatar} alt="Doctor Avatar" />
              <span className="ml-2 hidden md:inline-block">{user?.firstName || "Doctor"}</span>
            </div>
          </div>
        </div>
        <div className="backButoon"> 
        {activeSection !== "dashboard" && (
          <button className="chevron-back-btn" onClick={() => setActiveSection("dashboard")}
            style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
          </button>
        )}
        </div>
        <div className="content-wrapper">
          <div className="content-main">{renderContent()}</div>

          <div className="appointments-sidebar">
            <div className="appointments-header">
              <h2>Upcoming appointments</h2>
            </div>

            <div className="calendar-section">
              <AppointmentCalendar
                appointments={appointments}
                onDateClick={(date) => {
                  const selectedDateObj = date

                  setSelectedFullDate(selectedDateObj)

                  const appointmentsForDay = appointments.filter((appointment) => {
                    const appointmentDate = new Date(appointment.appointment_date)
                    return (
                      appointmentDate.getDate() === date.getDate() &&
                      appointmentDate.getMonth() === date.getMonth() &&
                      appointmentDate.getFullYear() === date.getFullYear()
                    )
                  })

                  setSelectedDateAppointments(appointmentsForDay)
                  setShowAppointmentPopup(true)
                }}
                userRole="doctor"
              />
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

      {showPatientModal && <PatientDetailsModal patient={selectedPatient} onClose={() => setShowPatientModal(false)} />}

      <AppointmentPopup
        isVisible={showAppointmentPopup}
        onClose={() => setShowAppointmentPopup(false)}
        appointments={selectedDateAppointments}
        date={selectedFullDate}
        userRole="doctor"
      />
    </div>
  )
}

export default DoctorDashboard