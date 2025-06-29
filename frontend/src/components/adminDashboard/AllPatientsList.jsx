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

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)

        // Fetch all patients for admin
        const patientsResponse = await axios.get("http://localhost:4000/api/v1/user/patients", {
          withCredentials: true,
        })

        if (patientsResponse.data.success) {
          // Transform the data to ensure consistent field names
          const transformedPatients = patientsResponse.data.patients.map(patient => ({
            id: patient._id,
            _id: patient._id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            phone: patient.phone,
            gender: patient.gender,
            dob: patient.dob,
            address: patient.address,
            // Include avatar information
            userAvatar: patient.userAvatar,
            avatarUrl: patient.userAvatar?.url || null,
            // Set a default lastVisit if not provided
            lastVisit: patient.lastVisit || patient.createdAt || new Date().toISOString(),
          }))

          setPatients(transformedPatients)
          setFilteredPatients(transformedPatients)
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
        
        // Try to use the backend search endpoint
        try {
          const response = await axios.get(`http://localhost:4000/api/v1/search/patients?query=${encodeURIComponent(searchTerm)}`, {
            withCredentials: true,
          })
          
          if (response.data.success) {
            // Filter to only include patients that are in our patients list
            const patientIds = new Set(patients.map(p => p._id))
            const filteredResults = response.data.patients.filter(p => patientIds.has(p._id))
            
            // Format the results to match our expected structure
            const formattedResults = filteredResults.map(p => {
              // Find the original patient to get the lastVisit date
              const originalPatient = patients.find(op => op._id === p._id)
              return {
                id: p._id,
                _id: p._id,
                firstName: p.firstName,
                lastName: p.lastName,
                email: p.email,
                phone: p.phone,
                lastVisit: originalPatient?.lastVisit || new Date().toISOString(),
                gender: p.gender,
                dob: p.dob,
                address: p.address,
                // Include avatar information from search results
                userAvatar: p.userAvatar || originalPatient?.userAvatar,
                avatarUrl: p.userAvatar?.url || originalPatient?.avatarUrl,
              }
            })
            
            setFilteredPatients(formattedResults)
          } else {
            // Fallback to client-side filtering
            clientSideFilter()
          }
        } catch (searchError) {
          console.log("Backend search failed, using client-side filtering")
          clientSideFilter()
        }
      } catch (error) {
        console.error("Error searching patients:", error)
        clientSideFilter()
      }
    }

    const clientSideFilter = () => {
      const filtered = patients.filter(
        (patient) =>
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone.includes(searchTerm)
      )
      setFilteredPatients(filtered)
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
      `Are you sure you want to delete ${patient.firstName} ${patient.lastName}? All their appointments will be cancelled. This action cannot be undone.`
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
          setPatients(prevPatients => prevPatients.filter((p) => p._id !== patient._id))
          setFilteredPatients(prevFiltered => prevFiltered.filter((p) => p._id !== patient._id))
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

  console.log("Patients data:", patients);
  console.log("Filtered patients:", filteredPatients);

  return (
    <div className="patient-list-container">
      <div className="section-header">
        <h2>Patient List</h2>
        <div className="search-input">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredPatients.length > 0 ? (
        <div className="patients-grid">
          {filteredPatients.map((patient) => (
            <div key={patient._id} className="patient-card">
              <div className="patient-avatar">
                {patient.avatarUrl ? (
                  <img 
                    src={patient.avatarUrl} 
                    alt={`${patient.firstName} ${patient.lastName}`}
                    className="avatar-img"
                    onError={(e) => {
                      // Fallback to default icon if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <UserRound 
                  className="w-12 h-12 text-gray-400" 
                  style={{ display: patient.avatarUrl ? 'none' : 'block' }}
                />
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