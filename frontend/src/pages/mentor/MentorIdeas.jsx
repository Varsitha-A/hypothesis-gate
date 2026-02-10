import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import "../../styles/MentorIdeas.css";

const clamp = (v) => Math.max(0, Math.min(100, Number(v || 0)));

const MentorIdeas = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState({});
  const [scores, setScores] = useState({});
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const res = await axios.get("/ideas/pending");
      setIdeas(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch ideas");
    } finally {
      setLoading(false);
    }
  };

  const updateScores = (ideaId, patch) => {
    setScores((prev) => ({
      ...prev,
      [ideaId]: {
        ...(prev[ideaId] || {}),
        ...patch
      }
    }));
  };

  const handleAnalyze = async (ideaId) => {
    const feasibility = clamp(scores[ideaId]?.feasibilityScore);
    const similarity = clamp(scores[ideaId]?.similarityScore);

    setBusyId(ideaId);
    try {
      await axios.put(`/ideas/${ideaId}/analyze`, {
        feasibilityScore: feasibility,
        similarityScore: similarity
      });
      await fetchIdeas();
      alert("Analysis saved ✅");
    } catch (err) {
      alert(err.response?.data?.message || "Analyze failed");
    } finally {
      setBusyId(null);
    }
  };

  const reviewIdea = async (id, status) => {
    const feedback = (comments[id] || "").trim();

    setBusyId(id);
    try {
      await axios.put(`/ideas/${id}/review`, {
        status,
        feedback
      });

      setComments((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      await fetchIdeas();
      alert(`Idea marked ${status} ✅`);
    } catch (err) {
      alert(err.response?.data?.message || "Review failed");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="loading">Loading ideas...</p>;

  return (
    <div className="mentor-container">
      <div className="mentor-header">
        <div>
          <h2 className="title">Mentor Review Panel</h2>
          <p className="subtitle">
            Review pending student submissions, analyze scores, send feedback, and open chat.
          </p>
        </div>

        <button className="refresh-btn" onClick={fetchIdeas}>
          Refresh
        </button>
      </div>

      {ideas.length === 0 ? (
        <p className="empty">No pending ideas</p>
      ) : (
        ideas.map((idea) => {
          const statusClass = `status-${String(idea.status || "pending").toLowerCase()}`;

          return (
            <div key={idea._id} className="idea-card">
              <div className="idea-top">
                <div>
                  <h3 className="idea-title">{idea.title}</h3>
                  <p className="meta">
                    <span>Domain:</span> {idea.domain}
                  </p>
                </div>

                <span className={`pill ${statusClass}`}>{idea.status}</span>
              </div>

              {idea.description ? (
                <p className="desc">
                  <span>Description:</span> {idea.description}
                </p>
              ) : null}

              <div className="scores-row">
                <div className="scoreBox">
                  <div className="scoreLabel">Feasibility</div>
                  <div className="bar">
                    <div className="fill" style={{ width: `${clamp(idea.feasibilityScore)}%` }} />
                  </div>
                  <div className="scoreValue">{clamp(idea.feasibilityScore)}%</div>
                </div>

                <div className="scoreBox">
                  <div className="scoreLabel">Similarity</div>
                  <div className="bar">
                    <div className="fill" style={{ width: `${clamp(idea.similarityScore)}%` }} />
                  </div>
                  <div className="scoreValue">{clamp(idea.similarityScore)}%</div>
                </div>
              </div>

              <div className="studentRow">
                <p className="studentText">
                  <span>Student:</span> {idea.createdBy?.name} ({idea.createdBy?.email})
                </p>

                <div className="rightLinks">
                  {idea.file?.fileUrl ? (
                    <a
                      className="file-link"
                      href={`http://localhost:5000${idea.file.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📄 View Uploaded File
                    </a>
                  ) : null}

                  <Link className="chat-link" to={`/chat/${idea._id}`}>
                    💬 Open Chat
                  </Link>
                </div>
              </div>

              <div className="mentor-tools">
                <div className="analyze-box">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Feasibility (0-100)"
                    value={scores[idea._id]?.feasibilityScore ?? ""}
                    onChange={(e) => updateScores(idea._id, { feasibilityScore: e.target.value })}
                  />

                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Similarity (0-100)"
                    value={scores[idea._id]?.similarityScore ?? ""}
                    onChange={(e) => updateScores(idea._id, { similarityScore: e.target.value })}
                  />

                  <button
                    className="analyze"
                    onClick={() => handleAnalyze(idea._id)}
                    disabled={busyId === idea._id}
                  >
                    {busyId === idea._id ? "Saving..." : "Analyze & Save"}
                  </button>
                </div>

                <textarea
                  className="feedbackBox"
                  placeholder="Mentor feedback..."
                  value={comments[idea._id] || ""}
                  onChange={(e) =>
                    setComments((prev) => ({
                      ...prev,
                      [idea._id]: e.target.value
                    }))
                  }
                />

                <div className="btns">
                  <button
                    className="approve"
                    onClick={() => reviewIdea(idea._id, "Approved")}
                    disabled={busyId === idea._id}
                  >
                    Approve
                  </button>

                  <button
                    className="reject"
                    onClick={() => reviewIdea(idea._id, "Rejected")}
                    disabled={busyId === idea._id}
                  >
                    Reject
                  </button>

                  <button
                    className="reviewed"
                    onClick={() => reviewIdea(idea._id, "Reviewed")}
                    disabled={busyId === idea._id}
                  >
                    Mark Reviewed
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MentorIdeas;
