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
</div>
  );
};

export default About;
