import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";
import "../../styles/assignMentors.css";

const AssignMentors = () => {
  const [ideas, setIdeas] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState({});
  const [onlyUnassigned, setOnlyUnassigned] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [ideasRes, usersRes] = await Promise.all([
        axios.get("/admin/ideas"),
        axios.get("/admin/users")
      ]);

      const allIdeas = Array.isArray(ideasRes.data) ? ideasRes.data : [];
      const allUsers = Array.isArray(usersRes.data) ? usersRes.data : [];

      const mentorList = allUsers.filter((u) => u.role === "mentor" && u.isActive !== false);

      setIdeas(allIdeas);
      setMentors(mentorList);

      const init = {};
      let i = 0;
      while (i < allIdeas.length) {
        const idea = allIdeas[i];
        init[idea._id] = idea.assignedMentor?._id || "";
        i += 1;
      }
      setSelected(init);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load ideas/users");
      setIdeas([]);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visibleIdeas = useMemo(() => {
    if (!onlyUnassigned) return ideas;
    return ideas.filter((i) => !i.assignedMentor);
  }, [ideas, onlyUnassigned]);

  const assign = async (ideaId) => {
    const mentorId = selected[ideaId];
    if (!mentorId) return alert("Please select a mentor");

    try {
      await axios.put(`/admin/ideas/${ideaId}/assign-mentor`, { mentorId });
      alert("Mentor assigned ✅");
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Assign failed");
    }
  };

  if (loading) return <p className="loading">Loading assign panel...</p>;

  return (
    <div className="admin-wrap">
      <div className="assign-page">
        <div className="admin-head">
          <div>
            <h2 className="admin-title">Assign Mentors</h2>
            <p className="admin-subtitle">Assign mentors to student ideas for review & chat.</p>
          </div>
        </div>

        <div className="admin-toolbar">
          <label className="toggle">
            <input
              type="checkbox"
              checked={onlyUnassigned}
              onChange={(e) => setOnlyUnassigned(e.target.checked)}
            />
            Show only unassigned ideas
          </label>

          <button className="btn btn-outline" onClick={load}>
            Refresh
          </button>
        </div>

        {visibleIdeas.length === 0 ? (
          <p className="empty">No ideas found.</p>
        ) : (
          visibleIdeas.map((idea) => (
            <div className="assign-card" key={idea._id}>
              <div className="assign-info">
                <h3 className="assign-title">{idea.title}</h3>

                <p className="assign-line">
                  <b>Student:</b> {idea.createdBy?.name} ({idea.createdBy?.email})
                </p>

                <p className="assign-line">
                  <b>Status:</b>{" "}
                  <span className={`pill status-${String(idea.status).toLowerCase()}`}>
                    {idea.status}
                  </span>
                </p>

                <p className="assign-line">
                  <b>Current Mentor:</b>{" "}
                  {idea.assignedMentor?.name ? (
                    <>
                      {idea.assignedMentor.name} ({idea.assignedMentor.email})
                    </>
                  ) : (
                    "Not assigned"
                  )}
                </p>
              </div>

              <div className="assign-actions">
                <select
                  value={selected[idea._id] || ""}
                  onChange={(e) =>
                    setSelected((prev) => ({
                      ...prev,
                      [idea._id]: e.target.value
                    }))
                  }
                >
                  <option value="" disabled>
                    Select Mentor
                  </option>

                  {mentors.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>

                <button className="btn btn-primary" onClick={() => assign(idea._id)}>
                  Assign
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignMentors;
