"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Search, UserRound, Phone, Mail, Calendar, Eye } from 'lucide-react'
import PatientDetailsModal from "../modals/PatientDetailsModal"

const PatientList = ({ onPatientSelect }) => {
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

        // Get all appointments to extract unique patients
        const appointmentsResponse = await axios.get("http://localhost:4000/api/v1/appointment/doctor/me", {
          withCredentials: true,
        })

        if (appointmentsResponse.data.success) {
          const appointments = appointmentsResponse.data.appointments

          // Extract unique patients from appointments
          const uniquePatients = []
          const patientIds = new Set()

          appointments.forEach((appointment) => {
            if (!patientIds.has(appointment.patientId)) {
              patientIds.add(appointment.patientId)
              uniquePatients.push({
                id: appointment.patientId,
                firstName: appointment.firstName,
                lastName: appointment.lastName,
                email: appointment.email,
                phone: appointment.phone,
                lastVisit: appointment.appointment_date,
                gender: appointment.gender,
                dob: appointment.dob,
                address: appointment.address,
              })
            }
          })

          setPatients(uniquePatients)
          setFilteredPatients(uniquePatients)
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
    const searchPatients = async () => {
      try {
        if (searchTerm.trim() === "") {
          setFilteredPatients(patients)
          return
        }
        
        // Use the backend search endpoint
        const response = await axios.get(`http://localhost:4000/api/v1/search/patients?query=${encodeURIComponent(searchTerm)}`, {
          withCredentials: true,
        })
        
        if (response.data.success) {
          // Filter to only include patients that are in our appointments
          const patientIds = new Set(patients.map(p => p.id))
          const filteredResults = response.data.patients.filter(p => patientIds.has(p._id))
          
          // Format the results to match our expected structure
          const formattedResults = filteredResults.map(p => {
            // Find the original patient to get the lastVisit date
            const originalPatient = patients.find(op => op.id === p._id)
            return {
              id: p._id,
              firstName: p.firstName,
              lastName: p.lastName,
              email: p.email,
              phone: p.phone,
              lastVisit: originalPatient?.lastVisit || new Date().toISOString(),
              gender: p.gender,
              dob: p.dob,
              address: p.address,
            }
          })
          
          setFilteredPatients(formattedResults)
        } else {
          // Fallback to client-side filtering if the API returns an error
          const filtered = patients.filter(
            (patient) =>
              `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
              patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              patient.phone.includes(searchTerm),
          )
          setFilteredPatients(filtered)
        }
      } catch (error) {
        console.error("Error searching patients:", error)
        // Fallback to client-side filtering if the API fails
        const filtered = patients.filter(
          (patient) =>
            `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm),
        )
        setFilteredPatients(filtered)
      }
    }
    
    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      searchPatients()
    }, 300)
    
    return () => clearTimeout(timeoutId)
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
      const patient = patients.find((p) => p.id === patientId)
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
            <div key={patient.id} className="patient-card">
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
                    <span>{patient.phone}</span>
                  </div>
                  <div className="detail-item">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="detail-item">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="patient-actions">
                <button
                  className="view-details-btn flex items-center gap-1"
                  onClick={() => handleViewDetails(patient.id)}
                >
                  <Eye className="w-4 h-4" />
                  View Details
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

export default PatientList