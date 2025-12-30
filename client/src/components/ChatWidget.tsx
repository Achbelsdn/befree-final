import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: number;
  content: string;
  sender: "user" | "support";
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: 1,
    content: "Salut ! Besoin d'un coup de main ? Je suis là.",
    sender: "support",
    timestamp: new Date(),
  },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [unreadCount, setUnreadCount] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate support response
    setTimeout(() => {
      setIsTyping(false);
      const supportResponse: Message = {
        id: messages.length + 2,
        content: "Merci pour votre message ! Notre équipe vous répond très vite. En attendant, WhatsApp : +229 60 00 00 00",
        sender: "support",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, supportResponse]);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ease-out ${
          isOpen 
            ? "bg-[#1A1714] text-[#FAF7F2] rotate-90" 
            : "bg-[#C75B39] text-white hover:bg-[#A84832] hover:scale-110 hover:-rotate-6"
        }`}
        style={{
          boxShadow: isOpen 
            ? '0 4px 12px rgba(26, 23, 20, 0.3)' 
            : '0 4px 16px rgba(199, 91, 57, 0.4), 0 8px 32px rgba(199, 91, 57, 0.2)',
        }}
        aria-label={isOpen ? "Fermer le chat" : "Ouvrir le chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#5C6B4A] text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      <div 
        className={`absolute bottom-16 right-0 w-[360px] max-h-[500px] bg-[#FFFDFB] rounded-lg overflow-hidden transition-all duration-500 ease-out ${
          isOpen 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 24px 64px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div className="bg-[#C75B39] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Support Bénin Freelance</h4>
                <span className="text-xs text-[#E8A090] flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#8A9A76] rounded-full animate-pulse"></span>
                  En ligne
                </span>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="w-8 h-8 rounded-sm hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[320px] overflow-y-auto p-4 bg-[#FAF7F2]">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
              style={{
                animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
              }}
            >
              <div
                className={`max-w-[80%] rounded-sm px-4 py-3 ${
                  message.sender === "user"
                    ? "bg-[#C75B39] text-white"
                    : "bg-[#FFFDFB] border border-[#E8E2D9] text-[#1A1714]"
                }`}
                style={{
                  boxShadow: message.sender === "user" 
                    ? '0 2px 8px rgba(199, 91, 57, 0.2)' 
                    : '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <span className={`text-xs mt-2 block ${
                  message.sender === "user" ? "text-[#E8A090]" : "text-[#9A948D]"
                }`}>
                  {message.timestamp.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-[#FFFDFB] border border-[#E8E2D9] rounded-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#9A948D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-[#9A948D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-[#9A948D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="p-4 border-t border-[#E8E2D9] bg-[#FFFDFB] flex gap-2">
          <Input
            type="text"
            placeholder="Votre message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 h-11 bg-[#FAF7F2] border-[#E8E2D9] focus:border-[#C75B39] rounded-sm"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-[#C75B39] hover:bg-[#A84832] rounded-sm w-11 h-11 transition-all duration-300 hover:-translate-y-0.5"
            disabled={!inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
      
      {/* CSS for animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
