"use client"

import axios from "axios"
import { useContext, useState } from "react"
import { toast } from "react-toastify"
import { Context } from "../main"
import { Link, Navigate, useNavigate } from "react-router-dom"

const Register = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context)
  const [role, setRole] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nmcNumber, setNmcNumber] = useState("")
  const [doctorDepartment, setDoctorDepartment] = useState("") // Added department field
  const [signature, setSignature] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigateTo = useNavigate()

  const handleRegistration = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form data
      if (!firstName || !lastName || !email || !phone || !dob || !gender || !password || !confirmPassword || !role) {
        toast.error("Please fill all required fields")
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match")
        setLoading(false)
        return
      }

      if (role === "Doctor" && (!nmcNumber || !doctorDepartment)) {
        toast.error("NMC Number and Department are required for doctors")
        setLoading(false)
        return
      }

      if (role === "Doctor" && !signature) {
        toast.error("Digital signature is required for doctors")
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append("firstName", firstName)
      formData.append("lastName", lastName)
      formData.append("email", email)
      formData.append("phone", phone)
      formData.append("dob", dob)
      formData.append("gender", gender)
      formData.append("password", password)
      formData.append("confirmPassword", confirmPassword)
      formData.append("role", role)

      if (role === "Doctor") {
        formData.append("nmcNumber", nmcNumber)
        formData.append("doctorDepartment", doctorDepartment)
        formData.append("signatureFile", signature)
      }

      // Log form data for debugging
      console.log("Form data being sent:")
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`)
      }

      const url =
        role === "Patient"
          ? "http://localhost:4000/api/v1/user/patient/register"
          : "http://localhost:4000/api/v1/user/doctor/register"

      const response = await axios.post(url, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast.success(response.data.message || "Registration successful!")
      setIsAuthenticated(false)
      navigateTo("/login")

      // Clear form fields after successful registration
      setFirstName("")
      setLastName("")
      setEmail("")
      setPhone("")
      setDob("")
      setGender("")
      setPassword("")
      setConfirmPassword("")
      setNmcNumber("")
      setDoctorDepartment("")
      setSignature(null)
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated) {
    return <Navigate to={"/"} />
  }

  return (
    <>
      <div className="container form-component register-form">
        <h2>Sign Up</h2>
        <p>Please Sign Up To Continue</p>
        <form onSubmit={handleRegistration}>
          <div>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input
              type="tel"
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              pattern="[0-9]{10}"
              title="Phone number must be 10 digits"
              required
            />
          </div>
          <div>
            <input
              type="date"
              placeholder="Date of Birth"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
          <div>
            <select value={gender} onChange={(e) => setGender(e.target.value)} required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="8"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength="8"
              required
            />
          </div>

          <div>
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="">Select Role</option>
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
            </select>
          </div>

          {role === "Doctor" && (
            <>
              <div>
                <input
                  type="text"
                  placeholder="NMC Number"
                  value={nmcNumber}
                  onChange={(e) => setNmcNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <select value={doctorDepartment} onChange={(e) => setDoctorDepartment(e.target.value)} required>
                  <option value="">Select Department</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>
              <div className="file">
                <label htmlFor="signature">Upload Digital Signature (PNG, JPEG, or PDF)</label>
                <input
                  id="signature"
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) => setSignature(e.target.files[0])}
                  required
                />
              </div>
            </>
          )}

          <div
            style={{
              gap: "10px",
              justifyContent: "flex-end",
              flexDirection: "row",
            }}
          >
            <p style={{ marginBottom: 0 }}>Already Registered?</p>
            <Link to={"/login"} style={{ textDecoration: "none", color: "#271776ca" }}>
              Login Now
            </Link>
          </div>

          <div style={{ justifyContent: "center", alignItems: "center" }}>
            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default Register
