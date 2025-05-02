"use client"

import axios from "axios"
import { useContext, useState } from "react"
import { toast } from "react-toastify"
import { Context } from "../main"
import { Link, useNavigate, Navigate } from "react-router-dom"

const Login = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context) // Add setUser

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("Patient") // Default role is Patient

  const navigateTo = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/user/login",
        { email, password, role },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      )

      toast.success(res.data.message)
      setIsAuthenticated(true)
      setUser(res.data.user)
      console.log("User logged in successfully:", res.data.user)
      console.log("User Role after login:", res.data.user.role)
      navigateTo("/")
      setEmail("")
      setPassword("")
    } catch (error) {
      toast.error(error.response.data.message)
    }
  }

  if (isAuthenticated) {
    return <Navigate to={"/"} />
  }

  return (
    <>
      <div className="container form-component login-form">
        <h2>Sign In</h2>
        <p>Please Login To Continue</p>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Patient">Patient</option>
            <option value="Doctor">Doctor</option>
            <option value="Admin">Admin</option>
          </select>
          <div style={{ gap: "10px", justifyContent: "flex-end", flexDirection: "row" }}>
            <p style={{ marginBottom: 0 }}>Not Registered?</p>
            <Link to={"/register"} style={{ textDecoration: "none", color: "#271776ca" }}>
              Register Now
            </Link>
          </div>
          <div style={{ justifyContent: "center", alignItems: "center" }}>
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    </>
  )
}

export default Login
