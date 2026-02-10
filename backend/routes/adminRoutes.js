const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const User = require("../models/User");
const Idea = require("../models/Idea");

/* =========================
   ADMIN: DASHBOARD STATS
========================= */
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalStudents = await User.countDocuments({ role: "student" });
      const totalMentors = await User.countDocuments({ role: "mentor" });
      const totalAdmins = await User.countDocuments({ role: "admin" });

      const totalIdeas = await Idea.countDocuments();
      const pendingIdeas = await Idea.countDocuments({ status: "Pending" });
      const reviewedIdeas = await Idea.countDocuments({ status: "Reviewed" });
      const approvedIdeas = await Idea.countDocuments({ status: "Approved" });
      const rejectedIdeas = await Idea.countDocuments({ status: "Rejected" });
      const plagiarismFlagged = await Idea.countDocuments({ plagiarismFlag: true });

      res.json({
        totalUsers,
        totalStudents,
        totalMentors,
        totalAdmins,
        totalIdeas,
        pendingIdeas,
        reviewedIdeas,
        approvedIdeas,
        rejectedIdeas,
        plagiarismFlagged
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  }
);

/* =========================
   ADMIN: GET ALL USERS
========================= */
router.get(
  "/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  }
);

/* =========================
   ADMIN: ACTIVATE / DEACTIVATE USER
========================= */
router.put(
  "/users/:id/toggle",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.role === "admin") {
        return res.status(403).json({ message: "Cannot deactivate admin" });
      }

      user.isActive = !user.isActive;
      await user.save();

      res.json({
        message: "User status updated",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to update user status" });
    }
  }
);

/* =========================
   ADMIN: GET ALL IDEAS
========================= */
router.get(
  "/ideas",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const ideas = await Idea.find()
        .populate("createdBy", "name email role")
        .populate("assignedMentor", "name email role")
        .populate("feedback.mentorId", "name email")
        .sort({ createdAt: -1 });

      res.json(ideas);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch ideas" });
    }
  }
);

/* =========================
   ADMIN: LOCK / UNLOCK IDEA
========================= */
router.put(
  "/ideas/:id/lock",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { isLocked } = req.body;

      const idea = await Idea.findById(req.params.id);
      if (!idea) return res.status(404).json({ message: "Idea not found" });

      idea.isLocked = Boolean(isLocked);
      await idea.save();

      res.json({ message: "Idea lock updated", idea });
    } catch (err) {
      res.status(500).json({ message: "Failed to update lock" });
    }
  }
);

/* =========================
   ✅ ADMIN: ASSIGN MENTOR TO IDEA
   (THIS ENABLES CHAT)
========================= */
router.put(
  "/ideas/:id/assign-mentor",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { mentorId } = req.body;
      if (!mentorId) {
        return res.status(400).json({ message: "mentorId is required" });
      }

      const mentor = await User.findById(mentorId);
      if (!mentor || mentor.role !== "mentor") {
        return res.status(400).json({ message: "Invalid mentor" });
      }

      const idea = await Idea.findById(req.params.id);
      if (!idea) return res.status(404).json({ message: "Idea not found" });

      idea.assignedMentor = mentorId;

      idea.timeline.push({
        status: idea.status,
        message: `Mentor assigned: ${mentor.name} (${mentor.email})`,
        updatedBy: req.user.id
      });

      await idea.save();

      const updatedIdea = await Idea.findById(req.params.id)
        .populate("createdBy", "name email role")
        .populate("assignedMentor", "name email role");

      res.json({
        message: "Mentor assigned successfully",
        idea: updatedIdea
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to assign mentor" });
    }
  }
);

module.exports = router;
