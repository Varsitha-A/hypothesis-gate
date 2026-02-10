import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import "../styles/Home.css";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [studentIdeas, setStudentIdeas] = useState([]);
  const [mentorIdeas, setMentorIdeas] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === "student") {
          const res = await axios.get(`/ideas/student/${user._id}`);
          setStudentIdeas(res.data);
        } else if (user?.role === "mentor") {
          const res = await axios.get(`/ideas`);
          setMentorIdeas(res.data);
        }
        const annRes = await axios.get(`/announcements`);
        setAnnouncements(annRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1>Welcome to Hypothesis-Gate</h1>
        <p>
          A centralized platform to submit, review, and manage student research ideas.
          Streamline the process, collaborate with mentors, and bring your ideas to life.
        </p>
        {!user && (
          <p className="login-message">
            Please <strong>Login</strong> or <strong>Register</strong> to access your dashboard.
          </p>
        )}
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Platform Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Submit Ideas</h3>
            <p>Students can submit ideas as text, PDF, or Word files, anytime, from anywhere.</p>
          </div>
          <div className="feature-card">
            <h3>Review & Feedback</h3>
            <p>Mentors can approve, reject, or provide feedback on student submissions.</p>
          </div>
          <div className="feature-card">
            <h3>Track Progress</h3>
            <p>Monitor the status of your ideas and submissions in real time.</p>
          </div>
          <div className="feature-card">
            <h3>Secure & Centralized</h3>
            <p>All data is securely stored and accessible only to authorized users.</p>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      {user && (
        <section className="dashboard-preview">
          {user.role === "student" && (
            <>
              <h2>Student Dashboard Preview</h2>
              <p>Quick access to submit your ideas and track your submissions.</p>
              {studentIdeas.length === 0 ? (
                <p>No ideas submitted yet. Start by submitting your first idea!</p>
              ) : (
                <div className="idea-cards">
                  {studentIdeas.map((idea) => (
                    <div key={idea._id} className="idea-card">
                      <h4>{idea.title}</h4>
                      <p>{idea.description}</p>
                      <p className="status">Status: {idea.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {user.role === "mentor" && (
            <>
              <h2>Mentor Dashboard Preview</h2>
              <p>Review, approve, or provide feedback for student submissions.</p>
              {mentorIdeas.length === 0 ? (
                <p>No student ideas submitted yet.</p>
              ) : (
                <div className="idea-cards">
                  {mentorIdeas.map((idea) => (
                    <div key={idea._id} className="idea-card">
                      <h4>{idea.title}</h4>
                      <p>{idea.description}</p>
                      <p>Submitted by: {idea.createdBy}</p>
                      <p className="status">Status: {idea.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <section className="announcements-section">
          <h2>Latest Announcements</h2>
          <ul>
            {announcements.map((ann) => (
              <li key={ann._id}>
                <strong>{ann.title}</strong> - {ann.description}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Steps Section */}
      <section className="steps-section">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <h3>1. Register & Login</h3>
            <p>Create your account and login securely to access your dashboard.</p>
          </div>
          <div className="step-card">
            <h3>2. Submit Ideas</h3>
            <p>Add your research ideas as text, PDF, or Word files for review.</p>
          </div>
          <div className="step-card">
            <h3>3. Mentor Review</h3>
            <p>Mentors review, provide feedback, and approve your submissions.</p>
          </div>
          <div className="step-card">
            <h3>4. Track Progress</h3>
            <p>Monitor your ideas’ status and take action as necessary.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
