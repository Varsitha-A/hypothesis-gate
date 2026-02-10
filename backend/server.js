const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

/* =========================
   MIDDLEWARES
========================= */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   SERVE UPLOADED FILES
========================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   ROUTES
========================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/ideas", require("./routes/ideaRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Hypothesis-Gate Backend is running 🚀");
});

/* =========================
   CREATE HTTP SERVER + SOCKET.IO
========================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

/* =========================
   SOCKET EVENTS
========================= */
io.on("connection", (socket) => {
  socket.on("join", ({ conversationId }) => {
    if (conversationId) socket.join(conversationId);
  });

  socket.on("leave", ({ conversationId }) => {
    if (conversationId) socket.leave(conversationId);
  });

  socket.on("send_message", (payload) => {
    if (payload?.conversationId) {
      io.to(payload.conversationId).emit("new_message", payload);
    }
  });
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
