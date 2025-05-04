"use client"

import { useState, useEffect } from "react"
import { Search, User, Phone, Mail, Calendar, Filter, ChevronDown } from "lucide-react"

const PatientsList = ({ patients = [], onPatientSelect }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPatients, setFilteredPatients] = useState([])
  const [genderFilter, setGenderFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    filterPatients()
  }, [patients, searchTerm, genderFilter])

  const filterPatients = () => {
    let filtered = [...patients]

    // Apply search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (patient) =>
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (patient.phone && patient.phone.includes(searchTerm)),
      )
    }

    // Apply gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter((patient) => patient.gender?.toLowerCase() === genderFilter.toLowerCase())
    }

    setFilteredPatients(filtered)
  }

  return (
    <div className="patients-list-container">
      <div className="section-header mb-4">
        <h2>Patients List</h2>
        <div className="header-actions">
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
            <label>Gender:</label>
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="filter-select">
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      )}

      {filteredPatients.length > 0 ? (
        <div className="patients-grid">
          {filteredPatients.map((patient) => (
            <div key={patient._id} className="patient-card" onClick={() => onPatientSelect(patient)}>
              <div className="patient-avatar">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <div className="patient-info">
                <h3 className="patient-name">
                  {patient.firstName} {patient.lastName}
                </h3>
                <div className="patient-details">
                  <div className="detail-item">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{patient.phone || "Not provided"}</span>
                  </div>
                  <div className="detail-item">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{patient.email}</span>
                  </div>
                  {patient.dob && (
                    <div className="detail-item">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>DOB: {new Date(patient.dob).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <button className="view-patient-btn">View Details</button>
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

export default PatientsList
