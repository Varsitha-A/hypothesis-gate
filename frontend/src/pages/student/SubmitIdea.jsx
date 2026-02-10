import React, { useState } from "react";
import axios from "../../api/axios";
import "../../styles/idea.css";

const SubmitIdea = () => {
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("domain", domain);

    if (description.trim() !== "") {
      formData.append("description", description);
    }

    if (file) {
      formData.append("file", file);
    }

    try {
      await axios.post("/ideas/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Idea submitted successfully ✅");

      setTitle("");
      setDomain("");
      setDescription("");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Submission failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="idea-form">
      <h2>Submit Your Research Idea</h2>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          placeholder="Idea Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Domain (AI, ML, Web, Health, etc.)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          required
        />

        <textarea
          placeholder="Idea Description (optional if uploading file)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Idea"}
        </button>
      </form>
    </div>
  );
};

export default SubmitIdea;
