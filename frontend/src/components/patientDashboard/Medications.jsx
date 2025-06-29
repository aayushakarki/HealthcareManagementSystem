"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Pill, RefreshCw, Clock, Trash2, Download } from "lucide-react"
import { toast } from "react-toastify"

const Medications = () => {
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true)

        // Fetch all prescriptions from the backend (not just active ones)
        const response = await axios.get("http://localhost:4000/api/v1/prescriptions/me", {
          withCredentials: true,
        })

        console.log("API Response:", response.data)

        if (response.data.success) {
          // Transform backend data to match frontend structure
          const formattedMedications = response.data.prescriptions.map((prescription) => {
            const currentDate = new Date()
            const endDate = new Date(prescription.endDate)
            // Determine if the medication is active or completed based on end date
            const status = endDate > currentDate ? "active" : "completed"

            return {
              id: prescription._id,
              name: prescription.medicationName,
              dosage: prescription.dosage,
              frequency: prescription.frequency,
              refillDate: calculateRefillDate(prescription.startDate, prescription.endDate),
              prescribedBy: prescription.prescribedBy
                ? `Dr. ${prescription.prescribedBy.firstName} ${prescription.prescribedBy.lastName}`
                : "Your Doctor",
              startDate: prescription.startDate,
              endDate: prescription.endDate,
              instructions: prescription.instructions,
              status: status,
              refillsRemaining: calculateRefillsRemaining(prescription.startDate, prescription.endDate),
              notes: prescription.notes,
            }
          })

          console.log("Formatted Medications:", formattedMedications)
          setMedications(formattedMedications)
        } else {
          // If no prescriptions found, use empty array
          setMedications([])
          console.log("No prescriptions found in response")
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching medications:", error)

        // Fallback to empty array if API fails
        setMedications([])
        setLoading(false)
      }
    }

    fetchMedications()
  }, [])

  // Helper function to calculate refill date based on prescription duration
  const calculateRefillDate = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const currentDate = new Date()

    // If prescription has ended, no refill needed
    if (end < currentDate) {
      return null
    }

    const durationDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    // Assuming refills happen monthly (30 days)
    const refillIntervalDays = 30

    // Calculate days since start
    const daysSinceStart = Math.round((currentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    // Calculate next refill date
    const nextRefillDay = Math.ceil(daysSinceStart / refillIntervalDays) * refillIntervalDays
    const nextRefillDate = new Date(start)
    nextRefillDate.setDate(start.getDate() + nextRefillDay)

    // If next refill date is after end date, no more refills
    if (nextRefillDate > end) {
      return null
    }

    return nextRefillDate.toISOString().split("T")[0]
  }

  // Helper function to calculate refills remaining based on duration
  const calculateRefillsRemaining = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const currentDate = new Date()

    // If prescription has ended, no refills remaining
    if (end < currentDate) {
      return 0
    }

    const durationDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const daysSinceStart = Math.round((currentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = durationDays - daysSinceStart

    // Roughly 1 refill per month (30 days)
    return Math.max(0, Math.ceil(daysRemaining / 30))
  }

  const activeMedications = medications.filter((med) => med.status === "active")
  const completedMedications = medications.filter((med) => med.status === "completed")

  const handleDeletePrescription = async (prescriptionId) => {
    try {
      const response = await axios.delete(`http://localhost:4000/api/v1/prescriptions/delete/${prescriptionId}`, {
        withCredentials: true,
      })

      if (response.data.success) {
        toast.success("Prescription deleted successfully")
        // Remove the deleted prescription from the state
        setMedications(medications.filter((med) => med.id !== prescriptionId))
      }
    } catch (error) {
      console.error("Error deleting prescription:", error)
      toast.error(error.response?.data?.message || "Failed to delete prescription")
    }
  }

  const isPrescriptionExpired = (endDate) => {
    const currentDate = new Date()
    return new Date(endDate) < currentDate
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleRequestPrescriptionPDF = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/v1/prescriptions/pdf", {
        withCredentials: true,
        responseType: "blob", // Important for handling PDF file
      })

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]))

      // Create a link element and trigger download
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "MediCure-Prescriptions.pdf")
      document.body.appendChild(link)
      link.click()

      // Clean up
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Prescription PDF downloaded successfully!")
    } catch (error) {
      console.error("Error downloading prescription PDF:", error)
      toast.error("Failed to download prescription PDF")
    }
  }

  if (loading) {
    return <div className="loading">Loading medications...</div>
  }

  return (
    <div className="new-medications-container">
      <div className="new-medications-header">
        <h2 className="medications-title">Your Medications</h2>
        <button onClick={handleRequestPrescriptionPDF} className="new-request-prescription-btn">
          <Download className="w-4 h-4" />
          Request Prescription PDF
        </button>
      </div>

      <div className="new-medication-sections">
        {/* Current Medications Section */}
        <div className="new-medication-section">
          <h3 className="section-heading">Current Medications</h3>

          {activeMedications.length > 0 ? (
            <div className="new-medications-list">
              {activeMedications.map((medication) => (
                <div key={medication.id} className="new-medication-card">
                  <div className="medication-header">
                    <div className="medication-icon-wrapper">
                      <Pill className="medication-icon" />
                    </div>
                    <div className="medication-main-info">
                      <h4 className="medication-name">{medication.name}</h4>
                      <div className="medication-details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Dosage:</span>
                          <span className="detail-value">{medication.dosage}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Frequency:</span>
                          <span className="detail-value">{medication.frequency}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Prescribed by:</span>
                          <span className="detail-value">{medication.prescribedBy}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Instructions:</span>
                          <span className="detail-value">{medication.instructions}</span>
                        </div>
                      </div>

                      <div className="medication-timeline">
                        <div className="timeline-item">
                          <Clock className="medication-timeline-icon" />
                          <span className="medication-dates">Started: {formatDate(medication.startDate)}</span>
                        </div>
                        <div className="timeline-item">
                          <Clock className="medication-timeline-icon" />
                          <span className="medication-dates">Ends: {formatDate(medication.endDate)}</span>
                        </div>
                      </div>
                        {medication.refillDate && (
                        <div className="refill-info">
                          <RefreshCw className="refill-icon" />
                          <span>Next refill: {formatDate(medication.refillDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-medications-message">No active medications</p>
          )}
        </div>

        {/* Completed Medications Section */}
        <div className="new-medication-section">
          <h3 className="section-heading">Completed Medications</h3>

          {completedMedications.length > 0 ? (
            <div className="new-medications-list">
              {completedMedications.map((medication) => (
                <div key={medication.id} className="new-medication-card completed">
                  <div className="medication-header">
                    <div className="medication-icon-wrapper">
                      <Pill className="medication-icon" />
                    </div>
                    <div className="medication-main-info">
                      <h4 className="medication-name">{medication.name}</h4>
                      <div className="medication-details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Dosage:</span>
                          <span className="detail-value">{medication.dosage}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Frequency:</span>
                          <span className="detail-value">{medication.frequency}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Prescribed by:</span>
                          <span className="detail-value">{medication.prescribedBy}</span>
                        </div>
                      </div>

                      <div className="medication-timeline">
                        <div className="timeline-item">
                          <Clock className="medication-timeline-icon w-6 h-6" />
                          <span className="medication-dates">Started: {formatDate(medication.startDate)}</span>
                        </div>
                        <div className="timeline-item">
                          <Clock className="medication-timeline-icon" />
                          <span className="medication-dates">Ended: {formatDate(medication.endDate)}</span>
                        </div>
                      </div>
                    </div>

                    {isPrescriptionExpired(medication.endDate) && (
                      <button
                        className="delete-prescription-btn"
                        onClick={() => handleDeletePrescription(medication.id)}
                        title="Delete prescription"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-medications-message">No completed medications</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Medications
