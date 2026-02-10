import { useParams } from "react-router-dom";
import { useState } from "react";
import axios from "../../api/axios";

const IdeaDetail = () => {
  const { id } = useParams();
  const [feedback, setFeedback] = useState("");

  const submitReview = async () => {
    await axios.put(`/ideas/${id}/review`, {
      feedback,
      status: "reviewed"
    });
    alert("Review submitted");
  };

  return (
    <div className="idea-container">
      <h2>Evaluate Idea</h2>
      <textarea placeholder="Give feedback..." onChange={(e) => setFeedback(e.target.value)} />
      <button onClick={submitReview}>Submit Review</button>
    </div>
  );
};

export default IdeaDetail;
