"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Calendar, Clock } from "lucide-react";

const AppointmentsOverview = ({
  appointments = [],
  updateStatus,
  onPatientSelect,
}) => {
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState(null);
  const [newDate, setNewDate] = useState("");

  const fetchAppointments = async () => {
    if (appointments.length > 0) {
      // Extract unique departments from appointments
      const uniqueDepartments = [
        ...new Set(appointments.map((app) => app.department).filter(Boolean)),
      ];
      setDepartments(uniqueDepartments);
      filterAppointments();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:4000/api/v1/appointment/getall",
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        const allAppointments = response.data.appointments || [];

        // Extract unique departments
        const uniqueDepartments = [
          ...new Set(
            allAppointments.map((app) => app.department).filter(Boolean)
          ),
        ];
        setDepartments(uniqueDepartments);

        // Apply filters to the fetched appointments
        let filtered = [...allAppointments];

        // Apply status filter
        if (statusFilter !== "all") {
          filtered = filtered.filter(
            (app) =>
              (app.status || "").toLowerCase() === statusFilter.toLowerCase()
          );
        }

        // Apply department filter
        if (departmentFilter !== "all") {
          filtered = filtered.filter(
            (app) => app.department === departmentFilter
          );
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

        // Sort by date
        filtered.sort(
          (a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)
        );

        setFilteredAppointments(filtered);
      } else {
        toast.error("Failed to load appointments");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, [appointments, statusFilter, dateFilter, departmentFilter]);

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (app) => (app.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((app) => app.department === departmentFilter);
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

  // Helper function to handle appointment status updates
  const handleUpdateStatus = async (appointmentId, status, newDate) => {
    setUpdatingAppointmentId(appointmentId);
    try {
      await updateStatus(appointmentId, status, newDate);

      // Always refetch appointments after any status update
      // This ensures the UI reflects the latest data
      await fetchAppointments();
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  // Format status for display (capitalize first letter)
  const formatStatus = (status) => {
    if (!status) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Group appointments by date
  const groupAppointmentsByDate = () => {
    const grouped = {};

    filteredAppointments.forEach((appointment) => {
      const date = new Date(appointment.appointment_date).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(appointment);
    });

    return grouped;
  };

  const groupedAppointments = groupAppointmentsByDate();

  const handleReschedule = (appointmentId) => {
    setShowDatePicker(true);
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="appointments-overview-container">
      <div className="section-header">
        <h2>Appointments Overview</h2>
        <div
          className="header-actions"
          style={{ display: "flex", gap: "1rem", alignItems: "center" }}
        >
          <div className="filter-group">
            <label
              style={{ fontSize: "0.95rem", fontWeight: 500, marginRight: 4 }}
            >
              Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
          <div className="filter-group">
            <label
              style={{ fontSize: "0.95rem", fontWeight: 500, marginRight: 4 }}
            >
              Department:
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label
              style={{ fontSize: "0.95rem", fontWeight: 500, marginRight: 4 }}
            >
              Date:
            </label>
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
      </div>

      <div className="appointments-by-date">
        {Object.keys(groupedAppointments).length > 0 ? (
          Object.entries(groupedAppointments).map(
            ([date, dateAppointments]) => (
              <div key={date} className="date-group">
                <div className="date-header">
                  <Calendar className="w-5 h-5 mr-2" />
                  <p>
                    {date} ({dateAppointments.length} appointments)
                  </p>
                </div>

                <div className="admin-appointments-list">
                  {dateAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="admin-appointment-card"
                    >
                      <div className="admin-appointment-header">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {formatTimeFromDate(appointment.appointment_date)}
                        </span>
                        <span
                          className={`admin-status-badge admin-status-${(
                            appointment.status || "pending"
                          ).toLowerCase()}`}
                        >
                          {formatStatus(appointment.status)}
                        </span>
                      </div>
                      <h3
                        className="department"
                        style={{
                          color: "#776bb3",
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          marginBottom: "0.5rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        {appointment.department}
                      </h3>
                      <div className="admin-appointment-body">
                        <div className="admin-patient-info">
                          <strong>PATIENT:</strong>
                          Name : {appointment.firstName} {appointment.lastName}
                          <br />
                          Gender: {appointment.gender}
                          <br />
                          DOB :{" "}
                          {appointment.dob
                            ? new Date(appointment.dob).toLocaleDateString()
                            : ""}
                          <br />
                          Phone : {appointment.phone}
                        </div>
                        <div className="admin-doctor-info">
                          <strong>DOCTOR:</strong>
                          Name : Dr. {appointment.doctor?.firstName || ""}{" "}
                          {appointment.doctor?.lastName || ""}
                        </div>
                      </div>
                      <button
                        className="admin-btn-primary"
                        onClick={() =>
                          onPatientSelect({
                            _id: appointment.patientId,
                            firstName: appointment.firstName,
                            lastName: appointment.lastName,
                          })
                        }
                      >
                        View Patient
                      </button>
                      <select
                        value={formatStatus(appointment.status) || "Pending"}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (newStatus === "Rescheduled") {
                            setRescheduleAppointmentId(appointment._id);
                            setShowDatePicker(true);
                          } else {
                            // For non-reschedule status updates, don't pass a date
                            handleUpdateStatus(
                              appointment._id,
                              newStatus,
                              null
                            );
                          }
                        }}
                        disabled={updatingAppointmentId === appointment._id}
                        className="admin-status-select"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rescheduled">Reschedule</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )
          )
        ) : (
          <div className="no-appointments">
            <p>No appointments found</p>
          </div>
        )}
      </div>

      {showDatePicker && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Pick a new date and time for the appointment</h3>
            <input
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="form-input"
            />
            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={async () => {
                  // Fix: Pass newDate instead of rescheduleDate
                  await updateStatus(
                    rescheduleAppointmentId,
                    "Rescheduled",
                    newDate
                  );
                  setShowDatePicker(false);
                  setRescheduleAppointmentId(null);
                  setNewDate("");
                  // Force refresh appointments after reschedule
                  fetchAppointments();
                }}
                disabled={!newDate}
              >
                Confirm
              </button>
              <button
                className="btn-outline"
                onClick={() => {
                  setShowDatePicker(false);
                  setRescheduleAppointmentId(null);
                  setNewDate("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsOverview;
