import React, { useState, useRef, useEffect } from "react";
import ai from "../../assets/icons/ai.png";
import send from "../../assets/icons/send.png";
import axiosInstance from "../../axiosInstance";
import axios from "axios";
import sound from "../../assets/sounds/message.mp3";
import verify from "../../assets/icons/verified.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}
const notificationSound = new Audio(sound);
const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Step into the future of project management 🤲. Sam’s AI assistant stands ready to orchestrate your tasks with expertise and foresight 🙆‍♂️.",
        },
      ]);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/gemini/chat", {
        message: input,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.reply },
      ]);
      notificationSound.play().catch((e) => console.error("Sound error:", e));
    } catch (error) {
      // Check if it's an Axios error
      if (axios.isAxiosError(error)) {
        // Axios errors have a `response` property
        console.error("Axios error:", error.response?.data || error.message);
      } else if (error instanceof Error) {
        // Generic error
        console.error("Error:", error.message);
      } else {
        // Unknown error type
        console.error("Unknown error:", error);
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Inline CSS for the floating animation
  const floatingAnimation = {
    animation: "float 3s ease-in-out infinite",
    transition: "transform 0.2s ease-in-out",
  };

  return (
    <div
      style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}
    >
      {/* Floating animation CSS */}
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .floating-button:hover {
          transform: scale(1.1) translateY(-5px);
        }
      `}</style>

      {isOpen ? (
        <div
          className="bg-white rounded-lg shadow-lg flex flex-col"
          style={{ width: "320px", height: "400px" }}
        >
          <div className="flex justify-between items-center bg-blue-500 text-white p-2 rounded-t-lg">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Sam's AI Assistant</span>
              <img src={verify} alt="verify Assistant" className="w-8 h-8" />
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-blue-600"
            >
              ×
            </button>
          </div>
          <div
            className="flex-1 overflow-y-auto p-2"
            style={{ height: "calc(100% - 94px)" }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 ${
                  msg.role === "assistant" ? "text-left" : "text-right"
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    msg.role === "assistant"
                      ? "bg-gray-100"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left mb-2">
                <div className="inline-block bg-gray-100 p-2 rounded-lg">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Improved input box */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center p-2 border-t border-gray-200"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="submit"
              className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <img src={send} alt="Send" className="w-5 h-5" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="floating-button bg-white border-2 border-blue-800 rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-gray-100"
          style={floatingAnimation}
        >
          <img src={ai} alt="AI Assistant" className="w-8 h-8" />
        </button>
      )}
    </div>
  );
};

export default FloatingChatbot;
