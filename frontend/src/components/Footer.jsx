import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-brand">
          <h3>Hypothesis-Gate</h3>
          <p>
            A secure and structured platform for academic idea submission,
            evaluation, and mentor collaboration.
          </p>
        </div>

        <div className="footer-links">
          <h4>Platform</h4>
          <ul>
            <li>Idea Submission</li>
            <li>Mentor Review</li>
            <li>Progress Tracking</li>
            <li>Secure Chat</li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>System</h4>
          <ul>
            <li>Role-Based Access</li>
            <li>Authentication</li>
            <li>Data Security</li>
            <li>Audit & Monitoring</li>
          </ul>
        </div>

        <div className="footer-meta">
          <h4>Academic Use</h4>
          <p>
            Designed for educational institutions to manage research ideas
            with transparency and accountability.
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Hypothesis-Gate. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
