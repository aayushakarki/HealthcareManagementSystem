"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Search, User, Calendar } from 'lucide-react'
import DoctorModal from "./DoctorModal"

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [departments, setDepartments] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await axios.get("http://localhost:4000/api/v1/user/doctors", {
          withCredentials: true,
        })

        if (response.data.success && response.data.doctors) {
          setDoctors(response.data.doctors)
          
          // Extract unique departments for filter
          const uniqueDepartments = [...new Set(
            response.data.doctors
              .map(doctor => doctor.doctorDepartment)
              .filter(department => department) // Filter out undefined/null values
          )]
          
          setDepartments(uniqueDepartments)
        } else {
          setDoctors([])
          setError("No doctors found")
        }
      } catch (error) {
        console.error("Error fetching doctors:", error)
        setError("Failed to load doctors. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedDoctor(null)
  }

  // Filter doctors based on search term and department
  const filteredDoctors = doctors.filter((doctor) => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === "" || 
      (doctor.doctorDepartment && doctor.doctorDepartment.toLowerCase() === departmentFilter.toLowerCase())
    
    return matchesSearch && matchesDepartment
  })

  if (loading) {
    return <div className="loading">Loading doctors...</div>
  }

  if (error && doctors.length === 0) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="doctor-search-container">
      <h2 className="section-title">Find a Doctor</h2>
      
      <div className="search-filters">
        <div className="search-input">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search doctors by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="department-filter">
          <select 
            value={departmentFilter} 
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="doctors-list">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="doctor-card" onClick={() => handleViewDoctor(doctor)}>
              <div className="doctor-avatar">
                <img 
                  src={doctor.docAvatar?.url || "/placeholder.svg?height=80&width=80"} 
                  alt={`${doctor.firstName} ${doctor.lastName}`}
                  className="avatar-image"
                />
              </div>
              <div className="doctor-info">
                <h3 className="doctor-name">Dr. {doctor.firstName} {doctor.lastName}</h3>
                <p className="doctor-department">{doctor.doctorDepartment || "General Practitioner"}</p>
              </div>
              <button className="view-details-btn">View Details</button>
            </div>
          ))
        ) : (
          <p className="no-results">No doctors found matching your criteria</p>
        )}
      </div>

      {showModal && selectedDoctor && (
        <DoctorModal doctor={selectedDoctor} onClose={closeModal} />
      )}
    </div>
  )
}

export default DoctorSearch
