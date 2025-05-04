"use client"

import { useContext, useEffect } from "react"
import "./css/App.css"
import "./css/PatientDashboard.css"
import "./css/patientDashboardComponent.css"
import "./css/DoctorDashboard.css"
import "./css/AdminDashboard.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Appointment from "./pages/appointment"
import AboutUs from "./pages/AboutUs"
import Register from "./pages/Register"
// import Footer from "./components/Footer";
import Navbar from "./components/Navbar"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import { Context } from "./main"
import Login from "./pages/Login"
import PatientDashboard from "./pages/dashboard/PatientDashboard"
import DoctorDashboard from "./pages/dashboard/DoctorDashboard"
import AdminDashboard from "./pages/dashboard/AdminDashboard"



const App = () => {
  const { isAuthenticated, setIsAuthenticated, setUser, user } = useContext(Context)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Dynamically select the endpoint based on the user's role
        let endpoint = "/api/v1/user/patient/me" // Default for patient

        // Check if user object exists and has a role property
        if (user && user.role) {
          if (user.role === "Doctor") {
            endpoint = "/api/v1/user/doctor/me" // Fetch doctor data
          } else if (user.role === "Admin") {
            endpoint = "/api/v1/user/admin/me" // Fetch admin data
          }
          console.log("Using endpoint based on role:", endpoint)
        }

        // Fetch user data
        const response = await axios.get(`http://localhost:4000${endpoint}`, {
          withCredentials: true, // Ensure cookies are sent with the request
        })

        // Set user data and authentication status
        setIsAuthenticated(true)
        setUser(response.data.user) // Set the user data (Patient/Doctor/Admin)
      } catch (error) {
        // Handle errors (user not logged in)
        setIsAuthenticated(false)
        setUser({})
      }
    }

    if (isAuthenticated) {
      fetchUser()
    }
  }, [isAuthenticated])

  return (
    <>
      <Router>
        {/* Only show Navbar on non-dashboard pages */}
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Home />
              </>
            }
          />
          <Route
            path="/appointment"
            element={
              <>
                <Navbar />
                <Appointment />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <Navbar />
                <AboutUs />
              </>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <Navbar />
                <Register />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <Navbar />
                <Login />
              </>
            }
          />
          <Route path="/dashboard/PatientDashboard" element={<PatientDashboard />} />
          <Route path="/dashboard/DoctorDashboard" element={<DoctorDashboard />} />
          <Route path="/dashboard/AdminDashboard" element={<AdminDashboard />} />
        </Routes>
        <ToastContainer position="top-center" />
      </Router>
    </>
  )
}

export default App
