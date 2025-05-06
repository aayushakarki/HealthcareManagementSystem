"use client"

import { useState, useEffect } from "react"
import { FileText, Eye } from 'lucide-react'
import axios from "axios"
import { toast } from "react-toastify"
import HealthRecordModal from "../modals/HealthRecordModal"

const HealthRecords = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchHealthRecords = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:4000/api/v1/health-records/me", {
          withCredentials: true,
        })

        if (response.data.success) {
          setRecords(response.data.healthRecords)
        } else {
          setRecords([])
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching health records:", error)
        toast.error("Failed to load health records")
        setLoading(false)
      }
    }

    fetchHealthRecords()
  }, [])

  // Get unique record types from records
  const uniqueCategories = [...new Set(records.map((record) => record.recordType))]

  // Filter records based on selected category
  const filteredRecords =
    activeCategory === "all" ? records : records.filter((record) => record.recordType === activeCategory)

  const categories = [
    { id: "all", name: "All Records" },
    ...uniqueCategories.map((category) => ({
      id: category,
      name: category,
    })),
  ]

  const handleViewRecord = (record) => {
    setSelectedRecord(record)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedRecord(null)
  }

  if (loading) {
    return <div className="loading">Loading health records...</div>
  }

  return (
    <div className="health-records-container">
      <div className="records-header">
        <h2>Health Records</h2>
      </div>

      <div className="categories-tabs">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? "active" : ""}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="records-grid">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div key={record._id} className="record-card" onClick={() => handleViewRecord(record)}>
              <div className="record-icon">
                <FileText className="w-8 h-8" />
              </div>
              <div className="record-details">
                <h3>{record.recordType}</h3>
                <p className="record-description">{record.description}</p>
                <p className="record-date">Date: {new Date(record.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="record-actions overflow-hidden">
                <button className="action-btn view-btn">
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-records">
            <p>No health records found in this category</p>
          </div>
        )}
      </div>

      {/* Render the HealthRecordModal component when showModal is true */}
      {showModal && <HealthRecordModal record={selectedRecord} onClose={closeModal} />}
    </div>
  )
}

export default HealthRecords
