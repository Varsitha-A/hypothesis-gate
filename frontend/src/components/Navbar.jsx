import React, { useContext, useMemo } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const dashboardPath = useMemo(() => {
    if (!user?.role) return null;
    if (user.role === "student") return "/student/dashboard";
    if (user.role === "mentor") return "/mentor/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return null;
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const linkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        Hypothesis-Gate
      </Link>

      <div className="nav-links">
        <NavLink to="/" className={linkClass}>
          Home
        </NavLink>

        <NavLink to="/about" className={linkClass}>
          About
        </NavLink>

        {user && (
          <NavLink to="/chat" className={linkClass}>
            Chat
          </NavLink>
        )}

        {dashboardPath && (
          <NavLink to={dashboardPath} className={linkClass}>
            Dashboard
          </NavLink>
        )}

        {user ? (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>
            <NavLink to="/register" className={linkClass}>
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
