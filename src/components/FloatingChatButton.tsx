"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import faqsData from "@/data/faqs.json";
import { format } from "date-fns";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const quickReplies = [
  "Opening hours",
  "Delivery info",
  "Payment methods",
  "Vegetarian options",
];

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! 👋 How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findAnswer = (question: string): string => {
    const normalizedQuestion = question.toLowerCase().trim();
    const matchedFaq = faqsData.faqs.find(
      (faq) =>
        faq.question.toLowerCase().includes(normalizedQuestion) ||
        normalizedQuestion.includes(faq.question.toLowerCase()),
    );

    if (matchedFaq) {
      return matchedFaq.answer;
    }

    return "I'll help you with that! Please contact our support team at +977 9801234567 for detailed assistance.";
  };

  const sendBotResponse = (userMessage: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const answer = findAnswer(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: answer,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: inputMessage,
        sender: "user",
        timestamp: new Date(),
      },
    ]);
    sendBotResponse(inputMessage);
    setInputMessage("");
  };

  const handleQuickReply = (reply: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: reply,
        sender: "user",
        timestamp: new Date(),
      },
    ]);
    sendBotResponse(reply);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center animate-bounce-in"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">DineEase Assistant</h3>
                <p className="text-xs text-white/80">Online • 24/7 Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-2",
                    message.sender === "user" && "flex-row-reverse",
                  )}
                >
                  <Avatar
                    className={cn(
                      "w-7 h-7",
                      message.sender === "user"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500"
                        : "bg-gray-200",
                    )}
                  >
                    <AvatarFallback>
                      {message.sender === "user" ? (
                        <User className="w-3 h-3 text-white" />
                      ) : (
                        <Bot className="w-3 h-3 text-gray-600" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-3 py-2",
                      message.sender === "user"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        : "bg-gray-100 text-gray-800",
                    )}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        message.sender === "user"
                          ? "text-white/70"
                          : "text-gray-400",
                      )}
                    >
                      {format(message.timestamp, "hh:mm a")}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start gap-2">
                  <Avatar className="w-7 h-7 bg-gray-200">
                    <AvatarFallback>
                      <Bot className="w-3 h-3 text-gray-600" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-xl px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Replies */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:border-amber-300 hover:text-amber-600 whitespace-nowrap transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border-gray-200 text-sm h-9"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-3"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
