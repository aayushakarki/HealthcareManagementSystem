"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Filter, ChevronDown, FileText } from "lucide-react";
import AppointmentNotesModal from "../modals/AppointmentNotesModal";
import PatientDetailsModal from "../modals/PatientDetailsModal";
import axios from "axios";

const DoctorAppointments = ({ appointments = [], onUpdateStatus }) => {
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [localAppointments, setLocalAppointments] = useState([]); // Add local state for appointments
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch fresh appointments from the server
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:4000/api/v1/appointment/doctor/me", {
        withCredentials: true,
      });

      if (response.data.success) {
        setLocalAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Use local appointments if available, otherwise use props
  const currentAppointments = localAppointments.length > 0 ? localAppointments : appointments;

  // Fetch appointments on component mount
  useEffect(() => {
    if (appointments.length === 0) {
      fetchAppointments();
    } else {
      setLocalAppointments(appointments);
    }
  }, []);

  // Update local appointments when props change
  useEffect(() => {
    if (appointments.length > 0) {
      setLocalAppointments(appointments);
    }
  }, [appointments]);

  // Filter appointments whenever local appointments or filters change
  useEffect(() => {
    filterAppointments();
  }, [localAppointments, statusFilter, dateFilter]);

  const filterAppointments = () => {
    let filtered = [...currentAppointments];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => (app.status || "pending").toLowerCase() === statusFilter.toLowerCase());
    }

    // Apply date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    if (dateFilter === "today") {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.appointment_date);
        return appDate >= today && appDate < tomorrow;
      });
    } else if (dateFilter === "week") {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.appointment_date);
        return appDate >= today && appDate < nextWeek;
      });
    } else if (dateFilter === "month") {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.appointment_date);
        return appDate >= today && appDate < nextMonth;
      });
    }

    // Sort by date (most recent first)
    filtered.sort(
      (a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)
    );

    setFilteredAppointments(filtered);
  };

  const formatTimeFromDate = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Format start time
    const startHour = hours.toString().padStart(2, "0");
    const startMinutes = minutes.toString().padStart(2, "0");

    // Format end time (assume 40 minutes appointment)
    const endDate = new Date(date);
    endDate.setMinutes(endDate.getMinutes() + 40);
    const endHour = endDate.getHours().toString().padStart(2, "0");
    const endMinutes = endDate.getMinutes().toString().padStart(2, "0");

    return `${startHour}:${startMinutes} - ${endHour}:${endMinutes}`;
  };

  const handleAddNotes = (appointment) => {
    setSelectedAppointment(appointment);
    setShowNotesModal(true);
  };

  const handleNotesSaved = (appointmentId, notes) => {
    // Update the local appointments list with the new notes
    setLocalAppointments((prevAppointments) =>
      prevAppointments.map((app) =>
        app._id === appointmentId ? { ...app, doctorNotes: notes } : app
      )
    );

    // Update the filtered appointments as well
    setFilteredAppointments((prevFiltered) =>
      prevFiltered.map((app) =>
        app._id === appointmentId ? { ...app, doctorNotes: notes } : app
      )
    );
  };

  const handleViewPatient = async (patientId) => {
    try {
      // Fetch patient details
      const response = await axios.get(
        `http://localhost:4000/api/v1/user/patient/${patientId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSelectedPatient(response.data.user);
        setShowPatientModal(true);
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      // If API fails, try to get patient info from the appointment
      const patient = currentAppointments.find((app) => app.patientId === patientId);
      if (patient) {
        setSelectedPatient({
          _id: patientId,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          dob: patient.dob,
          gender: patient.gender,
          address: patient.address,
        });
        setShowPatientModal(true);
      }
    }
  };

  // Add a refresh button to manually fetch latest appointments
  const handleRefresh = () => {
    fetchAppointments();
  };

  if (loading && currentAppointments.length === 0) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="doctor-appointments-container">
      <div className="section-header">
        <h2>Appointments</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            className="btn-outline"
            onClick={handleRefresh}
            disabled={loading}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            className="filter-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
            <ChevronDown
              className={`w-4 h-4 ml-1 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-container">
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="accepted">Accepted</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date:</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      )}

      <div className="appointments-list">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              {/* Main Content Column */}
              <div className="appointment-content">
                {/* Department and Status in the same row */}
                <div className="department-status-container">
                  <h3 className="department">{appointment.department}</h3>
                  <div
                    className={`appointment-status status-${
                      (appointment.status || "pending").toLowerCase()
                    }`}
                  >
                    {appointment.status || "Pending"}
                  </div>
                </div>
              {/* Date and Time Column */}
              <div className="appointment-date-time">
                <Calendar className="w-5 h-5" />
                <div className="date-display">
                  {new Date(appointment.appointment_date).toLocaleDateString()}
                </div>
                <Clock className="w-5 h-5" />
                <div className="time-display">
                  {formatTimeFromDate(appointment.appointment_date)}
                </div>
              </div>
                <div className="patient-info">
                  <p className="app-patientname">
                    <strong>Patient:</strong> {appointment.firstName}{" "}
                    {appointment.lastName}
                  </p>
                  <div className="app-patientdetails">
                    <span className="patient-gender">{appointment.gender}</span>
                    {appointment.dob && (
                      <span className="patient-dob">
                        {new Date(appointment.dob).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {appointment.phone && (
                    <p className="patient-contact">
                      <strong>Phone:</strong> {appointment.phone}
                    </p>
                  )}
                  {appointment.hasVisited !== undefined && (
                    <p className="patient-visit-status">
                      <strong>Previous Visit:</strong>{" "}
                      {appointment.hasVisited ? "Yes" : "First Visit"}
                    </p>
                  )}
                </div>

                {/* Doctor Notes Section */}
                {appointment.doctorNotes && (
                  <div className="doctor-notes">
                    <p>Doctor's Notes:</p>
                    <p>{appointment.doctorNotes}</p>
                  </div>
                )}
              </div>

              {/* Actions Column */}
              <div className="appointment-actions">
                <button
                  className="btn-outline"
                  onClick={() => handleAddNotes(appointment)}
                >
                  {appointment.doctorNotes ? "Edit Notes" : "Add Notes"}
                </button>
                <button
                  className="btn-primary"
                  onClick={() => handleViewPatient(appointment.patientId)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-appointments">
            <p>No appointments found</p>
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <AppointmentNotesModal
          appointment={selectedAppointment}
          onClose={() => setShowNotesModal(false)}
          onNotesSaved={handleNotesSaved}
        />
      )}

      {/* Patient Details Modal */}
      {showPatientModal && (
        <PatientDetailsModal
          patient={selectedPatient}
          onClose={() => setShowPatientModal(false)}
        />
      )}
    </div>
  );
};

export default DoctorAppointments;