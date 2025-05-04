"use client"

import { useState, useEffect } from "react"
import { Search, UserCog, Phone, Mail, Calendar, Filter, ChevronDown } from 'lucide-react'

const DoctorsList = ({ doctors = [], onDoctorSelect }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    // Extract unique departments
    const uniqueDepartments = [...new Set(doctors.map(doc => doc.doctorDepartment).filter(Boolean))]
    setDepartments(uniqueDepartments)
    
    filterDoctors()
  }, [doctors, searchTerm, departmentFilter])

  const filterDoctors = () => {
    let filtered = [...doctors]

    // Apply search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (doctor) =>
          `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doctor.phone && doctor.phone.includes(searchTerm))
      )
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((doctor) => doctor.doctorDepartment === departmentFilter)
    }

    setFilteredDoctors(filtered)
  }

  return (
    <div className="doctors-list-container">
      <div className="section-header mb-4">
        <h2>Doctors List</h2>
        <div className="header-actions">
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
          <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-1" />
            Filters
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-container">
          <div className="filter-group">
            <label>Department:</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {filteredDoctors.length > 0 ? (
        <div className="doctors-grid">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="doctor-card" onClick={() => onDoctorSelect(doctor)}>
              <div className="doctor-avatar">
                {doctor.docAvatar?.url ? (
                  <img src={doctor.docAvatar.url || "/placeholder.svg"} alt={`${doctor.firstName} ${doctor.lastName}`} className="avatar-img" />
                ) : (
                  <UserCog className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="doctor-info">
                <h3 className="doctor-name">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h3>
                <p className="doctor-department">{doctor.doctorDepartment || "General"}</p>
                <div className="doctor-details">
                  <div className="detail-item">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{doctor.phone || "Not provided"}</span>
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
              <button className="view-doctor-btn">View Details</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-doctors">
          <p>No doctors found</p>
        </div>
      )}
    </div>
  )
}

export default DoctorsList
