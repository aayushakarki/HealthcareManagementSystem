"use client"

import { useState, useEffect } from "react"
import { Edit2, Save, X } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"

const PatientProfile = () => {
  const [patient, setPatient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    age: "",
    bloodType: "",
    status: "",
    department: "",
    appointmentDate: "",
    appointments: 0,
    bedNumber: "",
  })
  const [vitals, setVitals] = useState({
    bloodPressure: "",
    heartRate: "",
    oxygen: "",
    cholesterol: "",
  })
  const [loading, setLoading] = useState(true)
  const [editingVitals, setEditingVitals] = useState(false)
  const [updatedVitals, setUpdatedVitals] = useState({
    bloodPressure: "",
    heartRate: "",
    oxygen: "",
    cholesterol: "",
  })
  const [patientHistory, setPatientHistory] = useState([])

  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        setLoading(true)

        // Fetch patient profile data
        const profileResponse = await axios.get("http://localhost:4000/api/v1/user/patient/me", {
          withCredentials: true,
        })

        if (profileResponse.data.success) {
          const userData = profileResponse.data.user

          // Calculate age from DOB
          const age = userData.dob ? calculateAge(userData.dob) : ""

          setPatient({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            gender: userData.gender || "",
            age: age,
            bloodType: userData.bloodType || "A+",
            status: userData.status || "Active",
            department: userData.department || "Cardiology",
            appointmentDate: userData.lastAppointment || "20 Jan, 2025",
            appointments: userData.appointmentCount || 36,
            bedNumber: userData.bedNumber || "#1565",
          })
        }

        // Fetch vitals data
        try {
          const vitalsResponse = await axios.get("http://localhost:4000/api/v1/vitals/history", {
            withCredentials: true,
          })

          if (vitalsResponse.data.success && vitalsResponse.data.vitals.length > 0) {
            const latestVital = vitalsResponse.data.vitals[0]
            const vitalData = {
              bloodPressure: latestVital.bloodPressure || "120/89",
              heartRate: latestVital.heartRate || "120",
              oxygen: latestVital.oxygenSaturation || "97",
              cholesterol: latestVital.cholesterol || "85",
            }

            setVitals(vitalData)
            setUpdatedVitals(vitalData)
          } else {
            // Default values if no vitals found
            const defaultVitals = {
              bloodPressure: "120/89",
              heartRate: "120",
              oxygen: "97",
              cholesterol: "85",
            }
            setVitals(defaultVitals)
            setUpdatedVitals(defaultVitals)
          }
        } catch (error) {
          console.error("Error fetching vitals:", error)
          // Set default values if fetch fails
          const defaultVitals = {
            bloodPressure: "120/89",
            heartRate: "120",
            oxygen: "97",
            cholesterol: "85",
          }
          setVitals(defaultVitals)
          setUpdatedVitals(defaultVitals)
        }

        // Fetch patient history
        try {
          const historyResponse = await axios.get("http://localhost:4000/api/v1/health-records/me", {
            withCredentials: true,
          })

          if (historyResponse.data.success) {
            // Transform and limit to 5 records
            const formattedHistory = historyResponse.data.healthRecords.slice(0, 5).map((record) => ({
              date: new Date(record.createdAt).toLocaleDateString(),
              diagnosis: record.recordType || "Diagnosis",
              severity: record.severity || "Low",
              totalVisits: record.visitCount || 1,
              status: record.status || "Good",
              documents: record.documents?.length || 0,
            }))

            setPatientHistory(formattedHistory)
          }
        } catch (error) {
          console.error("Error fetching patient history:", error)
          // Set default history if fetch fails
          setPatientHistory([
            {
              date: "20 Jan, 2023",
              diagnosis: "Migraine",
              severity: "Low",
              totalVisits: 2,
              status: "Good",
              documents: 1,
            },
            {
              date: "17 Feb, 2023",
              diagnosis: "Sore Throat",
              severity: "Low",
              totalVisits: 1,
              status: "Good",
              documents: 1,
            },
            {
              date: "10 Jan, 2023",
              diagnosis: "Covid-19",
              severity: "High",
              totalVisits: 3,
              status: "Good",
              documents: 1,
            },
          ])
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching patient profile:", error)
        toast.error("Failed to load patient profile")
        setLoading(false)
      }
    }

    fetchPatientProfile()
  }, [])

  const calculateAge = (dob) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  const handleVitalChange = (e) => {
    const { name, value } = e.target
    setUpdatedVitals((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditVitals = () => {
    setEditingVitals(true)
  }

  const handleCancelEdit = () => {
    setEditingVitals(false)
    setUpdatedVitals(vitals)
  }

  const handleSaveVitals = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/vitals/add",
        {
          bloodPressure: updatedVitals.bloodPressure,
          heartRate: updatedVitals.heartRate,
          oxygenSaturation: updatedVitals.oxygen,
          cholesterol: updatedVitals.cholesterol,
          temperature: "98.6", // Default temperature
        },
        {
          withCredentials: true,
        },
      )

      if (response.data.success) {
        setVitals(updatedVitals)
        setEditingVitals(false)
        toast.success("Vitals updated successfully")
      } else {
        toast.error("Failed to update vitals")
      }
    } catch (error) {
      console.error("Error saving vitals:", error)
      toast.error(error.response?.data?.message || "Failed to update vitals")
    }
  }

  const getSeverityClass = (severity) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "high-severity"
      case "medium":
        return "medium-severity"
      case "low":
        return "low-severity"
      default:
        return "low-severity"
    }
  }

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "good":
        return "good-status"
      case "fair":
        return "fair-status"
      case "poor":
        return "poor-status"
      default:
        return "good-status"
    }
  }

  if (loading) {
    return <div className="loading">Loading patient profile...</div>
  }

  return (
    <div className="patient-profile-container">
      <div className="profile-header">
        <div className="breadcrumb">
          <span>Patient</span>
          <span className="separator">/</span>
          <span>Patient Details</span>
          <span className="separator">/</span>
          <span className="current">
            {patient.firstName} {patient.lastName}
          </span>
        </div>
        <div className="header-actions">
          <button className="print-btn">
            <span className="icon">🖨️</span>
          </button>
          <button className="search-btn">
            <span className="icon">🔍</span>
          </button>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-info">
          <div className="profile-avatar">
            <img
              src="/placeholder.svg?height=100&width=100"
              alt={`${patient.firstName} ${patient.lastName}`}
              className="avatar-image"
            />
          </div>
          <div className="profile-details">
            <h2 className="patient-name">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="patient-email">{patient.email}</p>
            <button className="edit-profile-btn">Edit Profile</button>
          </div>
        </div>

        <div className="patient-stats">
          <div className="stat-item">
            <div className="stat-label">Sex</div>
            <div className="stat-value">{patient.gender}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Age</div>
            <div className="stat-value">{patient.age}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Blood</div>
            <div className="stat-value">{patient.bloodType}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Status</div>
            <div className="stat-value">{patient.status}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Department</div>
            <div className="stat-value">{patient.department}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Appointment Date</div>
            <div className="stat-value">{patient.appointmentDate}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Appointments</div>
            <div className="stat-value">{patient.appointments}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Bed Number</div>
            <div className="stat-value">{patient.bedNumber}</div>
          </div>
        </div>
      </div>

      <div className="vitals-section">
        <div className="section-header">
          <h3>Patient Current Vitals</h3>
          {!editingVitals ? (
            <button className="edit-vitals-btn" onClick={handleEditVitals}>
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="edit-actions">
              <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button className="save-vitals-btn" onClick={handleSaveVitals}>
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          )}
        </div>

        <div className="vitals-grid">
          <div className="vital-card">
            <div className="vital-header">
              <h4>Blood Pressure</h4>
            </div>
            <div className="vital-content">
              {!editingVitals ? (
                <div className="vital-value">{vitals.bloodPressure}</div>
              ) : (
                <input
                  type="text"
                  name="bloodPressure"
                  value={updatedVitals.bloodPressure}
                  onChange={handleVitalChange}
                  className="vital-input"
                  placeholder="120/80"
                />
              )}
              <div className="vital-status">in the norm</div>
            </div>
          </div>

          <div className="vital-card">
            <div className="vital-header">
              <h4>Heart Rate</h4>
            </div>
            <div className="vital-content">
              {!editingVitals ? (
                <div className="vital-value">{vitals.heartRate}</div>
              ) : (
                <input
                  type="text"
                  name="heartRate"
                  value={updatedVitals.heartRate}
                  onChange={handleVitalChange}
                  className="vital-input"
                  placeholder="72"
                />
              )}
              <div className="vital-status above-the-norm">above the norm</div>
            </div>
          </div>

          <div className="vital-card">
            <div className="vital-header">
              <h4>Oxygen</h4>
            </div>
            <div className="vital-content">
              {!editingVitals ? (
                <div className="vital-value">{vitals.oxygen}</div>
              ) : (
                <input
                  type="text"
                  name="oxygen"
                  value={updatedVitals.oxygen}
                  onChange={handleVitalChange}
                  className="vital-input"
                  placeholder="97"
                />
              )}
              <div className="vital-status">in the norm</div>
            </div>
          </div>

          <div className="vital-card">
            <div className="vital-header">
              <h4>Cholesterol</h4>
            </div>
            <div className="vital-content">
              {!editingVitals ? (
                <div className="vital-value">{vitals.cholesterol}</div>
              ) : (
                <input
                  type="text"
                  name="cholesterol"
                  value={updatedVitals.cholesterol}
                  onChange={handleVitalChange}
                  className="vital-input"
                  placeholder="85"
                />
              )}
              <div className="vital-status">in the norm</div>
            </div>
          </div>
        </div>
      </div>

      <div className="history-section">
        <div className="section-header">
          <h3>Patient History</h3>
          <div className="total-visits">
            Total: {patientHistory.reduce((sum, record) => sum + record.totalVisits, 0)} Visits
          </div>
        </div>

        <div className="history-table">
          <div className="table-header">
            <div className="header-cell">Date</div>
            <div className="header-cell">Diagnosis</div>
            <div className="header-cell">Severity</div>
            <div className="header-cell">Total Visits</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Documents</div>
          </div>

          {patientHistory.map((record, index) => (
            <div key={index} className="table-row">
              <div className="cell">{record.date}</div>
              <div className="cell">{record.diagnosis}</div>
              <div className="cell">
                <span className={`severity-badge ${getSeverityClass(record.severity)}`}>{record.severity}</span>
              </div>
              <div className="cell">{record.totalVisits}</div>
              <div className="cell">
                <span className={`status-badge ${getStatusClass(record.status)}`}>{record.status}</span>
              </div>
              <div className="cell">
                <button className="download-btn">
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PatientProfile
