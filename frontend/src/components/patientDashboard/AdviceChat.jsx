import { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import '../../css/AdviceChat.css'; // We will create this CSS file next

const AdviceChat = ({ show, onClose, heartData }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Use the heartData ID to create a unique key for localStorage
  const chatKey = heartData ? `adviceChat_${heartData._id}` : null;

  useEffect(() => {
    if (show && chatKey) {
      const savedMessages = localStorage.getItem(chatKey);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // If no saved chat, automatically fetch initial advice
        fetchInitialAdvice();
      }
    }
    // eslint-disable-next-line
  }, [show, chatKey]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (chatKey && messages.length > 0) {
      localStorage.setItem(chatKey, JSON.stringify(messages));
    }
  }, [chatKey, messages]);

  const fetchInitialAdvice = async () => {
    const initialPrompt = "Provide advice on lifestyle changes based on my clinical data to ensure a better chance of avoiding heart disease.";
    const initialMessages = [{ sender: "user", text: initialPrompt }];
    setMessages(initialMessages);
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/advice/heart",
        { heartData },
        { withCredentials: true }
      );
      setMessages([...initialMessages, { sender: "ai", text: res.data.advice }]);
    } catch (error) {
      console.error("Error fetching initial advice:", error);
      const errorMessage = error.response?.data?.message || "Sorry, I couldn't get advice at this time.";
      setMessages([...initialMessages, { sender: "ai", text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const question = userInput.trim();
    const newMessages = [...messages, { sender: "user", text: question }];
    setMessages(newMessages);
    setUserInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/advice/heart/ask",
        { question, chatHistory: newMessages.slice(0, -1) }, // Send history for context
        { withCredentials: true }
      );
      setMessages(prev => [...prev, { sender: "ai", text: res.data.answer }]);
    } catch (error) {
      console.error("Error asking question:", error);
      const errorMessage = error.response?.data?.message || "Sorry, I couldn't get an answer right now.";
      setMessages(prev => [...prev, { sender: "ai", text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="advice-chat-overlay">
      <div className="advice-chat-container">
        <div className="advice-chat-header">
          <h3>AI Health Advisor</h3>
          <button className="advice-chat-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="advice-chat-body">
          {messages.map((msg, idx) => (
            <div key={idx} className={`advice-chat-message ${msg.sender === "user" ? "user-msg" : "ai-msg"}`}>
              <p>{msg.text}</p>
            </div>
          ))}
          {loading && (
            <div className="advice-chat-message ai-msg">
              <p>Thinking...</p>
            </div>
          )}
        </div>
        <form className="advice-chat-input-form" onSubmit={handleSendQuestion}>
          <input
            type="text"
            placeholder="Ask a follow-up question..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !userInput.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdviceChat; 