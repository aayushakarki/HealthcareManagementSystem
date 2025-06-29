"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Search, User, Calendar } from 'lucide-react'
import DoctorModal from "../modals/DoctorModal"

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

  useEffect(() => {
    const searchDoctors = async () => {
      try {
        setLoading(true)
        
        // If no search term and no department filter, fetch all doctors
        if (!searchTerm && !departmentFilter) {
          const response = await axios.get("http://localhost:4000/api/v1/user/doctors", {
            withCredentials: true,
          })
          
          if (response.data.success) {
            setDoctors(response.data.doctors)
          }
          setLoading(false)
          return
        }
        
        // Use the backend search endpoint with advanced search
        let searchUrl = "http://localhost:4000/api/v1/search/advanced?role=Doctor"
        
        if (searchTerm) {
          searchUrl += `&query=${encodeURIComponent(searchTerm)}`
        }
        
        if (departmentFilter) {
          searchUrl += `&department=${encodeURIComponent(departmentFilter)}`
        }
        
        const response = await axios.get(searchUrl, {
          withCredentials: true,
        })
        
        if (response.data.success) {
          setDoctors(response.data.results)
        } else {
          setDoctors([])
        }
      } catch (error) {
        console.error("Error searching doctors:", error)
        // Fallback to client-side filtering if the API fails
        let filtered = [...doctors]
        
        if (searchTerm) {
          const term = searchTerm.toLowerCase()
          filtered = filtered.filter(doctor => {
            const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase()
            return fullName.includes(term) || 
                  (doctor.doctorDepartment && doctor.doctorDepartment.toLowerCase().includes(term))
          })
        }
        
        if (departmentFilter) {
          filtered = filtered.filter(doctor => 
            doctor.doctorDepartment && doctor.doctorDepartment === departmentFilter
          )
        }
        
        setDoctors(filtered)
      } finally {
        setLoading(false)
      }
    }
    
    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      searchDoctors()
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm, departmentFilter])

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedDoctor(null)
  }

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
          <Search className="w-5 h-5 ml-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search doctors by name or specialty"
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
        {doctors.length > 0 ? (
          doctors.map((doctor) => (
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