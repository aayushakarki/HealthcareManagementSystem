"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Search, UserCog, Phone, Mail, Calendar, Eye, Trash } from "lucide-react"
import DoctorModal from "../modals/DoctorModal"

const DoctorsList = ({ onDoctorSelect }) => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)

        // Fetch all doctors
        const doctorsResponse = await axios.get("http://localhost:4000/api/v1/user/doctors", {
          withCredentials: true,
        })

        if (doctorsResponse.data.success) {
          setDoctors(doctorsResponse.data.doctors || [])
          setFilteredDoctors(doctorsResponse.data.doctors || [])
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching doctors:", error)
        toast.error("Failed to load doctors")
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDoctors(doctors)
    } else {
      const filtered = doctors.filter(
        (doctor) =>
          `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doctor.phone && doctor.phone.includes(searchTerm)) ||
          (doctor.doctorDepartment && doctor.doctorDepartment.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredDoctors(filtered)
    }
  }, [searchTerm, doctors])

  const handleDeleteDoctor = async (doctor) => {
    // Use the browser's built-in confirm dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Dr. ${doctor.firstName} ${doctor.lastName}? All their appointments will be marked as cancelled. This action cannot be undone.`,
    )

    if (confirmDelete) {
      try {
        setLoading(true)

        // Call the endpoint to delete the doctor
        const response = await axios.delete(`http://localhost:4000/api/v1/user/doctor/delete/${doctor._id}`, {
          withCredentials: true,
        })

        if (response.data.success) {
          toast.success("Doctor deleted successfully")

          // Remove the deleted doctor from the list
          setDoctors(doctors.filter((d) => d._id !== doctor._id))
          setFilteredDoctors(filteredDoctors.filter((d) => d._id !== doctor._id))
        }

        setLoading(false)
      } catch (error) {
        console.error("Error deleting doctor:", error)
        toast.error(error.response?.data?.message || "Failed to delete doctor")
        setLoading(false)
      }
    }
  }

  const handleViewDetails = async (doctorId) => {
    try {
      // Fetch doctor details
      const response = await axios.get(`http://localhost:4000/api/v1/user/doctor/${doctorId}`, {
        withCredentials: true,
      })

      if (response.data.success) {
        setSelectedDoctor(response.data.user)
        setShowModal(true)
      }
    } catch (error) {
      console.error("Error fetching doctor details:", error)
      // If API fails, try to get doctor info from the doctors list
      const doctor = doctors.find((d) => d._id === doctorId)
      if (doctor) {
        setSelectedDoctor(doctor)
        setShowModal(true)
      } else {
        toast.error("Failed to load doctor details")
      }
    }
  }

  if (loading) {
    return <div className="loading">Loading doctors...</div>
  }

  return (
    <div className="doctor-list-container">
      <div className="section-header mb-4">
        <h2>Doctor List</h2>
        <div className="search-container">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search doctors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredDoctors.length > 0 ? (
        <div className="doctors-grid">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="doctor-card">
              <div className="doctor-avatar">
                {doctor.docAvatar?.url ? (
                  <img
                    src={doctor.docAvatar.url || "/placeholder.svg"}
                    alt={`${doctor.firstName} ${doctor.lastName}`}
                    className="avatar-img"
                  />
                ) : (
                  <UserCog className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="doctor-info">
                <h3 className="doctor-name">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h3>
                <div className="doctor-specialty">{doctor.doctorDepartment || "General"}</div>
                <div className="doctor-details">
                  <div className="detail-item">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{doctor.phone || "No phone"}</span>
                  </div>
                  <div className="detail-item">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{doctor.email}</span>
                  </div>
                  {doctor.createdAt && (
                    <div className="detail-item">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Joined: {new Date(doctor.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="doctor-actions">
                <button
                  className="view-details-btn flex items-center gap-1"
                  onClick={() => handleViewDetails(doctor._id)}
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  className="delete-button flex items-center gap-1 text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteDoctor(doctor)}
                >
                  <Trash className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-doctors">
          <p>No doctors found</p>
        </div>
      )}
      {/* Doctor Details Modal */}
      {showModal && <DoctorModal doctor={selectedDoctor} onClose={() => setShowModal(false)} />}
    </div>
  )
}

export default DoctorsList
