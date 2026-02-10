import { useEffect, useState } from "react";
import axios from "../../api/axios";
import "../../styles/dashboard.css";

const ReviewIdeas = () => {
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    axios.get("/ideas/pending").then(res => setIdeas(res.data));
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Pending Ideas</h1>

      {ideas.map(idea => (
        <div className="card" key={idea._id}>
          <h3>{idea.title}</h3>
          <p><b>Student:</b> {idea.student.name}</p>
          <p><b>Domain:</b> {idea.domain}</p>

          {idea.file && (
            <a
              href={`http://localhost:5000/uploads/ideas/${idea.file}`}
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              View File
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewIdeas;
