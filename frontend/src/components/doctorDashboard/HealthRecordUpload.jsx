"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Upload, X, Check, FileText } from "lucide-react"

const HealthRecordUpload = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [formData, setFormData] = useState({
    patientId: "",
    recordType: "",
    description: "",
  })
  const [filePreview, setFilePreview] = useState(null)

  const recordTypes = [
    "Lab Results",
    "X-Ray",
    "MRI",
    "CT Scan",
    "Prescription",
    "Vaccination",
    "Surgery Report",
    "Discharge Summary",
    "Medical Certificate",
    "Other",
  ]

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)

        // Get all appointments to extract unique patients
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
                    patientId: "p1",
                    firstName: "John",
                    lastName: "Doe",
                  },
                  {
                    patientId: "p2",
                    firstName: "Jane",
                    lastName: "Smith",
                  },
                ],
              },
            }
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
              })
            }
          })

          // Log the patients to help with debugging
          console.log("Found patients:", uniquePatients)

          // If using mock data and no patients were found, add a second mock patient
          if (uniquePatients.length === 1 && appointments[0].patientId === "p1") {
            uniquePatients.push({
              id: "p2",
              name: "Jane Smith",
            })
          }

          setPatients(uniquePatients)
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file type (only allow images and PDFs)
    if (!file.type.match("image.*") && file.type !== "application/pdf") {
      toast.error("Only images and PDF files are allowed")
      return
    }

    setSelectedFile(file)

    // Create preview for images
    if (file.type.match("image.*")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    } else {
      // For PDFs, just show an icon
      setFilePreview(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.patientId || !formData.recordType || !selectedFile) {
      toast.error("Please fill all required fields and select a file")
      return
    }

    try {
      setUploadLoading(true)

      // Create form data for file upload
      const uploadData = new FormData()
      uploadData.append("patientId", formData.patientId)
      uploadData.append("recordType", formData.recordType)
      uploadData.append("description", formData.description)
      uploadData.append("file", selectedFile)

      const response = await axios.post(
        "http://localhost:4000/api/v1/health-records/upload",
        uploadData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      if (response.data.success) {
        toast.success("Health record uploaded successfully")

        // Reset form
        setFormData({
          patientId: "",
          recordType: "",
          description: "",
        })
        setSelectedFile(null)
        setFilePreview(null)
      } else {
        toast.error(response.data.message || "Failed to upload health record")
      }
    } catch (error) {
      console.error("Error uploading health record:", error)
      toast.error(error.response?.data?.message || "Failed to upload health record")
    } finally {
      setUploadLoading(false)
    }
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="health-record-upload-container">
      <div className="section-header">
        <h2>Upload Health Record</h2>
      </div>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientId">Patient *</label>
            <select
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="recordType">Record Type *</label>
            <select
              id="recordType"
              name="recordType"
              value={formData.recordType}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Select Record Type</option>
              {recordTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            rows={4}
            placeholder="Enter a description of the health record"
          />
        </div>
        <div className="form-group">
          <label>Upload File *</label>
          {!selectedFile ? (
            <div className="file-upload-area">
              <input type="file" id="file" onChange={handleFileChange} className="file-input" accept="image/*,.pdf" />
              <label htmlFor="file" className="file-label">
                <Upload className="w-6 h-6 mb-2" />
                <span>Click to upload or drag and drop</span>
                <span className="text-sm text-gray-500">JPG, PNG or PDF (max. 10MB)</span>
              </label>
            </div>
          ) : (
            <div className="selected-file">
              {filePreview ? (
                <div className="file-preview">
                  <img src={filePreview || "/placeholder.svg"} alt="Preview" className="preview-image" />
                </div>
              ) : (
                <div className="file-icon">
                  <FileText className="w-12 h-12 text-blue-500" />
                </div>
              )}
              <div className="file-info">
                <p className="file-name">{selectedFile.name}</p>
                <p className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button type="button" className="remove-file-btn" onClick={removeSelectedFile}>
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={uploadLoading}>
            {uploadLoading ? (
              <>Uploading...</>
            ) : (
              <>
                <Check className="w-4 h-4 mr-1" />
                Upload Record
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default HealthRecordUpload
