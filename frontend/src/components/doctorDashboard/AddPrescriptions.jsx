"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Calendar, Pill } from "lucide-react"

const AddPrescriptions = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPatients, setFilteredPatients] = useState([])
  const [formData, setFormData] = useState({
    patientId: "",
    medicationName: "",
    dosage: "",
    frequency: "",
    instructions: "Take with food",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
  })

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
                name: `${appointment.firstName} ${appointment.lastName}`,
                firstName: appointment.firstName,
                lastName: appointment.lastName,
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
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients)
    } else {
      // Use the backend search endpoint
      const searchPatients = async () => {
        try {
          const response = await axios.get(`http://localhost:4000/api/v1/search/patients?query=${searchTerm}`, {
            withCredentials: true,
          })

          if (response.data.success) {
            // Filter to only include patients that are in our appointments
            const patientIds = new Set(patients.map((p) => p.id))
            const filteredResults = response.data.patients.filter((p) => patientIds.has(p._id))

            // Format the results to match our expected structure
            const formattedResults = filteredResults.map((p) => ({
              id: p._id,
              name: `${p.firstName} ${p.lastName}`,
              firstName: p.firstName,
              lastName: p.lastName,
            }))

            setFilteredPatients(formattedResults)
          }
        } catch (error) {
          console.error("Error searching patients:", error)
          // Fallback to client-side filtering if the API fails
          const filtered = patients.filter((patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
          setFilteredPatients(filtered)
        }
      }

      searchPatients()
    }
  }, [searchTerm, patients])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const calculateEndDate = () => {
    if (!formData.startDate) return ""

    // Default to 30 days from start date if not set
    const startDate = new Date(formData.startDate)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 30)
    return endDate.toISOString().split("T")[0]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !formData.patientId ||
      !formData.medicationName ||
      !formData.dosage ||
      !formData.frequency ||
      !formData.startDate
    ) {
      toast.error("Please fill all required fields")
      return
    }

    // If end date is not provided, calculate it
    const endDate = formData.endDate || calculateEndDate()

    try {
      setSubmitLoading(true)

      const prescriptionData = {
        ...formData,
        endDate,
      }

      const response = await axios.post("http://localhost:4000/api/v1/prescriptions/add", prescriptionData, {
        withCredentials: true,
      })

      if (response.data.success) {
        const selectedPatient = patients.find((patient) => patient.id === formData.patientId)
        toast.success(`New prescription has been added for ${selectedPatient.firstName} ${selectedPatient.lastName}`)

        // Reset form
        setFormData({
          patientId: "",
          medicationName: "",
          dosage: "",
          frequency: "",
          instructions: "Take with food",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          notes: "",
        })
      }

      setSubmitLoading(false)
    } catch (error) {
      console.error("Error adding prescription:", error)
      toast.error(error.response?.data?.message || "Failed to add prescription")
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="prescription-upload-container">
      <div className="section-header">
        <h2>Add New Prescription</h2>
      </div>
      <form onSubmit={handleSubmit} className="prescription-form">
        <div className="form-group">
          <label htmlFor="patientId">Patient *</label>
          <div className="search-select-container">
            <select
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Select Patient</option>
              {filteredPatients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="medicationName">Medication Name *</label>
            <input
              type="text"
              id="medicationName"
              name="medicationName"
              value={formData.medicationName}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="e.g., Amoxicillin"
            />
          </div>
          <div className="form-group">
            <label htmlFor="dosage">Dosage *</label>
            <input
              type="text"
              id="dosage"
              name="dosage"
              value={formData.dosage}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="e.g., 500mg"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="frequency">Frequency *</label>
            <input
              type="text"
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="e.g., 3 times daily"
            />
          </div>
          <div className="form-group">
            <label htmlFor="instructions">Instructions</label>
            <input
              type="text"
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Take with food"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="form-textarea"
            rows={3}
            placeholder="Any additional information about this prescription"
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitLoading}>
            {submitLoading ? (
              <>Adding Prescription...</>
            ) : (
              <>
                <Pill className="w-4 h-4 mr-1" />
                Add Prescription
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddPrescriptions
