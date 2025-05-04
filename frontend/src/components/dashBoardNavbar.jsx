"use client"

import { Link, useNavigate } from "react-router-dom"
import { GiHamburgerMenu } from "react-icons/gi"


const dashboardNavbar = () => {
  return (
    <>
      <nav className={"container"}>
        <div className="logo">MediCure</div>
        <div className={show ? "navLinks showmenu" : "navLinks"}>
          <div className="links">
            <Link to={"/"} onClick={() => setShow(!show)}>
              Home
            </Link>
            <Link to={"/appointment"} onClick={() => setShow(!show)}>
              Appointment
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
