"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import VitalsChat from "./VitalsChat"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const PatientVitals = () => {
  const [vitals, setVitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showVitalsChat, setShowVitalsChat] = useState(false)

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/v1/vitals/history", {
          withCredentials: true,
        })

        if (response.data.success) {
          setVitals(response.data.vitals)
        }
      } catch (error) {
        console.error("Error fetching vitals:", error)
        toast.error("Failed to load vitals history")
      } finally {
        setLoading(false)
      }
    }

    fetchVitals()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  useEffect(() => {
    if (showVitalsChat) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => document.body.classList.remove('modal-open')
  }, [showVitalsChat])

  const chartData = {
    labels: vitals.map((v) => formatDate(v.date)),
    datasets: [
      {
        label: "Blood Pressure (Systolic)",
        data: vitals.map((v) => v.bloodPressure.systolic),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        yAxisID: "y",
      },
      {
        label: "Blood Pressure (Diastolic)",
        data: vitals.map((v) => v.bloodPressure.diastolic),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        yAxisID: "y",
      },
      {
        label: "Heart Rate",
        data: vitals.map((v) => v.heartRate),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        yAxisID: "y1",
      },
      {
        label: "Cholesterol",
        data: vitals.map((v) => v.cholesterol),
        borderColor: "rgb(255, 205, 86)",
        backgroundColor: "rgba(255, 205, 86, 0.5)",
        yAxisID: "y2",
      },
      {
        label: "HDL Cholesterol",
        data: vitals.map((v) => v.hdlCholesterol),
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        yAxisID: "y3",
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Blood Pressure (mmHg)",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Heart Rate (bpm)",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y2: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Cholesterol (mg/dL)",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y3: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "HDL Cholesterol (mg/dL)",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  const handleOpenVitalsChat = () => setShowVitalsChat(true)
  const handleCloseVitalsChat = () => setShowVitalsChat(false)

  if (loading) {
    return <div className="loading">Loading vitals...</div>
  }

  return (
    <div className="vitals-container">
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Vitals History</h2>
        <button className="summarize-btn" onClick={handleOpenVitalsChat}>
          Summarize
        </button>
      </div>

      <div className="vitals-chart">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="vitals-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Blood Pressure</th>
              <th>Heart Rate</th>
              <th>Cholesterol</th>
              <th>HDL Cholesterol</th>
              <th>Respiratory Rate</th>
              <th>Weight</th>
              <th>Height</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {vitals.map((vital) => (
              <tr key={vital._id}>
                <td>{formatDate(vital.date)}</td>
                <td>
                  {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic} mmHg
                </td>
                <td>{vital.heartRate} bpm</td>
                <td>{vital.cholesterol ? `${vital.cholesterol} mg/dL` : "-"}</td>
                <td>{vital.hdlCholesterol ? `${vital.hdlCholesterol} mg/dL` : "-"}</td>
                <td>{vital.respiratoryRate || "-"}</td>
                <td>{vital.weight ? `${vital.weight} kg` : "-"}</td>
                <td>{vital.height ? `${vital.height} cm` : "-"}</td>
                <td>{vital.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <VitalsChat show={showVitalsChat} onClose={handleCloseVitalsChat} />
    </div>
  )
}

export default PatientVitals 