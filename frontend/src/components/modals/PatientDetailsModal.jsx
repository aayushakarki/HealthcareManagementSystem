"use client"

import { useState, useEffect } from "react"
import { X, Mail, Phone, Calendar, MapPin, User, FileText, Plus } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"
import HealthRecordModal from "../modals/HealthRecordModal"

const PatientDetailsModal = ({ patient, onClose }) => {
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

  if (!patient) return null

  return (
    <div className="modal-overlay">
      <div className="patient-modal max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="modal-header flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold">Patient Details</h3>
          <button className="close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-content p-4">
          {loading ? (
            <div className="loading">Loading patient details...</div>
          ) : (
            <>
              <div className="patient-header flex items-center gap-4 mb-6">
                <div className="patient-avatar bg-gray-100 p-4 rounded-full">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
                <div className="patient-info">
                  <h2 className="text-2xl font-bold">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <div className="patient-meta text-gray-500">
                    <span className="patient-gender">{patient.gender}</span>
                    {patient.dob && (
                      <span className="patient-age">
                        • {new Date().getFullYear() - new Date(patient.dob).getFullYear()} years
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="patient-tabs flex border-b mb-4">
                <button
                  className={`tab-button px-4 py-2 font-medium ${
                    activeTab === "overview" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  className={`tab-button px-4 py-2 font-medium ${
                    activeTab === "appointments" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("appointments")}
                >
                  Appointments
                </button>
                <button
                  className={`tab-button px-4 py-2 font-medium ${
                    activeTab === "records" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("records")}
                >
                  Health Records
                </button>
              </div>

              <div className="tab-content">
                {activeTab === "overview" && (
                  <div className="overview-tab">
                    <div className="contact-info mb-6">
                      <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                      <div className="info-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="info-item flex items-center gap-2">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <span>{patient.email}</span>
                        </div>
                        <div className="info-item flex items-center gap-2">
                          <Phone className="w-5 h-5 text-gray-500" />
                          <span>{patient.phone}</span>
                        </div>
                        {patient.address && (
                          <div className="info-item flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-500" />
                            <span>{patient.address}</span>
                          </div>
                        )}
                        {patient.dob && (
                          <div className="info-item flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <span>DOB: {new Date(patient.dob).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="recent-activity">
                      <div className="activity-header mb-3">
                        <h3 className="text-lg font-semibold">Recent Activity</h3>
                      </div>

                      <div className="activity-timeline space-y-4">
                        {appointments.length > 0 && (
                          <div className="timeline-item flex gap-3 p-3 border rounded-lg">
                            <div className="timeline-icon bg-blue-100 p-2 rounded-full">
                              <Calendar className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="timeline-content">
                              <h4 className="font-medium">Last Appointment</h4>
                              <p>{appointments[0].department}</p>
                              <p className="timeline-date text-sm text-gray-500">
                                {new Date(appointments[0].appointment_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}

                        {healthRecords.length > 0 && (
                          <div className="timeline-item flex gap-3 p-3 border rounded-lg">
                            <div className="timeline-icon bg-green-100 p-2 rounded-full">
                              <FileText className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="timeline-content">
                              <h4 className="font-medium">Last Health Record</h4>
                              <p>{healthRecords[0].recordType}</p>
                              <p className="timeline-date text-sm text-gray-500">
                                {new Date(healthRecords[0].createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "appointments" && (
                  <div className="appointments-tab">
                    <div className="tab-header flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Appointment History</h3>
                      <button className="btn-primary btn-sm px-3 py-1 bg-blue-500 text-white rounded-md flex items-center gap-1">
                        <Plus className="w-4 h-4" />
                        New Appointment
                      </button>
                    </div>

                    {appointments.length > 0 ? (
                      <div className="appointments-list space-y-4">
                        {appointments.map((appointment) => (
                          <div
                            key={appointment._id}
                            className="appointment-card flex border rounded-lg overflow-hidden"
                          >
                            <div className="appointment-date bg-gray-50 p-3 flex flex-col items-center justify-center min-w-[80px]">
                              <div className="date-box text-center">
                                <span className="month block text-sm text-gray-500">
                                  {new Date(appointment.appointment_date).toLocaleDateString("en-US", {
                                    month: "short",
                                  })}
                                </span>
                                <span className="day block text-2xl font-bold">
                                  {new Date(appointment.appointment_date).getDate()}
                                </span>
                              </div>
                            </div>

                            <div className="appointment-details p-3 flex-1">
                              <h4 className="font-medium">{appointment.department}</h4>
                              <p className="appointment-time text-sm text-gray-500">
                                {formatTimeFromDate(appointment.appointment_date)}
                              </p>
                              <span
                                className={`status-badge inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                                  appointment.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : appointment.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : appointment.status === "rescheduled"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-blue-100 text-blue-800"
                                }`}
                              >
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
                      <div className="no-data p-4 text-center bg-gray-50 rounded-lg">
                        <p>No appointment history available</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "records" && (
                  <div className="records-tab">
                    {healthRecords.length > 0 ? (
                      <div className="records-list space-y-3">
                        {healthRecords.map((record) => (
                          <div
                            key={record._id}
                            className="record-card flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                            onClick={() => handleRecordClick(record)}
                          >
                            <div className="record-icon bg-blue-100 p-2 rounded-full">
                              <FileText className="w-6 h-6 text-blue-500" />
                            </div>

                            <div className="record-details flex-1">
                              <h4 className="font-medium">{record.recordType}</h4>
                              {record.description && <p className="record-description text-sm">{record.description}</p>}
                              <p className="record-date text-xs text-gray-500">
                                {new Date(record.createdAt).toLocaleDateString()}
                              </p>
                              {record.fileName && <p className="record-filename text-xs">{record.fileName}</p>}
                            </div>

                            <button className="btn-outline btn-sm px-3 py-1 border rounded-md text-sm">View</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-data p-4 text-center bg-gray-50 rounded-lg">
                        <p>No health records available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Health Record Modal */}
      {selectedRecord && <HealthRecordModal record={selectedRecord} onClose={handleCloseModal} />}
    </div>
  )
}

export default PatientDetailsModal
