const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// GET ALL USERS — Admin only
router.get(
  "/users",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const users = await User.find().select("-password");

      res.json({
        totalUsers: users.length,
        users
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET PENDING MENTOR REQUESTS — Admin only
router.get(
  "/pending-mentors",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const mentors = await User.find({
        role: "Mentor",
        isApproved: false
      }).select("-password");

      res.json({
        pendingCount: mentors.length,
        mentors
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// APPROVE MENTOR — Admin only
router.put(
  "/approve-mentor/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const mentor = await User.findById(req.params.id);

      if (!mentor || mentor.role !== "Mentor") {
        return res.status(404).json({ message: "Mentor not found" });
      }

      mentor.isApproved = true;
      await mentor.save();

      res.json({
        message: "Mentor approved successfully",
        mentorId: mentor._id
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ACTIVATE / DEACTIVATE USER — Admin only
router.put(
  "/toggle-user/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.isActive = !user.isActive;
      await user.save();

      res.json({
        message: `User ${
          user.isActive ? "activated" : "deactivated"
        } successfully`,
        userId: user._id,
        isActive: user.isActive
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
