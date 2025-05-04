"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { UserPlus, Upload, X } from 'lucide-react'

const AddDoctor = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    password: "",
    doctorDepartment: "",
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const departments = [
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Obstetrics",
    "Oncology",
    "Ophthalmology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Urology",
    "General Medicine",
  ]

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

    // Check file type (only allow images)
    if (!file.type.match("image.*")) {
      toast.error("Only image files are allowed")
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setFilePreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.dob ||
      !formData.gender ||
      !formData.password ||
      !formData.doctorDepartment ||
      !selectedFile
    ) {
      toast.error("Please fill all required fields and upload a profile picture")
      return
    }

    try {
      setLoading(true)

      // Create form data for file upload
      const uploadData = new FormData()
      Object.keys(formData).forEach((key) => {
        uploadData.append(key, formData[key])
      })
      uploadData.append("docAvatar", selectedFile)

      const response = await axios.post("http://localhost:4000/api/v1/user/doctor/addnew", uploadData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        toast.success("Doctor added successfully")

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          dob: "",
          gender: "",
          password: "",
          doctorDepartment: "",
        })
        setSelectedFile(null)
        setFilePreview(null)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error adding doctor:", error)
      toast.error(error.response?.data?.message || "Failed to add doctor")
      setLoading(false)
    }
  }

  return (
    <div className="add-doctor-container">
      <div className="section-header">
        <h2>Add New Doctor</h2>
      </div>

      <form onSubmit={handleSubmit} className="add-doctor-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dob">Date of Birth *</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender *</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="doctorDepartment">Department *</label>
            <select
              id="doctorDepartment"
              name="doctorDepartment"
              value={formData.doctorDepartment}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Profile Picture *</label>

          {!selectedFile ? (
            <div className="file-upload-area">
              <input type="file" id="docAvatar" onChange={handleFileChange} className="file-input" accept="image/*" />
              <label htmlFor="docAvatar" className="file-label">
                <Upload className="w-6 h-6 mb-2" />
                <span>Click to upload or drag and drop</span>
                <span className="text-sm text-gray-500">JPG, PNG or WEBP (max. 2MB)</span>
              </label>
            </div>
          ) : (
            <div className="selected-file">
              <div className="file-preview">
                <img src={filePreview || "/placeholder.svg"} alt="Preview" className="preview-image" />
              </div>

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
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>Adding Doctor...</>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-1" />
                Add Doctor
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddDoctor
