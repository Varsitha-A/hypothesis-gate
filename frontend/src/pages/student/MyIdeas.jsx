import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import "../../styles/myideas.css";

const clamp = (v) => Math.max(0, Math.min(100, Number(v || 0)));

const labelFromScore = (v) => {
  const n = Number(v || 0);
  if (n >= 85) return "Excellent";
  if (n >= 70) return "Good";
  if (n >= 50) return "Moderate";
  if (n >= 30) return "Low";
  return "Very Low";
};

const isHighSimilarity = (sim) => clamp(sim) >= 60;

const recFromScores = (feas, sim) => {
  const f = clamp(feas);
  const s = clamp(sim);

  if (s >= 60) return { text: "Revise for originality", tone: "danger" };
  if (f >= 75 && s <= 35) return { text: "Proceed to next milestone", tone: "good" };
  if (f >= 55) return { text: "Proceed with improvements", tone: "warn" };
  return { text: "Needs revision before review", tone: "warn" };
};

const buildRubric = (idea) => {
  const feas = clamp(idea.feasibilityScore);
  const sim = clamp(idea.similarityScore);
  const originality = clamp(100 - sim);

  const technicalDepth = clamp(feas * 0.7 + originality * 0.3);
  const novelty = clamp(originality * 0.8 + feas * 0.2);
  const clarity = clamp(feas * 0.55 + originality * 0.45);
  const impact = clamp(feas * 0.65 + originality * 0.35);

  return [
    { k: "Originality", v: originality, hint: "Lower similarity improves this score" },
    { k: "Technical Depth", v: technicalDepth, hint: "Feasibility-weighted estimate" },
    { k: "Novelty", v: novelty, hint: "Originality-weighted estimate" },
    { k: "Clarity", v: clarity, hint: "Estimated based on submission quality" },
    { k: "Impact Potential", v: impact, hint: "Estimated based on feasibility and novelty" }
  ];
};

const pickNextActions = (idea) => {
  const sim = clamp(idea.similarityScore);
  const feas = clamp(idea.feasibilityScore);

  const actions = [];
  if (idea.submissionType === "text") {
    actions.push("Attach a reference document (PDF/Word) to support the problem statement.");
  }
  actions.push("Add 3–5 key references and a short literature gap summary.");
  if (sim >= 40) actions.push("Rewrite overlapping sections and add novel contribution points.");
  if (feas < 60) actions.push("Refine scope: reduce complexity, clarify inputs/outputs, and define constraints.");
  actions.push("Define milestones: literature review, methodology, prototype, evaluation, report.");
  return actions.slice(0, 4);
};

const MyIdeas = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState({});

  useEffect(() => {
    fetchMyIdeas();
  }, []);

  const fetchMyIdeas = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/ideas/my");
      setIdeas(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch your ideas");
    } finally {
      setLoading(false);
    }
  };

  const handleChat = (ideaId) => {
    navigate(`/chat?ideaId=${ideaId}`);
  };

  const toggleOpen = (ideaId, key) => {
    setOpen((p) => ({
      ...p,
      [ideaId]: { ...(p[ideaId] || {}), [key]: !(p[ideaId]?.[key]) }
    }));
  };

  if (loading) return <p className="loading">Loading your ideas...</p>;

  return (
    <div className="myideas-container">
      <div className="myideas-header">
        <div>
          <h2 className="title">My Submitted Ideas</h2>
          <p className="subtitle">Track status, mentor review, rubric scores, and next actions.</p>
        </div>

        <button className="refresh-btn" onClick={fetchMyIdeas}>
          Refresh
        </button>
      </div>

      {ideas.length === 0 ? (
        <p className="empty">You have not submitted any ideas yet.</p>
      ) : (
        ideas.map((idea) => {
          const feas = clamp(idea.feasibilityScore);
          const sim = clamp(idea.similarityScore);
          const originality = clamp(100 - sim);

          const rubric = buildRubric(idea);
          const recommendation = recFromScores(feas, sim);
          const nextActions = pickNextActions(idea);

          const confidenceValue = clamp(feas * 0.55 + originality * 0.45);
          const conf =
            confidenceValue >= 80
              ? { text: "High", tone: "good" }
              : confidenceValue >= 60
              ? { text: "Medium", tone: "warn" }
              : { text: "Low", tone: "danger" };

          const showRubric = !!open[idea._id]?.rubric;
          const showActions = !!open[idea._id]?.actions;
          const showDetails = !!open[idea._id]?.details;

          const showSimilarityWarning = isHighSimilarity(sim);

          return (
            <div className="idea-card" key={idea._id}>
              <div className="idea-top">
                <div>
                  <h3 className="idea-title">{idea.title}</h3>
                  <p className="meta">
                    <span>Domain:</span> {idea.domain}
                  </p>
                </div>

                <span className={`pill status-${String(idea.status || "pending").toLowerCase()}`}>
                  {idea.status}
                </span>
              </div>

              <div className="mini-row">
                <div className="mini-pill">
                  <span className="mini-k">Confidence</span>
                  <span className={`mini-v tone-${conf.tone}`}>{conf.text}</span>
                </div>

                <div className="mini-pill">
                  <span className="mini-k">Recommendation</span>
                  <span className={`mini-v tone-${recommendation.tone}`}>{recommendation.text}</span>
                </div>

                <div className="mini-pill">
                  <span className="mini-k">Originality</span>
                  <span className="mini-v">{originality}%</span>
                </div>
              </div>

              {idea.submissionType === "file" && idea.file?.fileUrl ? (
                <a
                  className="file-link"
                  href={`http://localhost:5000${idea.file.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  📄 View Uploaded File
                </a>
              ) : null}

              {idea.submissionType === "text" && idea.description ? (
                <p className={`desc ${showDetails ? "show" : ""}`}>
                  {showDetails
                    ? idea.description
                    : `${String(idea.description).slice(0, 220)}${idea.description.length > 220 ? "..." : ""}`}
                </p>
              ) : null}

              {idea.submissionType === "text" && idea.description ? (
                <button className="link-btn" onClick={() => toggleOpen(idea._id, "details")}>
                  {showDetails ? "Hide details" : "View details"}
                </button>
              ) : null}

              <div className="scores-row">
                <div className="scoreBox">
                  <div className="scoreTop">
                    <div className="scoreLabel">Feasibility</div>
                    <div className="scoreTag">{labelFromScore(feas)}</div>
                  </div>
                  <div className="bar">
                    <div className="fill" style={{ width: `${feas}%` }} />
                  </div>
                  <div className="scoreValue">{feas}%</div>
                </div>

                <div className="scoreBox">
                  <div className="scoreTop">
                    <div className="scoreLabel">Similarity</div>
                    <div className={`scoreTag ${sim >= 60 ? "bad" : sim >= 40 ? "warn" : "good"}`}>
                      {labelFromScore(100 - sim)}
                    </div>
                  </div>
                  <div className="bar">
                    <div className="fill" style={{ width: `${sim}%` }} />
                  </div>
                  <div className="scoreValue">{sim}%</div>
                </div>
              </div>

              {showSimilarityWarning ? (
                <div className="warn">⚠️ High similarity detected. Please revise for originality.</div>
              ) : null}

              <div className="split-actions">
                <button className="chip-btn" onClick={() => toggleOpen(idea._id, "rubric")}>
                  {showRubric ? "Hide Rubric" : "View Rubric"}
                </button>
                <button className="chip-btn" onClick={() => toggleOpen(idea._id, "actions")}>
                  {showActions ? "Hide Next Actions" : "Next Actions"}
                </button>
              </div>

              {showRubric ? (
                <div className="rubric">
                  <h4>Evaluation Rubric</h4>
                  <div className="rubricGrid">
                    {rubric.map((r, idx) => (
                      <div className="rubricItem" key={idx}>
                        <div className="rubricTop">
                          <div className="rubricKey">{r.k}</div>
                          <div className="rubricVal">{clamp(r.v)}%</div>
                        </div>
                        <div className="bar thin">
                          <div className="fill" style={{ width: `${clamp(r.v)}%` }} />
                        </div>
                        <div className="rubricHint">{r.hint}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {showActions ? (
                <div className="nextActions">
                  <h4>Suggested Next Actions</h4>
                  <ul>
                    {nextActions.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="idea-actions">
                <button className="chat-btn" onClick={() => handleChat(idea._id)}>
                  💬 Chat with Mentor
                </button>

                <div className="meta small">
                  <span>Submitted:</span>{" "}
                  {idea.createdAt ? new Date(idea.createdAt).toLocaleString() : "-"}
                </div>
              </div>

              {Array.isArray(idea.feedback) && idea.feedback.length > 0 ? (
                <div className="feedback">
                  <h4>Mentor Feedback</h4>
                  {idea.feedback.map((f, i) => (
                    <div key={i} className="feedbackItem">
                      <div className="who">
                        {f.mentorId?.name || "Mentor"}{" "}
                        <span className="time">
                          ({f.createdAt ? new Date(f.createdAt).toLocaleString() : ""})
                        </span>
                      </div>
                      <div className="msg">{f.comment}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="noFeedback">No mentor feedback yet.</p>
              )}

              {Array.isArray(idea.timeline) && idea.timeline.length > 0 ? (
                <div className="timeline">
                  <h4>Progress Timeline</h4>
                  {idea.timeline.map((t, idx) => (
                    <div className="timelineItem" key={idx}>
                      <div className="tStatus">{t.status}</div>
                      <div className="tMsg">{t.message || "-"}</div>
                      <div className="tTime">{t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {idea.isLocked ? <div className="lockNote">🔒 This idea is locked after mentor decision.</div> : null}
            </div>
          );
        })
      )}
    </div>
  );
};

export default MyIdeas;
