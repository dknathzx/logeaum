import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";


import logoImage from "./logo.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ConversationResponse {
  response: string;
  detected_severity: string;
  resources: Array<{
    name: string;
    contact: string;
    available: string;
  }>;
  suggestions: string[];
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello, I'm LOGEAUM. You're safe here — I'm here to listen and help you make sense of what you're feeling.",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔥 Call conversational API
  const chatWithAI = async (text: string): Promise<ConversationResponse | null> => {
    try {
      // Build conversation history for context
      const history = messages.slice(1).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text,
          conversation_history: history
        }),
      });

      if (!response.ok) {
        throw new Error("API failed");
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  };

  // 🔥 Format response with suggestions and resources (no severity, no emojis)
  const formatResponse = (data: ConversationResponse): string => {
    let response = data.response + "\n\n";
    
    // Add suggestions if moderate or higher (no emojis)
    if (data.detected_severity !== "LOW" && data.suggestions.length > 0) {
      response += `Suggestions:\n`;
      data.suggestions.forEach(s => response += `${s}\n`);
      response += `\n`;
    }
    
    // Add resources if high risk or crisis (no emojis)
    if ((data.detected_severity === "HIGH" || data.detected_severity === "CRISIS") && data.resources.length > 0) {
      response += `Important Resources:\n`;
      data.resources.forEach(r => {
        response += `${r.name}: ${r.contact} (${r.available})\n`;
      });
    }
    
    return response;
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // 🔥 Call conversational API
    const result = await chatWithAI(content);
    setIsTyping(false);

    if (result) {
      // Real conversational response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: formatResponse(result),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } else {
      // Fallback if API fails
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm having trouble connecting right now. If you're in crisis, please contact:\n\n• 🇮🇳 India: AASRA +91-9152987821\n• 🇺🇸 USA: 988\n• 🇬🇧 UK: 116 123",
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3 mb-1">
            <img
              src={logoImage}
              alt="LOGEAUM Logo"
              className="w-10 h-10 object-cover rounded-full"
            />
            <h1 className="text-center text-gray-700">LOGEAUM</h1>
          </div>
          <p className="text-center text-gray-500 text-sm">
            your mental health companion
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))}
        {isTyping && (
          <div className="max-w-3xl mx-auto px-4 py-6 flex gap-4">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSendMessage} disabled={isTyping} />
    </div>
  );
}