import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/logo.webp";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-logo">
        <Link to="/register" aria-label="Homepage">
          <img src={logo} alt="App Logo" className="logo-img" />
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/register">Register</Link>
        <Link to="/table">View Table</Link>
        <Link to="/advancedQuery">Advanced Query</Link>
      </div>
    </nav>
  );
};

export default Navbar;
