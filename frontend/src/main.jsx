"use client"

import React, { createContext, useState, useEffect } from "react"
import ReactDOM from "react-dom/client"
import axios from "axios"
import App from "./App.jsx"

// Create Context for global state
export const Context = createContext({
  isAuthenticated: false,
  user: {},
})

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState({})

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Only proceed if we're authenticated
        if (!isAuthenticated) return

        // Dynamically select the endpoint based on the user's role
        let endpoint = "/api/v1/user/patient/me" // Default to patient endpoint

        // If we already have user data with role, use the appropriate endpoint
        if (user && user.role) {
          if (user.role === "Doctor") {
            endpoint = "/api/v1/user/doctor/me"
          } else if (user.role === "Admin") {
            endpoint = "/api/v1/user/admin/me"
          }
          console.log("Fetching from endpoint:", endpoint)
        }

        const response = await axios.get(`http://localhost:4000${endpoint}`, {
          withCredentials: true,
        })

        setIsAuthenticated(true)
        setUser(response.data.user)
      } catch (error) {
        console.error("Error fetching user data:", error.response ? error.response.data : error.message)
        setIsAuthenticated(false)
        setUser({})
      }
    }

    fetchUser()
  }, [isAuthenticated])

  return (
    <Context.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser }}>
      <App />
    </Context.Provider>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
)
