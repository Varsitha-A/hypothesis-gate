import React from "react";
import "../styles/About.css";

const About = () => {
  return (
    <div className="about-container">

      {/* Hero */}
      <section className="about-hero">
        <h1>About Hypothesis-Gate</h1>
        <p>
          Hypothesis-Gate is a secure academic platform designed to manage research
          idea submission, mentor evaluation, and progress tracking through a
          structured, role-based workflow.
        </p>
      </section>

      {/* Purpose */}
      <section className="about-section">
        <h2>Purpose</h2>
        <p>
          The platform eliminates informal and unstructured research coordination
          by providing a centralized system that ensures transparency,
          accountability, and efficient collaboration between students and mentors.
        </p>
      </section>

      {/* Key Features */}
      <section className="about-section">
        <h2>Key Features</h2>
        <ul>
          <li>Structured idea submission (text, PDF, document formats).</li>
          <li>Mentor assignment, review, and feedback workflows.</li>
          <li>Status tracking: pending, reviewed, approved, rejected.</li>
          <li>Secure real-time communication between students and mentors.</li>
          <li>Administrative monitoring and user management.</li>
        </ul>
      </section>

      {/* Security */}
      <section className="about-section">
        <h2>Security & Access Control</h2>
        <p>
          Hypothesis-Gate enforces role-based access control, protected APIs,
          and secure authentication to ensure data confidentiality and integrity
          across all user roles.
        </p>
      </section>

      {/* Benefits */}
      <section className="about-section">
        <h2>Benefits</h2>
        <ul>
          <li>Improves efficiency and clarity in research idea evaluation.</li>
          <li>Ensures transparent mentor–student collaboration.</li>
          <li>Maintains a complete digital record of ideas and feedback.</li>
          <li>Scalable for institutional academic use.</li>
        </ul>
      </section>

      {/* Conclusion */}
      <section className="about-section">
        <h2>Conclusion</h2>
        <p>
          Hypothesis-Gate provides a reliable and structured approach to academic
          research management, enabling institutions to streamline idea evaluation
          while maintaining security, transparency, and accountability.
        </p>
      </section>

    </div>
  );
};

export default About;
