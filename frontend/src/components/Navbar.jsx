"use client"

import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { GiHamburgerMenu } from "react-icons/gi"
import axios from "axios"
import { toast } from "react-toastify"
import { Context } from "../main"

const Navbar = () => {
  const [show, setShow] = useState(false)
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useContext(Context) // Add setUser
  const navigateTo = useNavigate()

  // Add this debug log
  console.log("Navbar - User authenticated:", isAuthenticated, "User role:", user?.role)

  const handleLogout = async () => {
    let logoutEndpoint = "/user/patient/logout" // Default logout endpoint for patient

    if (user.role === "Doctor") {
      logoutEndpoint = "/user/doctor/logout" // Modify endpoint for doctor logout
    } else if (user.role === "Admin") {
      logoutEndpoint = "/user/admin/logout" // Modify endpoint for admin logout
    }

    console.log("User role in Navbar:", user.role) // Add this to see the logged-in role

    try {
      await axios.get(`http://localhost:4000/api/v1${logoutEndpoint}`, {
        withCredentials: true,
      })
      toast.success("Logged out successfully!")
      setIsAuthenticated(false)
      setUser({}) // Clear user data after logout
    } catch (err) {
      toast.error(err.response.data.message)
    }
  }

  const goToLogin = () => {
    navigateTo("/login")
  }

  const goToRegister = () => {
    navigateTo("/register")
  }

  return (
    <>
      <nav className={"container"}>
        <div className="logo">MediCure</div>
        <div className={show ? "navLinks showmenu" : "navLinks"}>
          <div className="links">
            <Link to={"/"} onClick={() => setShow(!show)}>
              Home
            </Link>
            <Link to={"/about"} onClick={() => setShow(!show)}>
              About Us
            </Link>
          </div>

          {isAuthenticated ? (
            <div>
              <button className="logoutBtn btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div>
              <button className="loginBtn btn" onClick={goToLogin}>
                Login
              </button>
              <button className="loginBtn btn" onClick={goToRegister}>
                Register
              </button>
            </div>
          )}
        </div>
        <div className="hamburger" onClick={() => setShow(!show)}>
          <GiHamburgerMenu />
        </div>
      </nav>
    </>
  )
}

export default Navbar
