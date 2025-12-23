import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import axiosInstance from "../../axiosInstance";

// Assets
import ai from "../../assets/icons/ai.png";
import send from "../../assets/icons/send.png";
import verify from "../../assets/icons/verified.png";
import sound from "../../assets/sounds/message.mp3";

// Interface for our local state
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Initialize sound once outside component to avoid re-creation
const notificationSound = new Audio(sound);

const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]); // Also scroll when opening

  // 2. Add welcome message ONLY once on first load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Step into the future of project management 🤲. Sam’s AI assistant stands ready to orchestrate your tasks with expertise and foresight 🙆‍♂️.",
        },
      ]);
    }
  }, []); // Empty dependency array = runs only once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Create user message
    const userMessage: Message = { role: "user", content: input };

    // Optimistically update UI
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      // 3. Format History for Backend
      // Map 'assistant' -> 'model' because Gemini API uses 'model'
      const historyPayload = messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }], // Safe format for Gemini SDK
      }));

      // 4. Send Request
      const response = await axiosInstance.post("/gemini/chat", {
        message: input,
        history: historyPayload, // <--- IMPORTANT: Sending history provides memory!
      });

      // 5. Update with AI Response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.reply },
      ]);

      // Play sound (catch error if user hasn't interacted yet)
      notificationSound
        .play()
        .catch((err) => console.log("Audio play blocked", err));
    } catch (error) {
      console.error("Chat Error:", error);

      let errorMessage = "Sorry, something went wrong.";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || "Connection error.";
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage },
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
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        .floating-button:hover {
          transform: scale(1.1) translateY(-5px);
        }
      `}</style>

      {/* CHAT WINDOW 
         We use conditional CSS (hidden) instead of conditional rendering 
         so the chat history isn't deleted when you minimize the window.
      */}
      <div
        className={`bg-white rounded-lg shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right border border-gray-200 ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none absolute bottom-0 right-0"
        }`}
        style={{ width: "320px", height: "450px" }} // Increased height slightly
      >
        {/* Header */}
        <div className="flex justify-between items-center bg-violet-600 text-white p-3 rounded-t-lg shadow-md">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Sam's AI Assistant</span>
            <img src={verify} alt="Verified" className="w-5 h-5" />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full hover:bg-violet-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === "assistant"
                    ? "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                    : "bg-violet-600 text-white rounded-br-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center p-3 bg-white border-t border-gray-100 rounded-b-lg"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 p-2 text-sm bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all px-4"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="ml-2 p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <img
              src={send}
              alt="Send"
              className="w-4 h-4 invert brightness-0 filter"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </button>
        </form>
      </div>

      {/* FLOATING BUTTON (Only visible when chat is closed) */}
      <button
        onClick={() => setIsOpen(true)}
        className={`floating-button bg-white border-2 border-violet-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-50 ${
          isOpen ? "hidden" : "flex"
        }`}
        style={floatingAnimation}
      >
        <img src={ai} alt="AI" className="w-8 h-8" />
      </button>
    </div>
  );
};

export default FloatingChatbot;
