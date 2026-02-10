import React, { useState } from "react";
import MentorIdeas from "./MentorIdeas";
import Navbar from "../../components/Navbar";

const MentorDashboard = () => {
  const [view, setView] = useState("ideas");

  return (
    <>
    
      <div className="dashboard-container">
        <div className="sidebar">
          <button onClick={() => setView("ideas")}>All Student Ideas</button>
        </div>
        <div className="main-view">
          {view === "ideas" && <MentorIdeas />}
        </div>
      </div>
    </>
  );
};

export default MentorDashboard;
