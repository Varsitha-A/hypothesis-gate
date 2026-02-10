import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import adminBg from "../../assets/hypothesis1.jpg";
import "../../styles/admin.css";

const defaultStats = {
  totalUsers: 0,
  totalStudents: 0,
  totalMentors: 0,
  totalAdmins: 0,
  totalIdeas: 0,
  pendingIdeas: 0,
  reviewedIdeas: 0,
  approvedIdeas: 0,
  rejectedIdeas: 0,
  plagiarismFlagged: 0
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const res = await axios.get("/admin/stats");
      setStats({ ...defaultStats, ...(res.data || {}) });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load admin stats");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadStats();
      setLoading(false);
    };
    init();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  if (loading) return <p className="loading">Loading admin dashboard...</p>;

  return (
    <div className="admin-wrap" style={{ backgroundImage: `url(${adminBg})` }}>
      <div className="admin-head">
        <div>
          <h2 className="admin-title">Admin Dashboard</h2>
          <p className="admin-subtitle">System overview & monitoring</p>
        </div>

        <div className="admin-actions">
          <button className="admin-btn" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button className="admin-btn primary" onClick={() => navigate("/admin/assign")}>
            Assign Mentors
          </button>

          <button className="admin-btn" onClick={() => navigate("/admin/users")}>
            Manage Users
          </button>
        </div>
      </div>

      <div className="cards">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Students" value={stats.totalStudents} />
        <StatCard title="Mentors" value={stats.totalMentors} />
        <StatCard title="Admins" value={stats.totalAdmins} />

        <StatCard title="Total Ideas" value={stats.totalIdeas} />
        <StatCard title="Pending Ideas" value={stats.pendingIdeas} />
        <StatCard title="Reviewed Ideas" value={stats.reviewedIdeas} />
        <StatCard title="Approved Ideas" value={stats.approvedIdeas} />
        <StatCard title="Rejected Ideas" value={stats.rejectedIdeas} />
        <StatCard title="Plagiarism Flagged" value={stats.plagiarismFlagged} danger />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, danger }) => {
  return (
    <div className={`card ${danger ? "danger" : ""}`}>
      <h3>{title}</h3>
      <p>{Number(value) || 0}</p>
    </div>
  );
};

export default AdminDashboard;
