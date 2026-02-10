import React, { useState } from "react";
import SubmitIdea from "./SubmitIdea";
import MyIdeas from "./MyIdeas";
import Navbar from "../../components/Navbar";
import "styles/dashboard.css";
const StudentDashboard = () => {
  const [view, setView] = useState("submit");

  return (
    <>
      
      <div className="dashboard-container">
        <div className="sidebar">
          <button onClick={() => setView("submit")}>Submit Idea</button>
          <button onClick={() => setView("view")}>My Ideas</button>
        </div>
        <div className="main-view">
          {view === "submit" ? <SubmitIdea /> : <MyIdeas />}
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
