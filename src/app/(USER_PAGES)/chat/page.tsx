// app/chat/page.tsx - Complete fixed version
"use client";

import { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Phone,
  Wifi,
  Send,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  Bot,
  User,
  Clock,
  Home,
  Utensils,
  CreditCard,
  Truck,
  Star,
  Award,
  Calendar,
  X,
  Coffee,
  Beer,
  Users,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import faqsData from "@/data/faqs.json";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const quickActions = [
  {
    icon: Clock,
    label: "Opening Hours",
    question: "What are your opening hours?",
  },
  {
    icon: Utensils,
    label: "Vegetarian Options",
    question: "Do you have vegetarian options?",
  },
  { icon: Truck, label: "Delivery Info", question: "Do you offer delivery?" },
  {
    icon: CreditCard,
    label: "Payment Methods",
    question: "What payment methods do you accept?",
  },
  {
    icon: Star,
    label: "Loyalty Program",
    question: "Is there a loyalty program?",
  },
  {
    icon: Calendar,
    label: "Make Reservation",
    question: "How do I make a reservation?",
  },
  { icon: Home, label: "Parking", question: "Do you have parking facilities?" },
  {
    icon: Award,
    label: "Discounts",
    question: "Do you offer special discounts?",
  },
  { icon: Coffee, label: "Kids Menu", question: "Is there a kids menu?" },
  { icon: Beer, label: "Alcohol", question: "Do you serve alcohol?" },
  { icon: Gift, label: "Gift Cards", question: "Do you have gift cards?" },
  {
    icon: Users,
    label: "Group Bookings",
    question: "Do you accept group bookings?",
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! 👋 Welcome to DineEase Support. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]",
        );
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Improved find answer from FAQ with better matching logic
  const findAnswer = (question: string): string => {
    const normalizedQuestion = question.toLowerCase().trim();

    // Remove common filler words for better matching
    const stopWords = [
      "what",
      "is",
      "are",
      "do",
      "does",
      "can",
      "could",
      "would",
      "should",
      "the",
      "a",
      "an",
      "of",
      "to",
      "for",
      "in",
      "on",
      "at",
      "by",
      "with",
      "without",
      "and",
      "or",
      "but",
      "so",
      "if",
      "then",
      "else",
      "when",
      "where",
      "which",
      "who",
      "whom",
      "whose",
      "why",
      "how",
    ];

    const keywords = normalizedQuestion
      .split(" ")
      .filter((word) => word.length > 2 && !stopWords.includes(word));

    // Score each FAQ based on keyword matches
    const scoredFaqs = faqsData.faqs.map((faq) => {
      const faqQuestion = faq.question.toLowerCase();
      let score = 0;

      // Exact match gets highest score
      if (faqQuestion === normalizedQuestion) {
        score += 100;
      }

      // Check if the question contains the entire FAQ question
      if (normalizedQuestion.includes(faqQuestion)) {
        score += 50;
      }

      // Check if FAQ question contains the entire user question
      if (faqQuestion.includes(normalizedQuestion)) {
        score += 40;
      }

      // Keyword matching
      keywords.forEach((keyword) => {
        if (faqQuestion.includes(keyword)) {
          score += 10;
        }
      });

      // Special keyword weighting for important terms
      const specialKeywords: Record<string, string[]> = {
        payment: [
          "payment",
          "pay",
          "method",
          "card",
          "cash",
          "esewa",
          "khalti",
        ],
        hour: ["hour", "open", "close", "time", "schedule", "operating"],
        delivery: ["delivery", "deliver", "shipping", "send"],
        vegetarian: ["vegetarian", "veg", "vegan", "dietary"],
        reservation: ["reservation", "book", "table", "reserve"],
        cancel: ["cancel", "cancellation", "refund"],
        loyalty: ["loyalty", "point", "reward", "program"],
        parking: ["parking", "park", "car", "vehicle"],
        alcohol: ["alcohol", "beer", "wine", "cocktail", "drink"],
        kids: ["kids", "children", "child", "family"],
      };

      // Check for special keyword groups
      Object.entries(specialKeywords).forEach(([topic, words]) => {
        const hasTopicKeyword = words.some((w) =>
          normalizedQuestion.includes(w),
        );
        const hasFaqTopic = words.some((w) => faqQuestion.includes(w));
        if (hasTopicKeyword && hasFaqTopic) {
          score += 25;
        }
      });

      return { faq, score };
    });

    // Sort by score and get the best match
    const bestMatch = scoredFaqs.sort((a, b) => b.score - a.score)[0];

    // If we have a good match (score > 0), return it
    if (bestMatch && bestMatch.score > 0) {
      return bestMatch.faq.answer;
    }

    // Default responses for unrecognized questions
    const defaultResponses = [
      "I'm not sure about that. Could you please rephrase your question?",
      "That's a great question! For specific inquiries, please contact our support team at +977 9801234567",
      "I'd love to help with that! Could you provide more details?",
      "Let me check that for you. In the meantime, you can also visit our FAQ section.",
      "I'm still learning! For the most accurate information, please call our support team.",
    ];

    return defaultResponses[
      Math.floor(Math.random() * defaultResponses.length)
    ];
  };

  const sendBotResponse = (userMessage: string) => {
    setIsTyping(true);

    setTimeout(() => {
      const answer = findAnswer(userMessage);
      const botMessage: Message = {
        id: Date.now().toString(),
        text: answer,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    sendBotResponse(inputMessage);
  };

  const handleQuickAction = (question: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    sendBotResponse(question);
    setIsSidebarOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-4">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)]">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-full">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-4 sm:p-6 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">
                    DineEase Support
                  </h1>
                  <p className="text-white/90 text-xs sm:text-sm">
                    We're here to help 24/7
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white border-0">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse mr-1" />
                  Online
                </Badge>
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="md:hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Restaurant Info Bar */}
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex-shrink-0">
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                <span className="hidden sm:inline">
                  123 Main Street, Kathmandu
                </span>
                <span className="sm:hidden">Kathmandu</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                <span>+977 9801234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                <span className="hidden sm:inline">WiFi: DineEase</span>
                <span className="sm:hidden">WiFi</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Sidebar - Desktop */}
            <div className="hidden md:block w-80 flex-shrink-0 border-r border-gray-100 bg-gray-50/30 overflow-y-auto">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="space-y-2">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action.question)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                          <Icon className="w-4 h-4 text-amber-500" />
                        </div>
                        <span className="flex-1 text-left text-sm text-gray-700 group-hover:text-amber-700">
                          {action.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 border-t border-gray-100">
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-gray-900">
                      AI Assistant
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    I can help answer your questions about menu, orders,
                    reservations, delivery, and more!
                  </p>
                  <div className="mt-3 pt-3 border-t border-amber-100">
                    <p className="text-xs text-amber-600">
                      📍 {faqsData.faqs.length}+ FAQs available
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/50 z-40 md:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
                <div className="fixed left-0 top-0 h-full w-80 bg-white z-50 md:hidden shadow-xl overflow-y-auto animate-slide-in-left">
                  <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      <span className="font-semibold">Quick Actions</span>
                    </div>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-1 hover:bg-white/20 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-5 space-y-2">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action.question)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                            <Icon className="w-4 h-4 text-amber-500" />
                          </div>
                          <span className="flex-1 text-left text-sm text-gray-700 group-hover:text-amber-700">
                            {action.label}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500" />
                        </button>
                      );
                    })}
                  </div>
                  <div className="p-5 border-t border-gray-100">
                    <div className="bg-amber-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-gray-900">
                          AI Assistant
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        I can help answer your questions about menu, orders,
                        reservations, and more!
                      </p>
                      <div className="mt-3 pt-3 border-t border-amber-100">
                        <p className="text-xs text-amber-600">
                          📍 {faqsData.faqs.length}+ FAQs available
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages - Fixed scrolling */}
              <ScrollArea
                className="flex-1 px-4 py-4 overflow-y-scroll"
                ref={scrollAreaRef}
              >
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-start gap-3",
                        message.sender === "user"
                          ? "flex-row-reverse"
                          : "flex-row",
                      )}
                    >
                      <Avatar
                        className={cn(
                          "w-8 h-8 flex-shrink-0",
                          message.sender === "user"
                            ? "bg-gradient-to-r from-amber-500 to-orange-500"
                            : "bg-gray-200",
                        )}
                      >
                        <AvatarFallback>
                          {message.sender === "user" ? (
                            <User className="w-4 h-4 text-gray-800" />
                          ) : (
                            <Bot className="w-4 h-4 text-gray-600" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2 break-words",
                          message.sender === "user"
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                            : "bg-gray-100 text-gray-800",
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.text}
                        </p>
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
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8 bg-gray-200 flex-shrink-0">
                        <AvatarFallback>
                          <Bot className="w-4 h-4 text-gray-600" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area - Fixed to bottom */}
              <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    className="flex-1 rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-6"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">
                    Powered by DineEase AI Assistant
                  </p>
                  <p className="text-xs text-gray-400">
                    {faqsData.faqs.length} FAQs available
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-2 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <p className="text-xs text-gray-400">
              © 2024 DineEase. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
