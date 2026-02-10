const express = require("express");
const router = express.Router();
const Idea = require("../models/Idea");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ADD FEEDBACK — Mentors only
router.post(
  "/add/:ideaId",
  authMiddleware,
  roleMiddleware(["Mentor"]),
  async (req, res) => {
    try {
      const { comment } = req.body;

      if (!comment || comment.trim() === "") {
        return res.status(400).json({ message: "Feedback comment is required" });
      }

      const idea = await Idea.findById(req.params.ideaId);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      const alreadyGiven = idea.feedback.find(
        (fb) => fb.mentorId.toString() === req.user.id
      );

      if (alreadyGiven) {
        return res
          .status(400)
          .json({ message: "You have already given feedback for this idea" });
      }

      const feedbackEntry = {
        mentorId: req.user.id,
        comment
      };

      idea.feedback.push(feedbackEntry);
      await idea.save();

      res.status(201).json({
        message: "Feedback added successfully",
        feedback: feedbackEntry
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET FEEDBACK — Students / Mentors / Admin
router.get("/:ideaId", authMiddleware, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.ideaId).populate(
      "feedback.mentorId",
      "name email role expertise"
    );

    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    res.json({
      ideaId: idea._id,
      feedbackCount: idea.feedback.length,
      feedback: idea.feedback
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
