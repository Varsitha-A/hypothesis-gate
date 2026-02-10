import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/student/StudentDashboard";
import SubmitIdea from "./pages/student/SubmitIdea";
import MyIdeas from "./pages/student/MyIdeas";

import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorIdeas from "./pages/mentor/MentorIdeas";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import AssignMentors from "./pages/admin/AssignMentors";

import ChatPage from "./pages/chat/ChatPage";

function App() {
  return (
    <Router>
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <main style={{ minHeight: "calc(100vh - 140px)" }}>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* STUDENT */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/submit"
            element={
              <ProtectedRoute role="student">
                <SubmitIdea />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/myideas"
            element={
              <ProtectedRoute role="student">
                <MyIdeas />
              </ProtectedRoute>
            }
          />

          {/* MENTOR */}
          <Route
            path="/mentor/dashboard"
            element={
              <ProtectedRoute role="mentor">
                <MentorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor/ideas"
            element={
              <ProtectedRoute role="mentor">
                <MentorIdeas />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="admin">
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assign"
            element={
              <ProtectedRoute role="admin">
                <AssignMentors />
              </ProtectedRoute>
            }
          />

          {/* CHAT */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat/:ideaId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </Router>
  );
}

export default App;
