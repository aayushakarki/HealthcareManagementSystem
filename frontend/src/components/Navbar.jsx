import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const handleLogout = async () => {
    await axios
      .get("http://localhost:4000/api/v1/user/patient/logout", {
        withCredentials: true,
      })
      .then((res) => {
        toast.success(res.data.message);
        setIsAuthenticated(false);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const navigateTo = useNavigate();

  const goToLogin = () => {
    navigateTo("/login");
  };

  const goToRegister = () => {
    navigateTo("/register");
  };

  return (
    <>
    <nav className={"container"}>
      <div className="logo">
        MediCure
      </div>
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
            <button className="logoutBtn btn" onClick={handleLogout}>
              Logout
            </button>
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
  );
};

export default Navbar;