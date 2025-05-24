import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import backgroundImg from "../assets/HomeBackground1.png";

const Home: React.FC = () => {
  return (
    <div
      className="home-container"
      style={{ backgroundImage: `url(${backgroundImg})` }}
    >
      <div className="home-box">
        <h2>Get Started</h2>
        <Link to="/register" className="home-link">
          ➜ Register Patient
        </Link>
        <Link to="/table" className="home-link">
          ➜ View Table
        </Link>
        <Link to="/advancedQuery" className="home-link">
          ➜ Advanced Query
        </Link>
        <Link to="/excel" className="home-link">
          ➜ Register Patient Via Excel
        </Link>
      </div>
    </div>
  );
};

export default Home;
