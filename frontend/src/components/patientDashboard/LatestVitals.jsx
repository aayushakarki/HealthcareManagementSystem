"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Activity, Heart, Thermometer, Weight, Ruler, ClipboardList } from "lucide-react"

const LatestVitals = () => {
  const [latestVitals, setLatestVitals] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestVitals = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/v1/vitals/history", {
          withCredentials: true,
        })

        if (response.data.success && response.data.vitals.length > 0) {
          // Get the most recent vitals
          const latest = response.data.vitals[0]
          setLatestVitals(latest)
        }
      } catch (error) {
        console.error("Error fetching latest vitals:", error)
        toast.error("Failed to load latest vitals")
      } finally {
        setLoading(false)
      }
    }

    fetchLatestVitals()
  }, [])

  if (loading) {
    return <div className="loading">Loading vitals...</div>
  }

  if (!latestVitals) {
    return <div className="no-vitals">No vitals recorded yet</div>
  }

  return (
    <div className="latest-vitals">
      <div className="vitals-grid">
        <div className="vital-card">
          <div className="vital-icon">
            <Activity className="w-6 h-6" />
          </div>
          <div className="vital-info">
            <h3>Blood Pressure</h3>
            <p>
              {latestVitals.bloodPressure.systolic}/{latestVitals.bloodPressure.diastolic} mmHg
            </p>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon">
            <Heart className="w-6 h-6" />
          </div>
          <div className="vital-info">
            <h3>Heart Rate</h3>
            <p>{latestVitals.heartRate} bpm</p>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon">
            <Thermometer className="w-6 h-6" />
          </div>
          <div className="vital-info">
            <h3>Temperature</h3>
            <p>{latestVitals.temperature}°F</p>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon">
            <Activity className="w-6 h-6" />
          </div>
          <div className="vital-info">
            <h3>Respiratory Rate</h3>
            <p>{latestVitals.respiratoryRate || "-"} /min</p>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon">
            <Activity className="w-6 h-6" />
          </div>
          <div className="vital-info">
            <h3>Oxygen Saturation</h3>
            <p>{latestVitals.oxygenSaturation ? `${latestVitals.oxygenSaturation}%` : "-"}</p>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon">
            <Weight className="w-6 h-6" />
          </div>
          <div className="vital-info">
            <h3>Weight</h3>
            <p>{latestVitals.weight ? `${latestVitals.weight} kg` : "-"}</p>
          </div>
        </div>

        <div className="vital-card">
          <div className="vital-icon">
            <Ruler className="w-6 h-6" />
          </div>
          <div className="vital-info">
            <h3>Height</h3>
            <p>{latestVitals.height ? `${latestVitals.height} cm` : "-"}</p>
          </div>
        </div>

        {latestVitals.notes && (
          <div className="vital-card notes">
            <div className="vital-icon">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div className="vital-info">
              <h3>Notes</h3>
              <p>{latestVitals.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LatestVitals 