"use client";

import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../../main";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  MessageSquare,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  UserCog,
  FileText,
  BarChart,
  Activity,
  Clock,
  User,
  ChevronLeft,
} from "lucide-react";

<<<<<<< HEAD
=======
// Import components for each section
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
import AppointmentsOverview from "../../components/adminDashboard/AppointmentsOverview";
import DoctorsList from "../../components/adminDashboard/DoctorsList";
import PatientsList from "../../components/adminDashboard/AllPatientsList";
import Messages from "../../components/adminDashboard/Messages";
import DoctorDetails from "../../components/adminDashboard/DoctorDetails";
<<<<<<< HEAD
=======
// import PatientDetails from "../../components/adminDashboard/PatientDetails"
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
import DoctorVerificationRequests from "../../components/adminDashboard/DoctorVerificationRequests";

const AdminDashboard = () => {
  const { user, setIsAuthenticated, setUser } = useContext(Context);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
    pendingVerifications: 0,
  });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get(`http://localhost:4000/api/v1/user/admin/logout`, {
        withCredentials: true,
      });
      toast.success("Logged out successfully!");
      setIsAuthenticated(false);
      setUser({});
      navigateTo("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

<<<<<<< HEAD
=======
        // Fetch all appointments
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
        const appointmentsResponse = await axios
          .get("http://localhost:4000/api/v1/appointment/getall", {
            withCredentials: true,
          })
          .catch((err) => {
            console.error("Error fetching appointments:", err);
            return { data: { success: true, appointments: [] } };
          });

        if (appointmentsResponse.data.success) {
          const allAppointments = appointmentsResponse.data.appointments || [];
          setAppointments(allAppointments);

<<<<<<< HEAD
=======
          // Calculate today's appointments
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const todaysAppts = allAppointments.filter((appointment) => {
            const appointmentDate = new Date(appointment.appointment_date);
            return appointmentDate >= today && appointmentDate < tomorrow;
          });

<<<<<<< HEAD
=======
          // Calculate pending appointments
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
          const pendingAppts = allAppointments.filter(
            (app) => app.status === "pending"
          );

<<<<<<< HEAD
=======
          // Update stats
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
          setStats((prev) => ({
            ...prev,
            totalAppointments: allAppointments.length,
            pendingAppointments: pendingAppts.length,
            todayAppointments: todaysAppts.length,
          }));
        }

<<<<<<< HEAD
=======
        // Fetch all doctors
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
        const doctorsResponse = await axios
          .get("http://localhost:4000/api/v1/user/doctors", {
            withCredentials: true,
          })
          .catch((err) => {
            console.error("Error fetching doctors:", err);
            return { data: { success: true, doctors: [] } };
          });

        if (doctorsResponse.data.success) {
          const allDoctors = doctorsResponse.data.doctors || [];
          setDoctors(allDoctors);
          setStats((prev) => ({ ...prev, totalDoctors: allDoctors.length }));
        }

<<<<<<< HEAD
=======
        // Fetch all patients
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
        const patientsResponse = await axios
          .get("http://localhost:4000/api/v1/user/patients", {
            withCredentials: true,
          })
          .catch((err) => {
            console.error("Error fetching patients:", err);
            return { data: { success: false } };
          });

        if (patientsResponse.data.success) {
          const allPatients = patientsResponse.data.patients || [];
          setPatients(allPatients);
          setStats((prev) => ({ ...prev, totalPatients: allPatients.length }));
        }

<<<<<<< HEAD
=======
        // Fetch unverified doctors
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
        const unverifiedDoctorsResponse = await axios
          .get("http://localhost:4000/api/v1/user/admin/doctors/pending", {
            withCredentials: true,
          })
          .catch((err) => {
            console.error("Error fetching unverified doctors:", err);
            return { data: { success: true, count: 0 } };
          });

        if (unverifiedDoctorsResponse.data.success) {
          setStats((prev) => ({
            ...prev,
            pendingVerifications: unverifiedDoctorsResponse.data.count || 0,
          }));
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setActiveSection("doctordetails");
  };

  const handlePatientSelect = async (patient) => {
    try {
<<<<<<< HEAD
=======
      // Fetch detailed patient information if needed
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
      const patientResponse = await axios
        .get(`http://localhost:4000/api/v1/user/patient/${patient._id}`, {
          withCredentials: true,
        })
        .catch((err) => {
          console.error("Error fetching patient details:", err);
          return { data: { success: true, user: patient } };
        });

      if (patientResponse.data.success) {
        setSelectedPatient(patientResponse.data.user || patient);
        setActiveSection("patientdetails");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
<<<<<<< HEAD
=======
      // If there's an error, still show the patient details with the data we have
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
      setSelectedPatient(patient);
      setActiveSection("patientdetails");
    }
  };

<<<<<<< HEAD
=======
  // In AdminDashboard.jsx, replace the updateAppointmentStatus function with this:
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a

  const updateAppointmentStatus = async (
    appointmentId,
    status,
    newDate = null
  ) => {
    try {
      setLoading(true);

<<<<<<< HEAD
      const requestBody = { status };

      if (status === "Rescheduled" && newDate) {
        requestBody.newDate = new Date(newDate).toISOString();
      }

      console.log("Sending request body:", requestBody);
=======
      // Prepare the request body
      const requestBody = { status };

      // If rescheduling, add the new date
      if (status === "Rescheduled" && newDate) {
        // Convert to ISO string if it's not already
        requestBody.newDate = new Date(newDate).toISOString();
      }

      console.log("Sending request body:", requestBody); // Debug log
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a

      const response = await axios.put(
        `http://localhost:4000/api/v1/appointment/update/${appointmentId}`,
        requestBody,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Appointment updated successfully!");

<<<<<<< HEAD
=======
        // Update appointments in state with the new data
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
        setAppointments((prevAppointments) =>
          prevAppointments.map((app) =>
            app._id === appointmentId
              ? {
                  ...app,
                  status,
<<<<<<< HEAD
=======
                  // Update the date if it was rescheduled
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
                  ...(status === "Rescheduled" &&
                    newDate && {
                      appointment_date: new Date(newDate).toISOString(),
                    }),
                }
              : app
          )
        );

<<<<<<< HEAD
        if (status === "Rescheduled" && newDate) {
=======
        // Also update stats if needed
        if (status === "Rescheduled" && newDate) {
          // Recalculate today's appointments since the date might have changed
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          setAppointments((currentAppointments) => {
            const todaysAppts = currentAppointments.filter((appointment) => {
              const appointmentDate = new Date(appointment.appointment_date);
              return appointmentDate >= today && appointmentDate < tomorrow;
            });

            setStats((prev) => ({
              ...prev,
              todayAppointments: todaysAppts.length,
            }));

            return currentAppointments;
          });
        }

        return response.data;
      } else {
        toast.error("Failed to update appointment");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(
        error.response?.data?.message || "Failed to update appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderDashboardContent = () => {
    return (
      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="admin-stats-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Total Patients</h3>
                <p className="text-2xl font-semibold">{stats.totalPatients}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Today's Appointments</h3>
                <p className="text-2xl font-semibold">
                  {stats.todayAppointments}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Pending Appointments</h3>
                <p className="text-2xl font-semibold">
                  {stats.pendingAppointments}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Total Appointments</h3>
                <p className="text-2xl font-semibold">
                  {stats.totalAppointments}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FileText className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Total Doctors</h3>
                <p className="text-2xl font-semibold">{stats.totalDoctors}</p>
              </div>
              <div className="bg-cyan-100 p-3 rounded-full">
                <UserCog className="w-6 h-6 text-cyan-500" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Pending Verifications</h3>
                <p className="text-2xl font-semibold">
                  {stats.pendingVerifications}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <UserCog className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>

<<<<<<< HEAD
=======
        {/* Recent Appointments */}
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Appointments</h2>
            <button
              className="view-all"
              onClick={() => setActiveSection("appointments")}
            >
              View All
            </button>
          </div>
          <div className="appointments-container">
            {appointments.length > 0 ? (
              <ul className="appointment-list">
                {appointments.slice(0, 5).map((appointment) => (
                  <li key={appointment._id} className="appointment-item">
                    <div className="appointment-details">
                      <h3>{appointment.department}</h3>
                      <p>
                        Patient: {appointment.firstName} {appointment.lastName}
                      </p>
                      <p>
                        Doctor: {appointment.doctor?.firstName}{" "}
                        {appointment.doctor?.lastName}
                      </p>
                      <p>
                        Date:{" "}
                        {new Date(
                          appointment.appointment_date
                        ).toLocaleDateString()}
                      </p>
                      <p
                        className={`status status-${
                          appointment.status || "pending"
                        }`}
                      >
                        Status: {appointment.status || "Pending"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No appointments found</p>
            )}
          </div>
        </div>
<<<<<<< HEAD
=======

        {/* Activity Chart
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Appointment Activity</h2>
            <ChevronDown className="w-5 h-5" />
          </div>
          <div className="chart-placeholder">
            <BarChart className="w-full h-32 text-blue-500" />
          </div>
        </div> */}
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardContent();
      case "appointments":
        return (
          <AppointmentsOverview
            appointments={appointments}
            updateStatus={updateAppointmentStatus}
            onPatientSelect={handlePatientSelect}
          />
        );
      case "doctors":
        return (
          <DoctorsList doctors={doctors} onDoctorSelect={handleDoctorSelect} />
        );
      case "patients":
        return (
          <PatientsList
            patients={patients}
            onPatientSelect={handlePatientSelect}
          />
        );
      case "doctorverification":
        return <DoctorVerificationRequests />;
      case "doctordetails":
        return <DoctorDetails doctor={selectedDoctor} />;
      case "patientdetails":
        return <PatientDetails patient={selectedPatient} />;
      default:
        return renderDashboardContent();
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard-container">
<<<<<<< HEAD
=======
      {/* Sidebar */}
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <div className="logo-square bg-red-500"></div>
              <div className="logo-square bg-green-500"></div>
              <div className="logo-square bg-blue-500"></div>
              <div className="logo-square bg-yellow-500"></div>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={activeSection === "dashboard" ? "active" : ""}>
              <button onClick={() => setActiveSection("dashboard")}>
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li className={activeSection === "appointments" ? "active" : ""}>
              <button onClick={() => setActiveSection("appointments")}>
                <Calendar className="w-5 h-5" />
                <span>Appointments</span>
              </button>
            </li>
            <li className={activeSection === "doctors" ? "active" : ""}>
              <button onClick={() => setActiveSection("doctors")}>
                <UserCog className="w-5 h-5" />
                <span>Doctors</span>
              </button>
            </li>
            <li className={activeSection === "patients" ? "active" : ""}>
              <button onClick={() => setActiveSection("patients")}>
                <Users className="w-5 h-5" />
                <span>Patients</span>
              </button>
            </li>
            <li
              className={activeSection === "doctorverification" ? "active" : ""}
            >
              <button onClick={() => setActiveSection("doctorverification")}>
                <UserPlus className="w-5 h-5" />
                <span>Doctor Verification</span>
                {stats.pendingVerifications > 0 && (
                  <span className="ml-2px bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {stats.pendingVerifications}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </nav>

<<<<<<< HEAD
=======
        {/* Add logout button at the bottom of sidebar */}
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

<<<<<<< HEAD
=======
      {/* Main Content */}
>>>>>>> 1984fa28dbeb61e6196f67b473ee616e3cd4a27a
      <div className="main-content">
        <div className="top-bar">
          <div>
            <div>
              <p className="ml-4">Admin</p>
            </div>
          </div>
        </div>

        {activeSection !== "dashboard" && (
          <button
            className="chevron-back-btn"
            onClick={() => setActiveSection("dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
          </button>
        )}

        <div className="content-wrapper">
          <div className="content-main">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
