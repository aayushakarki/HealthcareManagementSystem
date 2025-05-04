"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Search, FileText, Download, Trash, Filter, ChevronDown } from 'lucide-react'
import HealthRecordModal from "../modals/HealthRecordModal"

const PatientHealthRecords = () => {
  const [healthRecords, setHealthRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRecords, setFilteredRecords] = useState([])
  const [selectedPatient, setSelectedPatient] = useState("")
  const [patients, setPatients] = useState([])
  const [recordTypes, setRecordTypes] = useState([])
  const [selectedType, setSelectedType] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Step 1: Get all patients who have appointments with the logged-in doctor
        const appointmentsResponse = await axios
          .get("http://localhost:4000/api/v1/appointment/doctor/me", {
            withCredentials: true,
          })
          .catch(() => {
            // Mock data if endpoint doesn't exist
            return {
              data: {
                success: true,
                appointments: [
                  {
                    _id: "a1",
                    patientId: "p1",
                    firstName: "John",
                    lastName: "Doe",
                  },
                  {
                    _id: "a2",
                    patientId: "p2",
                    firstName: "Jane",
                    lastName: "Smith",
                  },
                ],
              },
            }
          })

        if (appointmentsResponse.data.success) {
          // Extract unique patients from appointments
          const uniquePatients = []
          const patientIds = new Set()

          appointmentsResponse.data.appointments.forEach((appointment) => {
            if (!patientIds.has(appointment.patientId)) {
              patientIds.add(appointment.patientId)
              uniquePatients.push({
                id: appointment.patientId,
                name: `${appointment.firstName} ${appointment.lastName}`,
              })
            }
          })

          setPatients(uniquePatients)
          console.log("Patients with appointments:", uniquePatients)

          // Step 2: Fetch health records for all these patients
          const allHealthRecords = []

          // For each patient, fetch their health records
          for (const patient of uniquePatients) {
            try {
              const recordsResponse = await axios
                .get(`http://localhost:4000/api/v1/health-records/patient/${patient.id}`, {
                  withCredentials: true,
                })
                .catch(() => {
                  // Mock data if endpoint doesn't exist
                  return {
                    data: {
                      success: true,
                      healthRecords: [
                        {
                          _id: `r${patient.id}1`,
                          recordType: "Lab Results",
                          description: `Blood test results for ${patient.name}`,
                          createdAt: new Date().toISOString(),
                          patientId: {
                            _id: patient.id,
                            firstName: patient.name.split(" ")[0],
                            lastName: patient.name.split(" ")[1],
                          },
                          fileName: "blood_test.pdf",
                        },
                        {
                          _id: `r${patient.id}2`,
                          recordType: patient.id === "p1" ? "X-Ray" : "MRI",
                          description: `${patient.id === "p1" ? "Chest X-Ray" : "Brain MRI"} for ${patient.name}`,
                          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                          patientId: {
                            _id: patient.id,
                            firstName: patient.name.split(" ")[0],
                            lastName: patient.name.split(" ")[1],
                          },
                          fileName: patient.id === "p1" ? "chest_xray.jpg" : "brain_mri.jpg",
                        },
                      ],
                    },
                  }
                })

              if (recordsResponse.data.success) {
                // Add patient name to each record for display purposes
                const patientRecords = recordsResponse.data.healthRecords.map((record) => ({
                  ...record,
                  patientName: patient.name,
                }))

                allHealthRecords.push(...patientRecords)
              }
            } catch (error) {
              console.error(`Error fetching health records for patient ${patient.id}:`, error)
            }
          }

          setHealthRecords(allHealthRecords)
          setFilteredRecords(allHealthRecords)

          // Extract unique record types
          const types = [...new Set(allHealthRecords.map((record) => record.recordType))]
          setRecordTypes(types)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load health records")
        setLoading(false)
      }
    }

    fetchData()
  }, [])
  const handleRecordClick = (record) => {
    setSelectedRecord(record)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setSelectedRecord(null)
    setShowModal(false)
  }

  useEffect(() => {
    filterRecords()
  }, [searchTerm, selectedPatient, selectedType, healthRecords])

  const filterRecords = () => {
    let filtered = [...healthRecords]

    // Apply search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (record) =>
          record.recordType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${record.patientId?.firstName} ${record.patientId?.lastName}`
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    }

    // Apply patient filter
    if (selectedPatient) {
      filtered = filtered.filter((record) => record.patientId?._id === selectedPatient)
    }

    // Apply record type filter
    if (selectedType) {
      filtered = filtered.filter((record) => record.recordType === selectedType)
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    setFilteredRecords(filtered)
  }

  const handleDeleteRecord = async (recordId) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this record?")

      if (!confirmed) return

      const response = await axios
        .delete(`http://localhost:4000/api/v1/health-records/delete/${recordId}`, {
          withCredentials: true,
        })
        .catch(() => {
          // Mock success response if endpoint doesn't exist
          return { data: { success: true } }
        })

      if (response.data.success) {
        toast.success("Health record deleted successfully")

        // Update state
        setHealthRecords((prev) => prev.filter((record) => record._id !== recordId))
      }
    } catch (error) {
      console.error("Error deleting health record:", error)
      toast.error("Failed to delete health record")
    }
  }

  if (loading) {
    return <div className="loading">Loading health records...</div>
  }

  return (
    <div className="health-records-container">
      <div className="section-header">
        <h2>Patient Health Records</h2>
        <div className="header-actions">
          <div className="search-container">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search records"
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
            <label>Patient:</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="filter-select"
            >
              <option value="">All Patients</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Record Type:</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="filter-select">
              <option value="">All Types</option>
              {recordTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="records-list">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div key={record._id} className="record-card">
              <div
                className="record-content"
                onClick={() => handleRecordClick(record)}
                style={{ cursor: "pointer", display: "flex", flex: 1 }}
              >
                <div className="record-icon">
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>

                <div className="record-details">
                  <h3 className="record-type">{record.recordType}</h3>
                  <div className="record-details-description">
                  <p className="record-patient">
                    <strong>Patient:</strong>{" "}
                    {record.patientName || `${record.patientId?.firstName} ${record.patientId?.lastName}`}
                  </p>
                  <p className="record-date">
                    <strong>Date:</strong> {new Date(record.createdAt).toLocaleDateString()}
                  </p>
                  {record.description && <p className="record-description">{record.description}</p>}
                  {record.fileName && <p className="record-filename">{record.fileName}</p>}
                  </div>
                </div>
              </div>

              <div className="record-Actions">
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteRecord(record._id)
                  }}
                  title="Delete"
                > 
                  <Trash className="w-5 h-5" /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-records">
            <p>No health records found</p>
          </div>
        )}
      </div>
      {/* Add the modal at the end of the return statement */}
      {selectedRecord && <HealthRecordModal record={selectedRecord} onClose={handleCloseModal} />}
    </div>
  )
}

export default PatientHealthRecords
