import { useState, useEffect } from "react"
import { X } from "lucide-react"
import axios from "axios"

const SUMMARY_PROMPT = "Summarize my latest vitals in simple patient-friendly language."

const VitalsChat = ({ show, onClose }) => {
  const chatKey = "vitalsChat";
  const [showChat, setShowChat] = useState(show);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    setShowChat(show);
  }, [show]);

  useEffect(() => {
    if (showChat) {
      const saved = localStorage.getItem(chatKey);
      if (saved) {
        setChatMessages(JSON.parse(saved));
      }
    }
  }, [showChat]);

  useEffect(() => {
    if (showChat) {
      localStorage.setItem(chatKey, JSON.stringify(chatMessages));
    }
  }, [chatMessages, showChat]);

  const handleSummarize = async () => {
    // Check if chat history exists
    const saved = localStorage.getItem(chatKey);
    if (saved) {
      setChatMessages(JSON.parse(saved));
      setShowChat(true);
      return;
    }
    setShowChat(true);
    setChatMessages([{ sender: "user", text: SUMMARY_PROMPT }]);
    setChatLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/vitals/summarize",
        {},
        { withCredentials: true }
      );
      setChatMessages([
        { sender: "user", text: SUMMARY_PROMPT },
        { sender: "ai", text: res.data.summary }
      ]);
    } catch (error) {
      setChatMessages([
        { sender: "user", text: SUMMARY_PROMPT },
        { sender: "ai", text: "Sorry, I couldn't summarize your vitals." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const question = userInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: question }]);
    setUserInput("");
    setChatLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/vitals/ask-ai",
        { question },
        { withCredentials: true }
      );
      setChatMessages((prev) => [...prev, { sender: "ai", text: res.data.answer }]);
    } catch (error) {
      setChatMessages((prev) => [...prev, { sender: "ai", text: "Sorry, I couldn't answer that question." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!showChat) return null;

  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <span>VITALS CHAT</span>
        <button className="close-btn" onClick={() => { setShowChat(false); if (onClose) onClose(); }}>
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="chat-body">
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.sender === "user" ? "user-msg" : "ai-msg"}`}
          >
            {msg.text}
          </div>
        ))}
        {chatLoading && <div className="ai-msg">Loading...</div>}
      </div>
      <form className="chat-input" onSubmit={handleSendQuestion}>
        <input
          type="text"
          placeholder="Enter your questions.."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={chatLoading}
        />
        <button type="submit" disabled={chatLoading || !userInput.trim()}>Send</button>
      </form>
    </div>
  );
};

export default VitalsChat; 