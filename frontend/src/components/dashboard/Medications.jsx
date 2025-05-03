"use client"

import { useState, useEffect } from "react"
import { Pill, RefreshCw, AlertCircle, Clock } from "lucide-react"
import { toast } from "react-toastify"

const Medications = () => {
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true)
        // Since there's no specific medications API in the provided backend,
        // we'll use mock data for now
        // In a real implementation, you would replace this with an actual API call

        const mockMedications = [
          {
            id: 1,
            name: "Amoxicillin",
            dosage: "500mg",
            frequency: "3 times daily",
            refillDate: "2025-05-01",
            prescribedBy: "Dr. Johnson",
            startDate: "2025-04-15",
            endDate: "2025-05-15",
            instructions: "Take with food",
            status: "active",
            refillsRemaining: 2,
          },
          {
            id: 2,
            name: "Lisinopril",
            dosage: "10mg",
            frequency: "Once daily",
            refillDate: "2025-05-15",
            prescribedBy: "Dr. Williams",
            startDate: "2025-03-01",
            endDate: "2025-09-01",
            instructions: "Take in the morning",
            status: "active",
            refillsRemaining: 3,
          },
          {
            id: 3,
            name: "Ibuprofen",
            dosage: "200mg",
            frequency: "As needed",
            refillDate: "2025-04-25",
            prescribedBy: "Dr. Smith",
            startDate: "2025-04-10",
            endDate: "2025-04-24",
            instructions: "Take for pain, not more than 3 times daily",
            status: "completed",
            refillsRemaining: 0,
          },
          {
            id: 4,
            name: "Atorvastatin",
            dosage: "20mg",
            frequency: "Once daily",
            refillDate: "2025-06-10",
            prescribedBy: "Dr. Johnson",
            startDate: "2025-03-10",
            endDate: "2025-09-10",
            instructions: "Take at bedtime",
            status: "active",
            refillsRemaining: 5,
          },
        ]

        setMedications(mockMedications)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching medications:", error)
        setLoading(false)
      }
    }

    fetchMedications()
  }, [])

  const activeMedications = medications.filter((med) => med.status === "active")
  const completedMedications = medications.filter((med) => med.status === "completed")

  const handleRefillRequest = (medicationId) => {
    // Implement refill request logic here
    toast.success(`Refill request sent for medication #${medicationId}`)
    // You would typically make an API call here
  }

  if (loading) {
    return <div className="loading">Loading medications...</div>
  }

  return (
    <div className="medications-container">
      <div className="medications-header">
        <h2>Your Medications</h2>
      </div>

      <div className="medication-sections">
        <div className="active-medications">
          <h3>Current Medications</h3>

          {activeMedications.length > 0 ? (
            <div className="medications-list">
              {activeMedications.map((medication) => (
                <div key={medication.id} className="medication-card">
                  <div className="medication-icon">
                    <Pill className="w-8 h-8" />
                  </div>
                  <div className="medication-details">
                    <h4>{medication.name}</h4>
                    <div className="medication-info">
                      <p>
                        <strong>Dosage:</strong> {medication.dosage}
                      </p>
                      <p>
                        <strong>Frequency:</strong> {medication.frequency}
                      </p>
                      <p>
                        <strong>Prescribed by:</strong> {medication.prescribedBy}
                      </p>
                      <p>
                        <strong>Instructions:</strong> {medication.instructions}
                      </p>
                    </div>
                    <div className="medication-dates">
                      <div className="date-item">
                        <Clock className="w-4 h-4" />
                        <span>Started: {new Date(medication.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="date-item">
                        <Clock className="w-4 h-4" />
                        <span>Ends: {new Date(medication.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="medication-refill">
                    <div className="refill-info">
                      <p>Next refill: {new Date(medication.refillDate).toLocaleDateString()}</p>
                      <p>Refills remaining: {medication.refillsRemaining}</p>
                    </div>

                    {medication.refillsRemaining > 0 && (
                      <button className="refill-btn" onClick={() => handleRefillRequest(medication.id)}>
                        <RefreshCw className="w-4 h-4" />
                        <span>Request Refill</span>
                      </button>
                    )}

                    {medication.refillsRemaining === 0 && (
                      <div className="no-refills">
                        <AlertCircle className="w-4 h-4" />
                        <span>No refills left</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-medications">No active medications</p>
          )}
        </div>

        <div className="completed-medications">
          <h3>Completed Medications</h3>

          {completedMedications.length > 0 ? (
            <div className="medications-list">
              {completedMedications.map((medication) => (
                <div key={medication.id} className="medication-card completed">
                  <div className="medication-icon">
                    <Pill className="w-8 h-8" />
                  </div>
                  <div className="medication-details">
                    <h4>{medication.name}</h4>
                    <div className="medication-info">
                      <p>
                        <strong>Dosage:</strong> {medication.dosage}
                      </p>
                      <p>
                        <strong>Frequency:</strong> {medication.frequency}
                      </p>
                      <p>
                        <strong>Prescribed by:</strong> {medication.prescribedBy}
                      </p>
                    </div>
                    <div className="medication-dates">
                      <div className="date-item">
                        <Clock className="w-4 h-4" />
                        <span>Started: {new Date(medication.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="date-item">
                        <Clock className="w-4 h-4" />
                        <span>Ended: {new Date(medication.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-medications">No completed medications</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Medications
