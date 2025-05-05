"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Search, UserRound, Phone, Mail, Calendar, Trash } from 'lucide-react'

const PatientList = ({ onPatientSelect }) => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPatients, setFilteredPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)

        // Fetch all patients for admin
        const patientsResponse = await axios.get("http://localhost:4000/api/v1/user/patients", {
          withCredentials: true,
        })

        if (patientsResponse.data.success) {
          setPatients(patientsResponse.data.patients)
          setFilteredPatients(patientsResponse.data.patients)
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

      
  const handleDeletePatient = async (patient) => {
    // Use the browser's built-in confirm dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Dr. ${patient.firstName} ${patient.lastName}? All their appointments will be marked as cancelled. This action cannot be undone.`,
    )

    if (confirmDelete) {
      try {
        setLoading(true)

        // Call the endpoint to delete the doctor
        const response = await axios.delete(`http://localhost:4000/api/v1/user/patient/delete/${patient._id}`, { 
          withCredentials: true,
        })

        if (response.data.success) {
          toast.success("Patient deleted successfully")

          // Remove the deleted doctor from the list
          setDoctors(patient.filter((d) => d._id !== patient._id))
          setFilteredDoctors(filteredPatients.filter((d) => d._id !== patient._id))
        }

        setLoading(false)
      } catch (error) {
        console.error("Error deleting doctor:", error)
        toast.error(error.response?.data?.message || "Failed to delete patient")
        setLoading(false)
      }
    }
  }
  
  if (loading) {
    return <div className="loading">Loading patients...</div>
  }

  console.log("Selected patient for modal:", selectedPatient);

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
    </div>
  )
}

export default PatientList