const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Approved", "Rejected"],
      required: true
    },
    message: {
      type: String,
      default: ""
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

/* ✅ Scores timeline for graphs (student view) */
const scoreHistorySchema = new mongoose.Schema(
  {
    feasibilityScore: { type: Number, default: 0 },
    similarityScore: { type: Number, default: 0 },
    plagiarismFlag: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ideaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    domain: { type: String, required: true, trim: true },

    submissionType: {
      type: String,
      enum: ["text", "file"],
      required: true
    },

    description: { type: String, default: "" },

    file: {
      fileName: { type: String, default: "" },
      fileUrl: { type: String, default: "" },
      fileType: { type: String, default: "" }
    },

    feasibilityScore: { type: Number, default: 0 },
    similarityScore: { type: Number, default: 0 },

    plagiarismFlag: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Approved", "Rejected"],
      default: "Pending"
    },

    isLocked: {
      type: Boolean,
      default: false
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assignedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    /* ✅ For chat linking (optional but useful) */
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null
    },

    lastReviewedAt: {
      type: Date,
      default: null
    },

    feedback: {
      type: [feedbackSchema],
      default: []
    },

    timeline: {
      type: [timelineSchema],
      default: []
    },

    notifications: {
      type: [notificationSchema],
      default: []
    },

    scoresHistory: {
      type: [scoreHistorySchema],
      default: []
    }
  },
  { timestamps: true }
);

/* ✅ Helpful indexes (faster dashboard queries) */
ideaSchema.index({ status: 1, createdAt: -1 });
ideaSchema.index({ createdBy: 1, createdAt: -1 });
ideaSchema.index({ assignedMentor: 1, status: 1 });

module.exports = mongoose.model("Idea", ideaSchema);
