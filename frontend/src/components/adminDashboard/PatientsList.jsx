"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Search, UserRound, Phone, Mail, Calendar, Eye, Trash } from 'lucide-react'
import PatientDetailsModal from "../modals/PatientDetailsModal"

const PatientsList = ({ onPatientSelect }) => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPatients, setFilteredPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)

        // Fetch all patients
        const patientsResponse = await axios.get("http://localhost:4000/api/v1/user/patients", {
          withCredentials: true,
        })

        if (patientsResponse.data.success) {
          setPatients(patientsResponse.data.patients || [])
          setFilteredPatients(patientsResponse.data.patients || [])
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching patients:", error)
        toast.error("Failed to load patients")
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients)
    } else {
      const filtered = patients.filter(
        (patient) =>
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (patient.phone && patient.phone.includes(searchTerm)),
      )
      setFilteredPatients(filtered)
    }
  }, [searchTerm, patients])

  const handleViewDetails = async (patientId) => {
    try {
      // Fetch patient details
      const response = await axios.get(`http://localhost:4000/api/v1/user/patient/${patientId}`, {
        withCredentials: true,
      })

      if (response.data.success) {
        setSelectedPatient(response.data.user)
        setShowModal(true)
      }
    } catch (error) {
      console.error("Error fetching patient details:", error)
      // If API fails, try to get patient info from the patients list
      const patient = patients.find((p) => p._id === patientId)
      if (patient) {
        setSelectedPatient({
          _id: patientId,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          dob: patient.dob,
          gender: patient.gender,
          address: patient.address,
        })
        setShowModal(true)
      } else {
        toast.error("Failed to load patient details")
      }
    }
  }

  const handleDeletePatient = async (patient) => {
    // Use the browser's built-in confirm dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${patient.firstName} ${patient.lastName}? This will remove all their appointments and cannot be undone.`
    )

    if (confirmDelete) {
      try {
        setLoading(true)

        // Call the endpoint to delete the patient
        const response = await axios.delete(`http://localhost:4000/api/v1/user/patient/delete/${patient._id}`, {
          withCredentials: true,
        })

        if (response.data.success) {
          toast.success("Patient deleted successfully")

          // Remove the deleted patient from the list
          setPatients(patients.filter((p) => p._id !== patient._id))
          setFilteredPatients(filteredPatients.filter((p) => p._id !== patient._id))
        }

        setLoading(false)
      } catch (error) {
        console.error("Error deleting patient:", error)
        toast.error(error.response?.data?.message || "Failed to delete patient")
        setLoading(false)
      }
    }
  }

  if (loading) {
    return <div className="loading">Loading patients...</div>
  }

  return (
    <div className="patient-list-container">
      <div className="section-header mb-4">
        <h2>Patient List</h2>
        <div className="search-container">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredPatients.length > 0 ? (
        <div className="patients-grid">
          {filteredPatients.map((patient) => (
            <div key={patient._id} className="patient-card">
              <div className="patient-avatar">
                <UserRound className="w-12 h-12 text-gray-400" />
              </div>
              <div className="patient-info">
                <h3 className="patient-name">
                  {patient.firstName} {patient.lastName}
                </h3>
                <div className="patient-details">
                  <div className="detail-item">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{patient.phone || "No phone"}</span>
                  </div>
                  <div className="detail-item">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{patient.email}</span>
                  </div>
                  {patient.createdAt && (
                    <div className="detail-item">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Joined: {new Date(patient.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="patient-actions">
                <button
                  className="view-details-btn flex items-center gap-1"
                  onClick={() => handleViewDetails(patient._id)}
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  className="delete-button flex items-center gap-1 text-red-500 hover:text-red-700"
                  onClick={() => handleDeletePatient(patient)}
                >
                  <Trash className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-patients">
          <p>No patients found</p>
        </div>
      )}

      {/* Patient Details Modal */}
      {showModal && <PatientDetailsModal patient={selectedPatient} onClose={() => setShowModal(false)} />}
    </div>
  )
}

export default PatientsList
