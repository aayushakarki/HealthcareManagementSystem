"use client"

import { X, Phone, Mail, Calendar } from 'lucide-react'

const DoctorModal = ({ doctor, onClose }) => {
  if (!doctor) return null

  // Format date of birth
  const formatDOB = (dateString) => {
    if (!dateString) return "Not available"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="modal-overlay">
      <div className="doctor-modal">
        <div className="modal-header">
          <h3>Doctor Details</h3>
          <button className="close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-content">
          <div className="doctor-profile">
            <div className="doctor-avatar">
              <img 
                src={doctor.docAvatar?.url || "/placeholder.svg?height=120&width=120"} 
                alt={`${doctor.firstName} ${doctor.lastName}`}
                className="doctor-image"
              />
            </div>
            <div className="doctor-info">
              <h2 className="doctor-name">Dr. {doctor.firstName} {doctor.lastName}</h2>
              <p className="doctor-specialty">{doctor.doctorDepartment}</p>
            </div>
          </div>

          <div className="doctor-details">
            <div className="detail-item">
              <span className="detail-label">Department:</span>
              <span className="detail-value">{doctor.doctorDepartment}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Gender:</span>
              <span className="detail-value">{doctor.gender}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Date of Birth:</span>
              <span className="detail-value">{formatDOB(doctor.dob)}</span>
            </div>

            <div className="contact-details">
              <h4>Contact Information</h4>
              <div className="contact-item">
                <Phone className="w-4 h-4" />
                <span>{doctor.phone}</span>
              </div>
              <div className="contact-item">
                <Mail className="w-4 h-4" />
                <span>{doctor.email}</span>
              </div>
            </div>
          </div>

          <div className="doctor-actions">
            <button className="book-appointment-btn">
              <Calendar className="w-4 h-4" />
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorModal
