"use client"

import { useState } from "react"
import { X, Download } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"

const HealthRecordModal = ({ record, onClose }) => {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `http://localhost:4000/api/v1/health-records/download/${record._id}`,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      )

      // Create a blob URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', record.fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("File downloaded successfully")
    } catch (error) {
      console.error("Error downloading file:", error)
      toast.error(error.response?.data?.message || "Failed to download file")
    } finally {
      setLoading(false)
    }
  }

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
            <div className="file-actions">
              <a href={record.fileUrl} target="_blank" rel="noopener noreferrer" className="view-file-btn">
                Open File in New Tab
              </a>
              <button 
                onClick={handleDownload} 
                className="download-btn"
                disabled={loading}
              >
                {loading ? "Downloading..." : (
                  <>
                    <Download className="w-4 h-4 mr-1" />
                    Download File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthRecordModal
