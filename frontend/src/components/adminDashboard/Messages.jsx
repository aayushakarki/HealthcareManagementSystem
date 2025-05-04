"use client"

import { useState } from "react"
import { Search, Mail, Phone, Calendar, ChevronDown, ChevronUp } from 'lucide-react'

const Messages = ({ messages = [] }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMessages, setFilteredMessages] = useState(messages)
  const [expandedMessage, setExpandedMessage] = useState(null)

  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.trim() === "") {
      setFilteredMessages(messages)
    } else {
      const filtered = messages.filter(
        (message) =>
          message.firstName.toLowerCase().includes(term.toLowerCase()) ||
          message.lastName.toLowerCase().includes(term.toLowerCase()) ||
          message.email.toLowerCase().includes(term.toLowerCase()) ||
          message.message.toLowerCase().includes(term.toLowerCase())
      )
      setFilteredMessages(filtered)
    }
  }

  const toggleMessage = (messageId) => {
    if (expandedMessage === messageId) {
      setExpandedMessage(null)
    } else {
      setExpandedMessage(messageId)
    }
  }

  return (
    <div className="messages-container">
      <div className="section-header">
        <h2>Enquiry Messages</h2>
        <div className="search-container">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {filteredMessages.length > 0 ? (
        <div className="messages-list">
          {filteredMessages.map((message) => (
            <div
              key={message._id}
              className={`message-card ${expandedMessage === message._id ? "expanded" : ""}`}
            >
              <div className="message-header" onClick={() => toggleMessage(message._id)}>
                <div className="sender-info">
                  <h3>
                    {message.firstName} {message.lastName}
                  </h3>
                  <span className="message-date">{new Date(message.createdAt).toLocaleString()}</span>
                </div>
                <button className="expand-button">
                  {expandedMessage === message._id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className={`message-content ${expandedMessage === message._id ? "show" : ""}`}>
                <div className="contact-details">
                  <div className="contact-item">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{message.email}</span>
                  </div>
                  <div className="contact-item">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{message.phone}</span>
                  </div>
                  <div className="contact-item">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{new Date(message.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="message-text">
                  <p>{message.message}</p>
                </div>
                <div className="message-actions">
                  <button className="btn-outline">
                    <Mail className="w-4 h-4 mr-1" />
                    Reply via Email
                  </button>
                  <button className="btn-outline">
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-messages">
          <p>No messages found</p>
        </div>
      )}
    </div>
  )
}

export default Messages
