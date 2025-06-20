"use client"

import { useState, useEffect } from "react"
import { X, Download } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"

const SUMMARY_PROMPT = "Summarize this medical report image in simple patient-friendly language."

const HealthRecordModal = ({ record, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [userInput, setUserInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  // Helper to get/set chat history in localStorage
  const chatKey = record ? `healthRecordChat_${record._id}` : null

  useEffect(() => {
    if (showChat && chatKey) {
      const saved = localStorage.getItem(chatKey)
      if (saved) {
        setChatMessages(JSON.parse(saved))
      }
    }
    // eslint-disable-next-line
  }, [showChat, chatKey])

  // Save chat messages to localStorage whenever they change
  useEffect(() => {
    if (showChat && chatKey) {
      localStorage.setItem(chatKey, JSON.stringify(chatMessages))
    }
    // eslint-disable-next-line
  }, [chatMessages, showChat, chatKey])

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

  // Summarize button handler
  const handleSummarize = async () => {
    if (!chatKey) return;
    // Check if chat history exists for this record
    const saved = localStorage.getItem(chatKey);
    if (saved) {
      setChatMessages(JSON.parse(saved));
      setShowChat(true);
      return;
    }
    // No previous chat, start new summary
    setShowChat(true);
    setChatMessages([{ sender: "user", text: SUMMARY_PROMPT }]);
    setChatLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/health-records/summarize",
        { imageUrl: record.fileUrl },
        { withCredentials: true }
      );
      setChatMessages([
        { sender: "user", text: SUMMARY_PROMPT },
        { sender: "ai", text: res.data.summary }
      ]);
    } catch (error) {
      setChatMessages([
        { sender: "user", text: SUMMARY_PROMPT },
        { sender: "ai", text: "Sorry, I couldn't summarize the report." }
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  // Handle user question in chat
  const handleSendQuestion = async (e) => {
    e.preventDefault()
    if (!userInput.trim()) return
    const question = userInput.trim()
    setChatMessages((prev) => [...prev, { sender: "user", text: question }])
    setUserInput("")
    setChatLoading(true)
    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/health-records/ask-ai",
        { imageUrl: record.fileUrl, question },
        { withCredentials: true }
      )
      setChatMessages((prev) => [...prev, { sender: "ai", text: res.data.answer }])
    } catch (error) {
      setChatMessages((prev) => [...prev, { sender: "ai", text: "Sorry, I couldn't answer that question." }])
    } finally {
      setChatLoading(false)
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
              <button 
                onClick={handleSummarize}
                className="summarize-btn"
                disabled={chatLoading}
              >
                Summarize
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Chat Sidebar */}
      {showChat && (
        <div className="chat-sidebar">
          <div className="chat-header">
            <span>REPORT SUMMARIZATION</span>
            <button className="close-btn" onClick={() => setShowChat(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="chat-body">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.sender === "user" ? "user-msg" : "ai-msg"}`}
              >
                {msg.text}
              </div>
            ))}
            {chatLoading && <div className="ai-msg">Loading...</div>}
          </div>
          <form className="chat-input" onSubmit={handleSendQuestion}>
            <input
              type="text"
              placeholder="Enter your questions.."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={chatLoading}
            />
            <button type="submit" disabled={chatLoading || !userInput.trim()}>Send</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default HealthRecordModal