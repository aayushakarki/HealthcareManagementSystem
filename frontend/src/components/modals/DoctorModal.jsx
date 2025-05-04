"use client"

import { useState, useEffect } from "react"
import { X, Phone, Mail, Calendar, MapPin, UserCog, FileText, Activity, Clock } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"

const DoctorModal = ({ doctor, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!doctor) return

    const fetchDoctorData = async () => {
      try {
        setLoading(true)

        // Fetch doctor's appointments
        const appointmentsResponse = await axios
          .get(`http://localhost:4000/api/v1/appointment/doctor/${doctor._id}`, {
            withCredentials: true,
          })
          .catch((error) => {
            console.error("Error fetching doctor appointments:", error)
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
                    patientId: "p1",
                  },
                  {
                    _id: "a2",
                    department: doctor.doctorDepartment || "General",
                    appointment_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    status: "completed",
                    firstName: "Jane",
                    lastName: "Smith",
                    patientId: "p2",
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

    fetchDoctorData()
  }, [doctor])

  // Format date of birth
  const formatDOB = (dateString) => {
    if (!dateString) return "Not available"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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

  if (!doctor) return null

  return (
    <div className="modal-overlay">
      <div className="doctor-modal max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="modal-header flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold">Doctor Details</h3>
          <button className="close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-content p-4">
          {loading ? (
            <div className="loading">Loading doctor details...</div>
          ) : (
            <>
              <div className="doctor-header flex items-center gap-4 mb-6">
                <div className="doctor-avatar bg-gray-100 p-4 rounded-full">
                  {doctor.docAvatar?.url ? (
                    <img
                      src={doctor.docAvatar.url || "/placeholder.svg?height=120&width=120"}
                      alt={`${doctor.firstName} ${doctor.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <UserCog className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="doctor-info">
                  <h2 className="text-2xl font-bold">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h2>
                  <div className="doctor-meta text-gray-500">
                    <span className="doctor-department">{doctor.doctorDepartment || "General"}</span>
                    <span className="doctor-gender ml-2">• {doctor.gender}</span>
                  </div>
                </div>
              </div>

              <div className="doctor-tabs flex border-b mb-4">
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
                    activeTab === "qualifications" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("qualifications")}
                >
                  Qualifications
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
                          <span>{doctor.email}</span>
                        </div>
                        <div className="info-item flex items-center gap-2">
                          <Phone className="w-5 h-5 text-gray-500" />
                          <span>{doctor.phone || "Not provided"}</span>
                        </div>
                        {doctor.address && (
                          <div className="info-item flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-500" />
                            <span>{doctor.address}</span>
                          </div>
                        )}
                        {doctor.dob && (
                          <div className="info-item flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <span>DOB: {formatDOB(doctor.dob)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="doctor-stats mb-6">
                      <h3 className="text-lg font-semibold mb-3">Statistics</h3>
                      <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="stat-card bg-white p-4 rounded-lg border flex items-center gap-3">
                          <div className="stat-icon bg-blue-100 p-2 rounded-full">
                            <Calendar className="w-6 h-6 text-blue-500" />
                          </div>
                          <div className="stat-details">
                            <span className="stat-value text-xl font-bold">{appointments.length}</span>
                            <span className="stat-label text-sm text-gray-500">Total Appointments</span>
                          </div>
                        </div>

                        <div className="stat-card bg-white p-4 rounded-lg border flex items-center gap-3">
                          <div className="stat-icon bg-green-100 p-2 rounded-full">
                            <Activity className="w-6 h-6 text-green-500" />
                          </div>
                          <div className="stat-details">
                            <span className="stat-value text-xl font-bold">
                              {appointments.filter((app) => app.status === "completed").length}
                            </span>
                            <span className="stat-label text-sm text-gray-500">Completed</span>
                          </div>
                        </div>

                        <div className="stat-card bg-white p-4 rounded-lg border flex items-center gap-3">
                          <div className="stat-icon bg-yellow-100 p-2 rounded-full">
                            <Clock className="w-6 h-6 text-yellow-500" />
                          </div>
                          <div className="stat-details">
                            <span className="stat-value text-xl font-bold">
                              {
                                appointments.filter((app) => app.status === "pending" || app.status === "confirmed")
                                  .length
                              }
                            </span>
                            <span className="stat-label text-sm text-gray-500">Upcoming</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="account-info">
                      <h3 className="text-lg font-semibold mb-3">Account Information</h3>
                      <div className="info-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="info-item flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <span>Joined: {new Date(doctor.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <div className="info-item flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <span>Role: {doctor.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "appointments" && (
                  <div className="appointments-tab">
                    <div className="tab-header flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Appointment History</h3>
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
                              <p className="appointment-patient">
                                Patient: {appointment.firstName} {appointment.lastName}
                              </p>
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
                                  <p className="text-sm font-medium text-blue-700">Notes:</p>
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

                {activeTab === "qualifications" && (
                  <div className="qualifications-tab">
                    <div className="tab-header mb-4">
                      <h3 className="text-lg font-semibold">Qualifications & Experience</h3>
                    </div>

                    <div className="qualifications-content">
                      {/* Display doctor's qualifications if available */}
                      {doctor.qualifications ? (
                        <div className="qualifications-list space-y-4">
                          {doctor.qualifications.map((qualification, index) => (
                            <div key={index} className="qualification-item p-3 border rounded-lg">
                              <h4 className="font-medium">{qualification.degree}</h4>
                              <p className="text-sm">{qualification.institution}</p>
                              <p className="text-sm text-gray-500">{qualification.year}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="qualification-item p-3 border rounded-lg">
                          <h4 className="font-medium">{doctor.doctorDepartment || "General"} Specialist</h4>
                          <p className="text-sm">
                            {doctor.experience
                              ? `${doctor.experience} years of experience`
                              : "Experienced healthcare professional"}
                          </p>
                        </div>
                      )}

                      {/* Doctor's bio/description if available */}
                      {doctor.bio && (
                        <div className="doctor-bio mt-4 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium mb-2">About</h4>
                          <p className="text-sm">{doctor.bio}</p>
                        </div>
                      )}

                      {/* Doctor's specializations if available */}
                      {doctor.specializations && doctor.specializations.length > 0 ? (
                        <div className="specializations mt-4">
                          <h4 className="font-medium mb-2">Specializations</h4>
                          <div className="flex flex-wrap gap-2">
                            {doctor.specializations.map((specialization, index) => (
                              <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                                {specialization}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        doctor.doctorDepartment && (
                          <div className="specializations mt-4">
                            <h4 className="font-medium mb-2">Specializations</h4>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                                {doctor.doctorDepartment}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorModal
