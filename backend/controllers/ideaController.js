const Idea = require("../models/Idea");

exports.submitIdea = async (req, res) => {
  try {
    // Allow only Students to submit ideas
    if (req.user.role !== "Student") {
      return res.status(403).json({ message: "Only students can submit ideas" });
    }

    const {
      title,
      description,
      domain,
      keywords,
      datasetAvailable
    } = req.body;

    // Simple feasibility score logic (placeholder)
    const feasibilityScore = Math.floor(Math.random() * 40) + 60;

    const idea = await Idea.create({
      title,
      description,
      domain,
      keywords,
      datasetAvailable,
      feasibilityScore,
      studentId: req.user.id
    });

    res.status(201).json({
      message: "Idea submitted successfully",
      idea
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit idea"
    });
  }
};
