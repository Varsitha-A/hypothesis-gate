import { useEffect, useState } from "react";
import axios from "../../api/axios";
import "../../styles/ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  const load = async () => {
    try {
      const res = await axios.get("/admin/users");
      const list = Array.isArray(res.data) ? res.data : [];
      setUsers(list);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load users");
      setUsers([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (id) => {
    try {
      await axios.put(`/admin/users/${id}/toggle`);
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const changeRole = async (id, role) => {
    try {
      await axios.put(`/admin/users/${id}/role`, { role });
      load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to change role");
    }
  };

  return (
    <div className="admin-wrap">
      <div className="manage-page">
        <h2 className="admin-title">Manage Users</h2>

        <div className="table">
          <div className="thead">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {users.map((u) => (
            <div className="trow" key={u._id}>
              <span>{u.name}</span>
              <span>{u.email}</span>

              <span>
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u._id, e.target.value)}
                >
                  <option value="student">student</option>
                  <option value="mentor">mentor</option>
                  <option value="admin">admin</option>
                </select>
              </span>

              <span className={u.isActive ? "active" : "inactive"}>
                {u.isActive ? "Active" : "Disabled"}
              </span>

              <span>
                <button className="btn" onClick={() => toggle(u._id)}>
                  {u.isActive ? "Deactivate" : "Activate"}
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
