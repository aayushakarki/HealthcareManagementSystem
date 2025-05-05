"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Activity, Heart, Thermometer, Weight, Ruler, ClipboardList } from "lucide-react"

const AddVitals = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPatients, setFilteredPatients] = useState([])
  const [formData, setFormData] = useState({
    patientId: "",
    bloodPressure: {
      systolic: "",
      diastolic: "",
    },
    heartRate: "",
    temperature: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    notes: "",
  })

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        const appointmentsResponse = await axios.get("http://localhost:4000/api/v1/appointment/doctor/me", {
          withCredentials: true,
        })

        if (appointmentsResponse.data.success) {
          const appointments = appointmentsResponse.data.appointments
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
      const searchPatients = async () => {
        try {
          const response = await axios.get(`http://localhost:4000/api/v1/search/patients?query=${searchTerm}`, {
            withCredentials: true,
          })

          if (response.data.success) {
            const patientIds = new Set(patients.map((p) => p.id))
            const filteredResults = response.data.patients.filter((p) => patientIds.has(p._id))
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
          const filtered = patients.filter((patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
          setFilteredPatients(filtered)
        }
      }

      searchPatients()
    }
  }, [searchTerm, patients])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.patientId || !formData.bloodPressure.systolic || !formData.bloodPressure.diastolic || !formData.heartRate || !formData.temperature) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      setSubmitLoading(true)

      const response = await axios.post("http://localhost:4000/api/v1/vitals/add", formData, {
        withCredentials: true,
      })

      if (response.data.success) {
        const selectedPatient = patients.find((patient) => patient.id === formData.patientId)
        toast.success(`Vitals recorded successfully for ${selectedPatient.firstName} ${selectedPatient.lastName}`)

        // Reset form
        setFormData({
          patientId: "",
          bloodPressure: {
            systolic: "",
            diastolic: "",
          },
          heartRate: "",
          temperature: "",
          respiratoryRate: "",
          oxygenSaturation: "",
          weight: "",
          height: "",
          notes: "",
        })
      }

      setSubmitLoading(false)
    } catch (error) {
      console.error("Error adding vitals:", error)
      toast.error(error.response?.data?.message || "Failed to record vitals")
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="vitals-container">
      <div className="section-header">
        <h2>Add Patient Vitals</h2>
      </div>

      <form onSubmit={handleSubmit} className="vitals-form">
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
            <label htmlFor="bloodPressure.systolic">Blood Pressure (Systolic) *</label>
            <div className="input-with-icon">
              <Activity className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                id="bloodPressure.systolic"
                name="bloodPressure.systolic"
                value={formData.bloodPressure.systolic}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="e.g., 120"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bloodPressure.diastolic">Blood Pressure (Diastolic) *</label>
            <div className="input-with-icon">
              <Activity className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                id="bloodPressure.diastolic"
                name="bloodPressure.diastolic"
                value={formData.bloodPressure.diastolic}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="e.g., 80"
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="heartRate">Heart Rate *</label>
            <div className="input-with-icon">
              <Heart className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                id="heartRate"
                name="heartRate"
                value={formData.heartRate}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="e.g., 72"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="temperature">Temperature *</label>
            <div className="input-with-icon">
              <Thermometer className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                id="temperature"
                name="temperature"
                value={formData.temperature}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="e.g., 98.6"
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="respiratoryRate">Respiratory Rate</label>
            <div className="input-with-icon">
              <Activity className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                id="respiratoryRate"
                name="respiratoryRate"
                value={formData.respiratoryRate}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 16"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="oxygenSaturation">Oxygen Saturation</label>
            <div className="input-with-icon">
              <Activity className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                id="oxygenSaturation"
                name="oxygenSaturation"
                value={formData.oxygenSaturation}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 98"
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <div className="input-with-icon">
              <Weight className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 70"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="height">Height (cm)</label>
            <div className="input-with-icon">
              <Ruler className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 170"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <div className="input-with-icon">
            <ClipboardList className="w-4 h-4 text-gray-400" />
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="form-textarea"
              rows={3}
              placeholder="Additional notes about the patient's condition"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitLoading}>
            {submitLoading ? (
              <>Recording Vitals...</>
            ) : (
              <>
                <Activity className="w-4 h-4 mr-1" />
                Record Vitals
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddVitals 