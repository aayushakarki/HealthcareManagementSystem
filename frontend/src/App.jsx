"use client"

import { useContext, useEffect } from "react"
import "./App.css"
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
  }, [isAuthenticated, user.role]) // Trigger effect on authentication change

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        {/* <Footer /> */}
        <ToastContainer position="top-center" />
      </Router>
    </>
  )
}

export default App
