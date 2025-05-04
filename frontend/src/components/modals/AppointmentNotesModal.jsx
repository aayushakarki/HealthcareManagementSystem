"use client"

import { useState } from "react"
import { X, Save } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"

const AppointmentNotesModal = ({ appointment, onClose, onNotesSaved }) => {
  const [notes, setNotes] = useState(appointment.doctorNotes || "")
  const [saving, setSaving] = useState(false)

  const handleSaveNotes = async () => {
    try {
      setSaving(true)
      const response = await axios.post(
        `http://localhost:4000/api/v1/appointment/notes/${appointment._id}`,
        { notes },
        { withCredentials: true },
      )

      if (response.data.success) {
        toast.success("Notes saved successfully")
        onNotesSaved(appointment._id, notes)
        onClose()
      }
    } catch (error) {
      console.error("Error saving notes:", error)
      toast.error(error.response?.data?.message || "Failed to save notes")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="notes-modal max-w-lg w-full">
        <div className="modal-header flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold">Appointment Notes</h3>
          <button className="close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-content p-4">
          <div className="appointment-info mb-4">
            <p>
              <strong>Patient:</strong> {appointment.firstName} {appointment.lastName}
            </p>
            <p>
              <strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}
            </p>
            <p>
              <strong>Department:</strong> {appointment.department}
            </p>
          </div>

          <div className="notes-editor">
            <label htmlFor="notes" className="block mb-2 font-medium">
              Doctor's Notes
            </label>
            <textarea
              id="notes"
              className="w-full h-40 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your notes about this appointment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <div className="actions mt-4 flex justify-end gap-2">
            <button className="btn-outline px-4 py-2 border rounded-md" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-primary flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={handleSaveNotes}
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Notes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentNotesModal
