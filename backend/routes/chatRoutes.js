const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const Idea = require("../models/Idea");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const getUserId = (req) => String(req.user?.id || req.user?._id || "");

/* =========================
   CREATE / GET CONVERSATION
========================= */
router.post("/conversation/:ideaId", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { ideaId } = req.params;

    const idea = await Idea.findById(ideaId)
      .populate("createdBy", "name email")
      .populate("assignedMentor", "name email");

    if (!idea) return res.status(404).json({ message: "Idea not found" });

    if (!idea.assignedMentor) {
      return res.status(400).json({ message: "Mentor not assigned. Chat unavailable." });
    }

    const isStudent = String(idea.createdBy._id) === userId;
    const isMentor = String(idea.assignedMentor._id) === userId;
    const isAdmin = req.user.role === "admin";

    if (!isStudent && !isMentor && !isAdmin) {
      return res.status(403).json({ message: "Chat not allowed" });
    }

    let convo = await Conversation.findOne({ ideaId });

    if (!convo) {
      convo = await Conversation.create({
        ideaId,
        studentId: idea.createdBy._id,
        mentorId: idea.assignedMentor._id
      });
    }

    const populated = await Conversation.findById(convo._id)
      .populate("studentId", "name email")
      .populate("mentorId", "name email")
      .populate("ideaId", "title domain status");

    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to start chat" });
  }
});

/* =========================
   GET MY CONVERSATIONS
========================= */
router.get("/my-conversations", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    const filter =
      req.user.role === "student"
        ? { studentId: userId }
        : req.user.role === "mentor"
        ? { mentorId: userId }
        : {};

    const convos = await Conversation.find(filter)
      .populate("studentId", "name email")
      .populate("mentorId", "name email")
      .populate("ideaId", "title domain status")
      .sort({ updatedAt: -1 });

    res.json(convos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
});

/* =========================
   GET MESSAGES (with sender + deleted support)
========================= */
router.get("/messages/:conversationId", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { conversationId } = req.params;

    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ message: "Conversation not found" });

    const allowed =
      String(convo.studentId) === userId ||
      String(convo.mentorId) === userId ||
      req.user.role === "admin";

    if (!allowed) return res.status(403).json({ message: "Not allowed" });

    const msgs = await Message.find({ conversationId })
      .populate("senderId", "name role")
      .sort({ createdAt: 1 });

    res.json(
      msgs.map((m) => ({
        _id: m._id,
        text: m.isDeleted ? "" : m.text,
        sender: m.senderId,
        createdAt: m.createdAt,
        isRead: m.isRead,
        file: m.isDeleted ? null : m.file,
        isDeleted: !!m.isDeleted,
        deletedAt: m.deletedAt
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

/* =========================
   SEND MESSAGE (return populated sender)
========================= */
router.post("/messages/:conversationId", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { conversationId } = req.params;
    const text = String(req.body.text || "").trim();

    if (!text) return res.status(400).json({ message: "Message text required" });

    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ message: "Conversation not found" });

    const isStudent = String(convo.studentId) === userId;
    const isMentor = String(convo.mentorId) === userId;

    if (!isStudent && !isMentor && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const receiverId = isStudent ? convo.mentorId : convo.studentId;

    const saved = await Message.create({
      conversationId,
      senderId: userId,
      receiverId,
      text
    });

    convo.updatedAt = new Date();
    await convo.save();

    const populated = await Message.findById(saved._id).populate("senderId", "name role");

    res.status(201).json({
      _id: populated._id,
      text: populated.text,
      sender: populated.senderId,
      createdAt: populated.createdAt,
      isRead: populated.isRead,
      file: populated.file,
      isDeleted: !!populated.isDeleted,
      deletedAt: populated.deletedAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

/* =========================
   DELETE MESSAGE (soft delete)
========================= */
router.delete("/messages/:messageId", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { messageId } = req.params;

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    const convo = await Conversation.findById(msg.conversationId);
    if (!convo) return res.status(404).json({ message: "Conversation not found" });

    const allowedInConvo =
      String(convo.studentId) === userId ||
      String(convo.mentorId) === userId ||
      req.user.role === "admin";

    if (!allowedInConvo) return res.status(403).json({ message: "Not allowed" });

    const canDelete = req.user.role === "admin" || String(msg.senderId) === userId;
    if (!canDelete) return res.status(403).json({ message: "Only sender/admin can delete" });

    msg.isDeleted = true;
    msg.text = "";
    msg.file = undefined;
    msg.deletedAt = new Date();
    msg.deletedBy = userId;

    await msg.save();

    res.json({ message: "Deleted", _id: msg._id, isDeleted: true, deletedAt: msg.deletedAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete message" });
  }
});

module.exports = router;
