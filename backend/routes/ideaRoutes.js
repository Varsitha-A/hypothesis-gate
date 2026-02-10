const express = require("express");
const router = express.Router();
const Idea = require("../models/Idea");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");
const calculateFeasibility = require("../utils/feasibilityScorer");
const similarityScore = require("../utils/similarityChecker");
const sendEmail = require("../utils/SendEmail");

/* =========================
   STUDENT: SUBMIT IDEA
========================= */
router.post(
  "/add",
  authMiddleware,
  roleMiddleware(["student"]),
  upload.single("file"),
  async (req, res) => {
    try {
      const { title, domain, description } = req.body;

      if (!title || !domain) {
        return res.status(400).json({ message: "Title and domain are required" });
      }

      const submissionType = req.file ? "file" : "text";

      if (submissionType === "text" && !description) {
        return res.status(400).json({ message: "Description required for text submission" });
      }

      const existingIdeas = await Idea.find({}, "title description");
      let highestSimilarity = 0;

      existingIdeas.forEach((idea) => {
        const score = similarityScore(
          `${title} ${description || ""}`,
          `${idea.title} ${idea.description || ""}`
        );
        if (score > highestSimilarity) highestSimilarity = score;
      });

      const feasibilityScore = calculateFeasibility(req.body);
      const plagiarismFlag = highestSimilarity >= 70;

      const idea = await Idea.create({
        title,
        domain,
        submissionType,
        description: submissionType === "text" ? description : null,
        file: req.file
          ? {
              fileName: req.file.originalname,
              fileUrl: `/uploads/ideas/${req.file.filename}`,
              fileType: req.file.mimetype
            }
          : null,
        feasibilityScore,
        similarityScore: highestSimilarity,
        plagiarismFlag,
        createdBy: req.user.id,
        status: "Pending",
        isLocked: false,
        timeline: [
          {
            status: "Pending",
            message: plagiarismFlag
              ? "Idea submitted (High similarity detected - Plagiarism Warning)."
              : "Idea submitted successfully",
            updatedBy: req.user.id
          }
        ],
        notifications: []
      });

      res.status(201).json({
        message: plagiarismFlag
          ? "Idea submitted. High similarity detected (Plagiarism Warning)."
          : "Idea submitted successfully",
        idea
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Idea submission failed" });
    }
  }
);

/* =========================
   STUDENT: VIEW MY IDEAS
========================= */
router.get(
  "/my",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const ideas = await Idea.find({ createdBy: req.user.id })
        .populate("feedback.mentorId", "name email")
        .populate("timeline.updatedBy", "name email")
        .sort({ createdAt: -1 });

      res.json(ideas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch student ideas" });
    }
  }
);

/* =========================
   STUDENT: EDIT IDEA (BLOCK IF LOCKED)
========================= */
router.put(
  "/:id/edit",
  authMiddleware,
  roleMiddleware(["student"]),
  upload.single("file"),
  async (req, res) => {
    try {
      const idea = await Idea.findById(req.params.id);
      if (!idea) return res.status(404).json({ message: "Idea not found" });

      if (idea.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not allowed" });
      }

      if (idea.isLocked) {
        return res.status(403).json({ message: "Editing locked after mentor decision" });
      }

      const { title, domain, description } = req.body;

      if (title) idea.title = title;
      if (domain) idea.domain = domain;
      if (description) idea.description = description;

      if (req.file) {
        idea.submissionType = "file";
        idea.file = {
          fileName: req.file.originalname,
          fileUrl: `/uploads/ideas/${req.file.filename}`,
          fileType: req.file.mimetype
        };
      }

      await idea.save();
      res.json({ message: "Idea updated", idea });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Update failed" });
    }
  }
);

/* =========================
   MENTOR: VIEW PENDING IDEAS
========================= */
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware(["mentor"]),
  async (req, res) => {
    try {
      const ideas = await Idea.find({ status: "Pending" })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

      res.json(ideas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch ideas" });
    }
  }
);

/* =========================
   MENTOR: ANALYZE IDEA (SAVE SCORES)
========================= */
router.put(
  "/:id/analyze",
  authMiddleware,
  roleMiddleware(["mentor"]),
  async (req, res) => {
    try {
      const { feasibilityScore, similarityScore: simScore } = req.body;

      const idea = await Idea.findById(req.params.id).populate("createdBy", "name email");
      if (!idea) return res.status(404).json({ message: "Idea not found" });

      if (typeof feasibilityScore === "number") idea.feasibilityScore = feasibilityScore;
      if (typeof simScore === "number") idea.similarityScore = simScore;

      idea.timeline.push({
        status: idea.status,
        message: `Mentor analysis updated (Feasibility: ${idea.feasibilityScore}%, Similarity: ${idea.similarityScore}%)`,
        updatedBy: req.user.id
      });

      await idea.save();

      res.json({ message: "Analysis saved", idea });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Analyze failed" });
    }
  }
);

/* =========================
   MENTOR: REVIEW / APPROVE / REJECT
========================= */
router.put(
  "/:id/review",
  authMiddleware,
  roleMiddleware(["mentor"]),
  async (req, res) => {
    try {
      const { status, feedback } = req.body;

      if (!["Approved", "Rejected", "Reviewed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const idea = await Idea.findById(req.params.id).populate("createdBy", "name email");
      if (!idea) return res.status(404).json({ message: "Idea not found" });

      idea.status = status;

      if (status === "Approved" || status === "Rejected") {
        idea.isLocked = true;
      }

      if (feedback && feedback.trim() !== "") {
        idea.feedback.push({
          mentorId: req.user.id,
          comment: feedback
        });
      }

      idea.timeline.push({
        status,
        message: feedback || `Mentor marked as ${status}`,
        updatedBy: req.user.id
      });

      idea.notifications.push({
        userId: idea.createdBy._id,
        title: `Idea ${status}`,
        message: feedback
          ? `Mentor feedback: ${feedback}`
          : `Your idea was marked as ${status}`,
        isRead: false
      });

      await idea.save();

      try {
        await sendEmail({
          to: idea.createdBy.email,
          subject: `Your idea "${idea.title}" has been ${status}`,
          text: feedback
            ? `Status: ${status}\n\nMentor Feedback:\n${feedback}`
            : `Status: ${status}\n\nNo feedback provided.`
        });
      } catch (e) {
        console.log("Email failed, continuing...");
      }

      res.json({ message: "Idea reviewed successfully", idea });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Review failed" });
    }
  }
);

/* =========================
   STUDENT: GET NOTIFICATIONS
========================= */
router.get(
  "/notifications",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const ideas = await Idea.find({ createdBy: req.user.id }, "notifications");
      const notifications = ideas.flatMap((i) => i.notifications || []);
      notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json(notifications);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  }
);

/* =========================
   STUDENT: MARK NOTIFICATION AS READ
========================= */
router.put(
  "/notifications/:id/read",
  authMiddleware,
  roleMiddleware(["student"]),
  async (req, res) => {
    try {
      const ideas = await Idea.find({ createdBy: req.user.id });

      for (const idea of ideas) {
        const notif = idea.notifications.id(req.params.id);
        if (notif) {
          notif.isRead = true;
          await idea.save();
          return res.json({ message: "Notification marked as read" });
        }
      }

      res.status(404).json({ message: "Notification not found" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update notification" });
    }
  }
);

module.exports = router;
