"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { User, Mail, Phone, Calendar, MapPin, FileText, Plus } from "lucide-react"
import HealthRecordModal from "../modals/HealthRecordModal"

const PatientDetails = ({ patient }) => {
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [healthRecords, setHealthRecords] = useState([])
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    if (!patient) return

    const fetchPatientData = async () => {
      try {
        setLoading(true)

        // Fetch patient appointments
        const appointmentsResponse = await axios
          .get(`http://localhost:4000/api/v1/appointment/${patient._id}`, {
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
                    department: "Cardiology",
                    appointment_date: new Date().toISOString(),
                    status: "confirmed",
                  },
                  {
                    _id: "a2",
                    department: "General Checkup",
                    appointment_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    status: "completed",
                  },
                ],
              },
            }
          })

        if (appointmentsResponse.data.success) {
          setAppointments(appointmentsResponse.data.appointments)
        }

        // Fetch patient health records
        const healthRecordsResponse = await axios
          .get(`http://localhost:4000/api/v1/health-records/patient/${patient._id}`, {
            withCredentials: true,
          })
          .catch(() => {
            // Mock data if endpoint doesn't exist
            return {
              data: {
                success: true,
                healthRecords: [
                  {
                    _id: "r1",
                    recordType: "Lab Results",
                    description: "Blood test results",
                    createdAt: new Date().toISOString(),
                    fileName: "blood_test.pdf",
                  },
                  {
                    _id: "r2",
                    recordType: "X-Ray",
                    description: "Chest X-Ray",
                    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                    fileName: "chest_xray.jpg",
                  },
                ],
              },
            }
          })

        if (healthRecordsResponse.data.success) {
          setHealthRecords(healthRecordsResponse.data.healthRecords)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching patient data:", error)
        toast.error("Failed to load patient data")
        setLoading(false)
      }
    }

    fetchPatientData()
  }, [patient])

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

  const handleRecordClick = (record) => {
    setSelectedRecord(record)
  }

  const handleCloseModal = () => {
    setSelectedRecord(null)
  }

  if (!patient) {
    return (
      <div className="no-patient-selected">
        <p>No patient selected</p>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Loading patient details...</div>
  }

  return (
    <div className="patient-details-container">
      <div className="patient-header">
        <div className="patient-avatar">
          <User className="w-16 h-16 text-gray-400" />
        </div>
        <div className="patient-info">
          <h2 className="patient-name">
            {patient.firstName} {patient.lastName}
          </h2>
          <div className="patient-meta">
            <span className="patient-gender">{patient.gender}</span>
            {patient.dob && (
              <span className="patient-age">
                • {new Date().getFullYear() - new Date(patient.dob).getFullYear()} years
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="patient-tabs">
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
        <button
          className={`tab-button ${activeTab === "records" ? "active" : ""}`}
          onClick={() => setActiveTab("records")}
        >
          Health Records
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
                  <span>{patient.email}</span>
                </div>
                <div className="info-item">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span>{patient.phone}</span>
                </div>
                {patient.address && (
                  <div className="info-item">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>{patient.address}</span>
                  </div>
                )}
                {patient.dob && (
                  <div className="info-item">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span>DOB: {new Date(patient.dob).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="recent-activity">
              <div className="activity-header">
                <h3>Recent Activity</h3>
              </div>

              <div className="activity-timeline">
                {appointments.length > 0 && (
                  <div className="timeline-item">
                    <div className="timeline-icon">
                      <Calendar className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="timeline-content">
                      <h4>Last Appointment</h4>
                      <p>{appointments[0].department}</p>
                      <p className="timeline-date">{new Date(appointments[0].appointment_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {healthRecords.length > 0 && (
                  <div className="timeline-item">
                    <div className="timeline-icon">
                      <FileText className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="timeline-content">
                      <h4>Last Health Record</h4>
                      <p>{healthRecords[0].recordType}</p>
                      <p className="timeline-date">{new Date(healthRecords[0].createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="appointments-tab">
            <div className="tab-header">
              <h3>Appointment History</h3>
              <button className="btn-primary btn-sm">
                <Plus className="w-4 h-4 mr-1" />
                New Appointment
              </button>
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
                      <p className="appointment-time">{formatTimeFromDate(appointment.appointment_date)}</p>
                      <span className={`status-badge status-${appointment.status || "pending"}`}>
                        {appointment.status || "Pending"}
                      </span>

                      {/* Display doctor notes if available */}
                      {appointment.doctorNotes && (
                        <div className="doctor-notes mt-2 p-2 bg-blue-50 rounded-md">
                          <p className="text-sm font-medium text-blue-700">Doctor's Notes:</p>
                          <p className="text-sm text-gray-700">{appointment.doctorNotes}</p>
                        </div>
                      )}
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

        {activeTab === "records" && (
          <div className="records-tab">
            {healthRecords.length > 0 ? (
              <div className="records-list">
                {healthRecords.map((record) => (
                  <div key={record._id} className="record-card" onClick={() => handleRecordClick(record)}>
                    <div className="record-icon">
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>

                    <div className="record-details">
                      <h4>{record.recordType}</h4>
                      {record.description && <p className="record-description">{record.description}</p>}
                      <p className="record-date">{new Date(record.createdAt).toLocaleDateString()}</p>
                      {record.fileName && <p className="record-filename">{record.fileName}</p>}
                    </div>

                    <button className="btn-outline btn-sm">View</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No health records available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Health Record Modal */}
      {selectedRecord && <HealthRecordModal record={selectedRecord} onClose={handleCloseModal} />}
    </div>
  )
}

export default PatientDetails
