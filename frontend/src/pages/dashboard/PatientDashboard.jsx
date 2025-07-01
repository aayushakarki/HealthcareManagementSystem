"use client"

import { useState, useEffect, useContext, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { Context } from "../../main"
import {
  Calendar,
  Search,
  LayoutDashboard,
  FileText,
  Pill,
  Users,
  ChevronDown,
  Plus,
  Clock,
  Activity,
  User,
  ChevronLeft,
} from "lucide-react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Import component for each section
import DoctorSearch from "../../components/patientDashboard/DoctorSearch"
import AppointmentList from "../../components/patientDashboard/Appointment"
import HealthRecords from "../../components/patientDashboard/HealthRecords"
import Medications from "../../components/patientDashboard/Medications"
import HealthRecordModal from "../../components/modals/HealthRecordModal"
import AppointmentPopup from "../../components/patientDashboard/AppointmentPopup"
import AppointmentCalendar from "../../components/calendar/AppointmentCalendar"
import LatestVitals from "../../components/patientDashboard/LatestVitals"
import PatientVitals from "../../components/patientDashboard/PatientVitals"
import "../../css/vitals.css"

import FraminghamCalculation from '../../components/patientDashboard/FraminghamCalculation'
import HeartDiseaseForm from "../../components/patientDashboard/HeartDiseaseForm"
import Modal from "../../components/modals/Modal"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const PatientDashboard = () => {
  // Move this function outside of useEffect and add useNavigate
  const { user, setIsAuthenticated, setUser } = useContext(Context)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [appointments, setAppointments] = useState([])
  const [healthRecords, setHealthRecords] = useState([])
  const [vitals, setVitals] = useState({
    bloodPressure: "120/80",
    heartRate: "72",
    weight: "70",
    glucoseLevel: "90",
    cholesterol: "200",
    hdlCholesterol: "50",
  })
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState("May 2025")
  const [selectedDate, setSelectedDate] = useState(null) // We'll use this for popup only
  const [todayDate] = useState(new Date().getDate()) // Store today's date separately
  const navigateTo = useNavigate()
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showHealthRecordModal, setShowHealthRecordModal] = useState(false)

  // New state for appointment popup
  const [showAppointmentPopup, setShowAppointmentPopup] = useState(false)
  const [selectedDateAppointments, setSelectedDateAppointments] = useState([])
  const [selectedFullDate, setSelectedFullDate] = useState(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [prefilledDate, setPrefilledDate] = useState("")

  const [avatar, setAvatar] = useState("/default-avatar.png")
  const fileInputRef = useRef(null)

  // New state for vitalsHistory
  const [vitalsHistory, setVitalsHistory] = useState([])

  // New state for Framingham calculation
  const [showFramingham, setShowFramingham] = useState(false)

  const [showHeartDisease, setShowHeartDisease] = useState(false)
  const [heartData, setHeartData] = useState(null)

  // Move handleLogout function here
  const handleLogout = async () => {
    try {
      await axios.get(`http://localhost:4000/api/v1/user/patient/logout`, {
        withCredentials: true,
      })
      toast.success("Logged out successfully!")
      setIsAuthenticated(false)
      setUser({}) // Clear user data after logout
      navigateTo("/") // Navigate to home page after logout
    } catch (err) {
      toast.error(err.response.data.message || "Logout failed")
    }
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch appointments
        const appointmentsResponse = await axios.get("http://localhost:4000/api/v1/appointment/patient", {
          withCredentials: true,
        })

        if (appointmentsResponse.data.success) {
          // Transform backend data to match frontend structure
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
        } else {
          setAppointments([])
        }

        // Fetch health records
        const healthRecordsResponse = await axios.get("http://localhost:4000/api/v1/health-records/me", {
          withCredentials: true,
        })

        if (healthRecordsResponse.data.success) {
          // Transform backend data to match frontend structure
          const formattedRecords = healthRecordsResponse.data.healthRecords.slice(0, 3).map((record) => ({
            ...record,
            id: record._id,
            type: record.recordType,
            date: record.createdAt,
          }))

          setHealthRecords(formattedRecords)
        } else {
          setHealthRecords([])
        }

        // Fetch vitals
        try {
          const vitalsResponse = await axios.get("http://localhost:4000/api/v1/vitals/history", {
            withCredentials: true,
          })

          if (vitalsResponse.data.success && vitalsResponse.data.vitals.length > 0) {
            const latestVital = vitalsResponse.data.vitals[0]
            setVitals({
              bloodPressure: latestVital.bloodPressure || "120/80",
              heartRate: latestVital.heartRate || "72",
              weight: latestVital.weight || "70",
              glucoseLevel: latestVital.glucoseLevel || "90",
              cholesterol: latestVital.cholesterol || "200",
              hdlCholesterol: latestVital.hdlCholesterol || "50",
            })
            setVitalsHistory(vitalsResponse.data.vitals)
          }
        } catch (error) {
          console.error("Error fetching vitals:", error)
          // Keep default vitals if fetch fails
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

  useEffect(() => {
    // Fetch patient details (if not already in context)
    axios.get("http://localhost:4000/api/v1/user/patient/me", {
      withCredentials: true,
    }).then(res => {
      if (res.data.user?.userAvatar?.url) {
        setAvatar(res.data.user.userAvatar.url);
      }
    });
  }, []);

  // Fetch heart data when the component mounts
  useEffect(() => {
    const fetchHeartData = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/v1/heartdata/me", {
          withCredentials: true,
        });
        if (data.success) {
          setHeartData(data.latestData);
        }
      } catch (error) {
        // This is not an error, it just means no data exists yet.
        // We handle the null state in the component.
        console.log("No heart disease prediction data found for this patient.");
      }
    };
    fetchHeartData();
  }, []);

  const handleAvatarUpload = (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    axios.post("http://localhost:4000/api/v1/user/patient/upload-avatar", formData, {
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

  function formatAMPM(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number)
    const date = new Date()
    date.setHours(hours)
    date.setMinutes(minutes)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour24: true })
  }

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

  const handleVitalUpdate = (e) => {
    const { name, value } = e.target
    setVitals((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleViewHealthRecord = async (record) => {
    try {
      // If we don't have all the necessary data for the modal, fetch the complete record
      if (!record.description || !record.fileName || !record.fileUrl) {
        const response = await axios.get(`http://localhost:4000/api/v1/health-records/${record.id || record._id}`, {
          withCredentials: true,
        })

        if (response.data.success) {
          setSelectedRecord(response.data.healthRecord)
        } else {
          toast.error("Failed to load record details")
          return
        }
      } else {
        setSelectedRecord(record)
      }
      setShowHealthRecordModal(true)
    } catch (error) {
      console.error("Error fetching health record details:", error)
      toast.error("Failed to load record details")
    }
  }

  const saveVitals = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/vitals/add",
        {
          bloodPressure: vitals.bloodPressure,
          heartRate: vitals.heartRate,
          weight: vitals.weight,
          glucoseLevel: vitals.glucoseLevel,
          cholesterol: vitals.cholesterol,
          hdlCholesterol: vitals.hdlCholesterol,
        },
        {
          withCredentials: true,
        },
      )

      if (response.data.success) {
        toast.success("Vitals updated successfully")
      } else {
        toast.error("Failed to update vitals")
      }
    } catch (error) {
      console.error("Error saving vitals:", error)
      toast.error("Failed to update vitals")
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
      const appointmentDate = new Date(appointment.date)
      return (
        appointmentDate.getDate() === day &&
        appointmentDate.getMonth() === month &&
        appointmentDate.getFullYear() === year
      )
    })
  }

  // New function to handle calendar day click
  const handleCalendarDayClick = (day) => {
    // Don't update selectedDate for visual highlighting
    // We'll just use it for tracking which day was clicked for the popup

    // Create a date object for the selected day
    const currentDate = new Date()
    const selectedDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 0, 0, 0)

    // Set the selected full date for booking form
    setSelectedFullDate(selectedDateObj)

    // Format the date for the booking form
    const formattedDate = formatLocalDateTime(selectedDateObj)
    setPrefilledDate(formattedDate)

    // Find appointments for this day
    const appointmentsForDay = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date)
      return (
        appointmentDate.getDate() === day &&
        appointmentDate.getMonth() === currentDate.getMonth() &&
        appointmentDate.getFullYear() === currentDate.getFullYear() &&
        appointment.status.toLowerCase() !== "cancelled"
      )
    })

    setSelectedDateAppointments(appointmentsForDay)
    setShowAppointmentPopup(true)
  }

  // Handle book appointment button click
  const handleBookAppointment = () => {
    setShowAppointmentPopup(false)
    setShowBookingForm(true)
  }

  const handleMonthChange = (direction) => {
    // Create a date object from the current month string
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

    // Reset selected date when changing months
    setSelectedDate(null)
  }

  // Add a helper to format date:
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Prepare chart data for blood pressure:
  const bloodPressureChartData = {
    labels: vitalsHistory.map((v) => formatDate(v.date)),
    datasets: [
      {
        label: "Systolic",
        data: vitalsHistory.map((v) => v.bloodPressure?.systolic),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        yAxisID: "y",
      },
      {
        label: "Diastolic",
        data: vitalsHistory.map((v) => v.bloodPressure?.diastolic),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        yAxisID: "y",
      },
    ],
  }

  const bloodPressureChartOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Blood Pressure (mmHg)",
        },
      },
    },
  }

  const renderDashboardContent = () => {
    return (
      <div className="dashboard-content">
        <div className="prediction-cards-row">
          <div className="dashboard-section" style={{ flex: 1 }}>
            <div className="section-header">
              <h2>Heart Disease Prediction Based on Current Symptoms</h2>
              <button className="btn-primary" onClick={() => setShowHeartDisease(true)}>
                Predict
              </button>
            </div>
          </div>
          <div className="dashboard-section" style={{ flex: 1 }}>
            <div className="section-header">
              <h2>Cardiovascular Disease Risk in 10 years</h2>
              <button className="btn-primary" onClick={() => setShowFramingham(true)}>
                Calculate
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showHeartDisease && (
          <HeartDiseaseForm
            patientData={heartData}
            onClose={() => setShowHeartDisease(false)}
          />
        )}
        {showFramingham && (
          <Modal onClose={() => setShowFramingham(false)}>
            <FraminghamCalculation
              user={user}
              latestVitals={vitals}
              onClose={() => setShowFramingham(false)}
            />
          </Modal>
        )}

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Blood Pressure History</h2>
          </div>
          <div className="blood-pressure-chart" style={{ background: "#f9fafb", borderRadius: "1rem", padding: "2rem 1rem" }}>
            {vitalsHistory.length > 0 ? (
              <Line data={bloodPressureChartData} options={bloodPressureChartOptions} />
            ) : (
              <div className="loading">No blood pressure data available</div>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Health Records</h2>
            <button className="view-all" onClick={() => setActiveSection("healthrecords")}>
              View All
            </button>
          </div>
          <div className="records-container">
            {healthRecords.length > 0 ? (
              <ul className="record-list">
                {healthRecords.map((record) => (
                  <li key={record.id || record._id} className="record-item">
                    <div className="record-details">
                      <h3>{record.type || record.recordType}</h3>
                      <p>Date: {new Date(record.date || record.createdAt).toLocaleDateString()}</p>
                      {record.description && (
                        <p className="record-description">{record.description.substring(0, 50)}...</p>
                      )}
                    </div>
                    <button
                      className="btn-view"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewHealthRecord(record)
                      }}
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No health records available</p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Appointments</h2>
            <button className="view-all" onClick={() => setActiveSection("appointments")}>
              View All
            </button>
          </div>
          <div className="appointments-container">
            {appointments.length > 0 ? (
              <ul className="appointment-list">
                {appointments.slice(0, 2).map((appointment) => (
                  <li key={appointment._id} className="appointment-item">
                    <div className="appointment-details">
                      <h3>{appointment.reason}</h3>
                      <p>Doctor: Dr. {appointment.doctorName}</p>
                      <p>Date: {new Date(appointment.date).toLocaleDateString()}</p>
                      <p>Time: {appointment.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No upcoming appointments</p>
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
      case "search":
        return <DoctorSearch />
      case "appointments":
        return (
          <AppointmentList
            showBookingForm={showBookingForm}
            setShowBookingForm={setShowBookingForm}
            prefilledDate={prefilledDate}
          />
        )
      case "healthrecords":
        return <HealthRecords />
      case "medications":
        return <Medications />
      case "vitals":
        return <PatientVitals />
      default:
        return renderDashboardContent()
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="patient-dashboard-container">
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
            <li className={activeSection === "search" ? "active" : ""}>
              <button onClick={() => setActiveSection("search")}>
                <Search className="w-5 h-5" />
                <span>Search for Doctor</span>
              </button>
            </li>
            <li className={activeSection === "appointments" ? "active" : ""}>
              <button onClick={() => setActiveSection("appointments")}>
                <Calendar className="w-5 h-5" />
                <span>Appointment List</span>
              </button>
            </li>
            <li className={activeSection === "healthrecords" ? "active" : ""}>
              <button onClick={() => setActiveSection("healthrecords")}>
                <FileText className="w-5 h-5" />
                <span>Health Records</span>
              </button>
            </li>
            <li className={activeSection === "medications" ? "active" : ""}>
              <button onClick={() => setActiveSection("medications")}>
                <Pill className="w-5 h-5" />
                <span>Medications</span>
              </button>
            </li>
            <li className={activeSection === "vitals" ? "active" : ""}>
              <button onClick={() => setActiveSection("vitals")}>
                <Activity className="w-5 h-5" />
                <span>Vitals History</span>
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
              <img src={avatar} alt="Patient Avatar" />
              <span className="ml-2 hidden md:inline-block">{user?.firstName || "Patient"}</span>
            </div>
          </div>
        </div>

        {activeSection !== "dashboard" && (
          <button className="chevron-back-btn" onClick={() => setActiveSection("dashboard")}
            style={{ alignItems: 'center' }}
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
          </button>
        )}

        <div className="content-wrapper">
          <div className="content-main">{renderContent()}</div>

          {/* Right Sidebar - Appointments */}
          <div className="appointments-sidebar">
            <div className="appointments-header">
              <h2>Upcoming appointment</h2>
            </div>

            {/* Replace the calendar-section div in the appointments-sidebar with: */}
            <div className="calendar-section">
              <AppointmentCalendar
                appointments={appointments.filter(app => app.status.toLowerCase() !== "cancelled")}
                onDateClick={(date) => {
                  // Create a date object for the selected day
                  const selectedDateObj = date
                  // Set the selected full date for booking form
                  setSelectedFullDate(selectedDateObj)

                  // Format the date for the booking form
                  const formattedDate = formatLocalDateTime(selectedDateObj)
                  setPrefilledDate(formattedDate)

                  // Find appointments for this day
                  const appointmentsForDay = appointments.filter((appointment) => {
                    const appointmentDate = new Date(appointment.date)
                    return (
                      appointmentDate.getDate() === date.getDate() &&
                      appointmentDate.getMonth() === date.getMonth() &&
                      appointmentDate.getFullYear() === date.getFullYear() &&
                      appointment.status.toLowerCase() !== "cancelled"
                    )
                  })

                  setSelectedDateAppointments(appointmentsForDay)
                  setShowAppointmentPopup(true)
                }}
                userRole="patient"
              />
            </div>

            <div className="appointments-list">
              {appointments.length > 0 ? (
                appointments.slice(0, 2).map((appointment) => (
                  <div key={appointment._id} className="appointment-item">
                    <div className="appointment-time">
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      <span>
                        {`${formatAMPM(appointment.time.split(" - ")[0])}-${formatAMPM(appointment.time.split(" - ")[1])}`}
                      </span>
                    </div>
                    <div className="appointment-details">
                      <h3>{appointment.reason}</h3>
                      <p>Dr {appointment.doctorName}</p>
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

      {/* Health Record Modal */}
      {showHealthRecordModal && selectedRecord && (
        <HealthRecordModal record={selectedRecord} onClose={() => setShowHealthRecordModal(false)} />
      )}

      {/* Appointment Popup */}
      <AppointmentPopup
        isVisible={showAppointmentPopup}
        onClose={() => setShowAppointmentPopup(false)}
        appointments={selectedDateAppointments}
        date={selectedFullDate}
        onBookAppointment={handleBookAppointment}
        userRole="patient"
      />
    </div>
  )
}

function formatLocalDateTime(date) {
  const pad = (n) => n.toString().padStart(2, '0')
  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes())
  )
}

export default PatientDashboard
