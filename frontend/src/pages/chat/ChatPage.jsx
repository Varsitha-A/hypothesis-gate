import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../../api/axios";
import "../../styles/chat.css";
import { AuthContext } from "../../context/AuthContext";

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role;

  const [searchParams] = useSearchParams();
  const ideaIdFromUrl = searchParams.get("ideaId");

  const [myIdeas, setMyIdeas] = useState([]);
  const [mentorIdeas, setMentorIdeas] = useState([]);
  const [conversations, setConversations] = useState([]);

  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");

  const [loadingLeft, setLoadingLeft] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const msgEndRef = useRef(null);

  const activeTitle = useMemo(() => {
    if (!activeConvo?.ideaId) return "";
    const t = activeConvo.ideaId.title || "Idea";
    const d = activeConvo.ideaId.domain || "";
    return d ? `${t} • ${d}` : t;
  }, [activeConvo]);

  const scrollToBottom = () => {
    if (msgEndRef.current) msgEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const fetchIdeasForChat = async () => {
    setLoadingLeft(true);
    try {
      if (role === "student") {
        const res = await axios.get("/ideas/my");
        const eligible = (res.data || []).filter((i) => i.assignedMentor);
        setMyIdeas(eligible);
        setMentorIdeas([]);
      } else if (role === "mentor") {
        const res = await axios.get("/ideas/assigned");
        setMentorIdeas(res.data || []);
        setMyIdeas([]);
      } else {
        setMyIdeas([]);
        setMentorIdeas([]);
      }
    } catch {
      setMyIdeas([]);
      setMentorIdeas([]);
    } finally {
      setLoadingLeft(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await axios.get("/chat/my-conversations");
      setConversations(res.data || []);
      return res.data || [];
    } catch {
      setConversations([]);
      return [];
    }
  };

  const openConversation = async (conversationId) => {
    if (!conversationId) return;
    setLoadingMsgs(true);
    try {
      const convo = conversations.find((c) => c._id === conversationId);
      if (convo) setActiveConvo(convo);

      const res = await axios.get(`/chat/messages/${conversationId}`);
      setMessages(res.data || []);
      setTimeout(scrollToBottom, 50);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const startChatForIdea = async (ideaId) => {
    if (!ideaId) return;
    setLoadingMsgs(true);
    try {
      const res = await axios.post(`/chat/conversation/${ideaId}`);
      const convo = res.data;

      setActiveConvo(convo);

      const updated = await fetchConversations();
      const found = updated.find((c) => c._id === convo._id);
      if (found) setActiveConvo(found);

      const msgs = await axios.get(`/chat/messages/${convo._id}`);
      setMessages(msgs.data || []);
      setTimeout(scrollToBottom, 50);
    } catch (e) {
      alert(e.response?.data?.message || "Unable to start chat");
    } finally {
      setLoadingMsgs(false);
    }
  };

  const sendMessage = async () => {
    const text = (msgText || "").trim();
    if (!activeConvo?._id || !text) return;

    setSending(true);
    try {
      const res = await axios.post(`/chat/messages/${activeConvo._id}`, { text });
      setMessages((prev) => [...prev, res.data]);
      setMsgText("");
      setTimeout(scrollToBottom, 50);
    } catch {
      alert("Message failed");
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!activeConvo?._id || !messageId) return;

    const ok = window.confirm("Delete this message? This will hide it for both users.");
    if (!ok) return;

    try {
      await axios.delete(`/chat/messages/${messageId}`);

      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId)
            ? { ...m, isDeleted: true, text: "", file: null }
            : m
        )
      );
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed");
    }
  };

  useEffect(() => {
    if (!role) return;
    fetchIdeasForChat();
    fetchConversations();
  }, [role]);

  useEffect(() => {
    if (!role) return;
    if (!ideaIdFromUrl) return;
    startChatForIdea(ideaIdFromUrl);
  }, [role, ideaIdFromUrl]);

  useEffect(() => {
    if (!activeConvo?._id) return;

    const poll = async () => {
      try {
        const res = await axios.get(`/chat/messages/${activeConvo._id}`);
        setMessages(res.data || []);
      } catch {}
    };

    poll();
    const timer = setInterval(poll, 2500);
    return () => clearInterval(timer);
  }, [activeConvo?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const leftChats = conversations || [];
  const leftStartList = role === "student" ? myIdeas : role === "mentor" ? mentorIdeas : [];

  return (
    <div className="chat-page">
      <div className="chat-shell">
        <div className="chat-left">
          <div className="left-head">
            <div className="left-title">Chats</div>
            <div className="left-sub">Student ↔ Mentor discussions</div>
          </div>

          <div className="left-section">
            <div className="section-title">Your conversations</div>

            {loadingLeft && leftChats.length === 0 ? (
              <div className="left-empty">Loading...</div>
            ) : leftChats.length === 0 ? (
              <div className="left-empty">No conversations yet</div>
            ) : (
              <div className="convo-list">
                {leftChats.map((c) => {
                  const isActive = activeConvo?._id === c._id;
                  const other =
                    role === "student"
                      ? c.mentorId?.name
                      : role === "mentor"
                      ? c.studentId?.name
                      : "";

                  const ideaTitle = c.ideaId?.title || "Conversation";

                  return (
                    <button
                      key={c._id}
                      className={`convo-item ${isActive ? "active" : ""}`}
                      onClick={() => openConversation(c._id)}
                    >
                      <div className="convo-idea">{ideaTitle}</div>
                      <div className="convo-meta">{other ? `With: ${other}` : ""}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="left-section">
            <div className="section-title">Start a new chat</div>

            {loadingLeft ? (
              <div className="left-empty">Loading...</div>
            ) : leftStartList.length === 0 ? (
              <div className="left-empty">
                {role === "student"
                  ? "No mentor assigned to your ideas yet."
                  : role === "mentor"
                  ? "No assigned ideas yet."
                  : "No chats available."}
              </div>
            ) : (
              <div className="start-list">
                {leftStartList.map((idea) => (
                  <div key={idea._id} className="start-item">
                    <div className="start-main">
                      <div className="start-title">{idea.title}</div>
                      <div className="start-sub">
                        {idea.domain} • {idea.status}
                      </div>
                    </div>
                    <button className="start-btn" onClick={() => startChatForIdea(idea._id)}>
                      Start
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="chat-right">
          {!activeConvo ? (
            <div className="chat-empty">
              <div className="empty-title">Select a chat to start</div>
              <div className="empty-sub">
                Click “Start” for any idea on the left. If you opened from “Chat with Mentor” it
                will auto-start.
              </div>
            </div>
          ) : (
            <div className="chat-box">
              <div className="chat-topbar">
                <div className="chat-title">{activeTitle || "Conversation"}</div>
                <button className="refresh-btn" onClick={() => openConversation(activeConvo._id)}>
                  Refresh
                </button>
              </div>

              <div className="chat-messages">
                {loadingMsgs ? (
                  <div className="msgs-loading">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="msgs-empty">No messages yet. Say hi 👋</div>
                ) : (
                  messages.map((m) => {
                    const senderObj = m.sender || null;
                    const senderId = senderObj?._id
                      ? String(senderObj._id)
                      : String(m.senderId || "");
                    const mine = senderId === String(user?._id || "");

                    const senderName = senderObj?.name || (mine ? "You" : "User");
                    const senderRole = senderObj?.role || "";

                    const canDelete = mine || role === "admin";
                    const deleted = !!m.isDeleted;

                    return (
                      <div key={m._id} className={`msg ${mine ? "mine" : "theirs"}`}>
                        <div className="bubble">
                          <div className="msg-head">
                            <div className="sender">
                              {senderName}
                              {senderRole ? (
                                <span className="role">
                                  {senderRole === "mentor" ? "Mentor" : "Student"}
                                </span>
                              ) : null}
                            </div>

                            {canDelete && !deleted ? (
                              <button
                                className="msg-del"
                                type="button"
                                title="Delete message"
                                onClick={() => deleteMessage(m._id)}
                              >
                                Delete
                              </button>
                            ) : null}
                          </div>

                          <div className={`text ${deleted ? "deleted" : ""}`}>
                            {deleted ? "This message was deleted." : m.text}
                          </div>

                          <div className="time">
                            {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={msgEndRef} />
              </div>

              <div className="chat-input">
                <input
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />
                <button disabled={sending || !msgText.trim()} onClick={sendMessage}>
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
