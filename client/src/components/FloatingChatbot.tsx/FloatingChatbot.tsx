import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import axiosInstance from "../../axiosInstance";

// Assets
import ai from "../../assets/icons/ai.png";
import send from "../../assets/icons/send.png";
import verify from "../../assets/icons/verified.png";
import sound from "../../assets/sounds/message.mp3";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const notificationSound = new Audio(sound);

const WELCOME_TEXT =
  "I am Samwise, your Project Architect. I can manage your Spaces, Boards, and Tasks across your entire account. How can I help you build today?";

const FloatingChatbot: React.FC = () => {
  const queryClient = useQueryClient();
  const { id: boardId } = useParams<{ id: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [aiMode, setAiMode] = useState<"command" | "consultant">("command"); // 👈 Mode State

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping, isLoading]);

  // Typing Effect Logic
  const typeWelcomeMessage = () => {
    setMessages([]);
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      setMessages([
        {
          role: "assistant",
          content: WELCOME_TEXT.slice(0, i + 1),
        },
      ]);
      i++;
      if (i >= WELCOME_TEXT.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 15);
  };

  // Load history from DB
  useEffect(() => {
    const loadHistory = async () => {
      if (!boardId) return;
      try {
        const res = await axiosInstance.get(`/gemini/history/${boardId}`);
        if (res.data && res.data.length > 0) {
          const mappedMessages = res.data.map((m: any) => ({
            role: m.role === "model" ? "assistant" : "user",
            content: m.content,
          }));
          setMessages(mappedMessages);
        } else {
          typeWelcomeMessage();
        }
      } catch (err) {
        console.error("Failed to load history:", err);
        typeWelcomeMessage();
      }
    };
    loadHistory();
  }, [boardId]);

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear this conversation?"))
      return;
    try {
      await axiosInstance.delete(`/gemini/history/${boardId}`);
      typeWelcomeMessage();
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const historyPayload = messages
      .filter(
        (msg, index) =>
          !(index === 0 && msg.role === "assistant" && messages.length === 1)
      )
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/gemini/chat", {
        message: input,
        history: historyPayload,
        boardId: boardId,
        aiMode: aiMode, // 👈 Send current mode to backend
      });

      if (response.data.actionTaken) {
        queryClient.invalidateQueries(["getLists", boardId]);
        queryClient.invalidateQueries(["getSpaces"]);
        queryClient.invalidateQueries(["getBoards"]);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.reply },
      ]);

      notificationSound.play().catch(() => {});
    } catch (error) {
      console.error("Chat Error:", error);
      let errorMessage = "AI assistant is currently offline.";
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

  return (
    <div
      style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}
    >
      <style>{`
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }
        .floating-button:hover { transform: scale(1.1) translateY(-5px); }
      `}</style>

      {/* CHAT WINDOW */}
      <div
        className={`bg-white rounded-lg shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right border border-gray-200 ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none absolute bottom-0 right-0"
        }`}
        style={{ width: "350px", height: "550px" }}
      >
        {/* Header */}
        <div className="bg-violet-600 text-white p-3 rounded-t-lg shadow-md">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                Samwise's Assistant 🤖
              </span>
              <img src={verify} alt="Verified" className="w-5 h-5" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearHistory}
                title="Clear Chat"
                className="p-1 hover:bg-violet-700 rounded transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-violet-700 rounded transition-colors"
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
          </div>

          {/* MODE TOGGLE SWITCH */}
          <div className="flex items-center justify-between bg-violet-800/40 p-2 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-200">
              Current Mode: <span className="text-white">{aiMode}</span>
            </span>
            <button
              onClick={() =>
                setAiMode((prev) =>
                  prev === "command" ? "consultant" : "command"
                )
              }
              className="relative w-12 h-6 bg-violet-900/60 rounded-full transition-colors border border-violet-400/30"
            >
              <div
                className={`absolute top-0.5 w-4.5 h-4.5 rounded-full transition-all duration-300 flex items-center justify-center text-[8px] shadow-md ${
                  aiMode === "command"
                    ? "left-1 bg-amber-400"
                    : "left-6 bg-cyan-400"
                }`}
              >
                {aiMode === "command" ? "⚡" : "🧠"}
              </div>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
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
                style={{ whiteSpace: "pre-wrap" }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {(isLoading || isTyping) && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></div>
                <div
                  className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-white border-t border-gray-100 rounded-b-lg"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              placeholder={
                isTyping ? "Samwise is thinking..." : `In ${aiMode} mode...`
              }
              className="flex-1 p-2 text-sm bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all px-4"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || isTyping}
              className="p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-lg"
            >
              <img
                src={send}
                alt="Send"
                className="w-4 h-4 invert brightness-0"
              />
            </button>
          </div>
        </form>
      </div>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="floating-button bg-white border-2 border-violet-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-50"
          style={{ animation: "float 3s ease-in-out infinite" }}
        >
          <img src={ai} alt="AI" className="w-8 h-8" />
        </button>
      )}
    </div>
  );
};

export default FloatingChatbot;
