"use client"

import { X } from "lucide-react"

const HealthRecordModal = ({ record, onClose }) => {
  if (!record) return null

  return (
    <div className="modal-overlay">
      <div className="record-modal">
        <div className="modal-header">
          <h3>Health Record Details</h3>
          <button className="close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-content">
          <div className="record-detail-item">
            <span className="detail-label">Record Type:</span>
            <span className="detail-value">{record.recordType}</span>
          </div>
          <div className="record-detail-item">
            <span className="detail-label">Description:</span>
            <span className="detail-value">{record.description}</span>
          </div>
          <div className="record-detail-item">
            <span className="detail-label">Date Created:</span>
            <span className="detail-value">{new Date(record.createdAt).toLocaleString()}</span>
          </div>
          <div className="record-detail-item">
            <span className="detail-label">File Name:</span>
            <span className="detail-value">{record.fileName}</span>
          </div>
          {record.createdBy && (
            <div className="record-detail-item">
              <span className="detail-label">Created By:</span>
              <span className="detail-value">
                {record.createdBy.name} ({record.createdBy.role})
              </span>
            </div>
          )}
          <div className="file-preview">
            <h4>File Preview</h4>
            {record.fileUrl && (
              <div className="file-container">
                {record.fileUrl.endsWith(".pdf") ? (
                  <iframe src={record.fileUrl} className="pdf-preview" title="PDF Preview"></iframe>
                ) : (
                  <img src={record.fileUrl || "/placeholder.svg"} alt="Health Record" className="image-preview" />
                )}
              </div>
            )}
            <a href={record.fileUrl} target="_blank" rel="noopener noreferrer" className="view-file-btn">
              Open File in New Tab
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthRecordModal
