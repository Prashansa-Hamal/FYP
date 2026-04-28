"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Wifi,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  Utensils,
  CreditCard,
  Truck,
  Star,
  Calendar,
  Home,
  Award,
  Coffee,
  Beer,
  Users,
  Gift,
  Heart,
  Shield,
  Smartphone,
  DollarSign,
  Info,
  HelpCircle,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import faqsData from "@/data/faqs.json";

// Category icons mapping
const categoryIcons: Record<string, any> = {
  General: Info,
  Reservations: Calendar,
  Delivery: Truck,
  Payments: CreditCard,
  Menu: Utensils,
  Orders: ShoppingBag,
  Promotions: Award,
  Loyalty: Star,
  Facilities: Home,
  Support: HelpCircle,
  Pricing: DollarSign,
  Gifts: Gift,
  Catering: Users,
  Safety: Shield,
};

import { ShoppingBag } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white hover:shadow-md transition-all duration-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-amber-50/30 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-amber-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-amber-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
          <div className="pt-2 text-gray-600 leading-relaxed">{answer}</div>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Get unique categories
  const categories = [
    "all",
    ...new Set(faqsData.faqs.map((faq) => faq.category)),
  ];

  // Filter FAQs based on search and category
  const filteredFaqs = faqsData.faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Group FAQs by category for the grouped view
  const groupedFaqs = filteredFaqs.reduce(
    (acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push(faq);
      return acc;
    },
    {} as Record<string, typeof faqsData.faqs>,
  );

  const CategoryIcon = ({ category }: { category: string }) => {
    const Icon = categoryIcons[category] || HelpCircle;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Frequently Asked Questions
              </h1>
              <p className="text-white/90 text-sm max-w-2xl mx-auto">
                Find answers to common questions about our restaurant, menu,
                orders, and services
              </p>
            </div>
          </div>

          {/* Restaurant Info Bar */}
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">
                  123 Main Street, Kathmandu
                </span>
                <span className="sm:hidden">Kathmandu</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>+977 9801234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">WiFi: DineEase</span>
                <span className="sm:hidden">WiFi</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <Tabs
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="mb-8"
            >
              <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="data-[state=active]:bg-amber-500 data-[state=active]:text-white bg-white border border-gray-200 rounded-full px-4 py-2 text-sm capitalize"
                  >
                    {category === "all" ? "All Questions" : category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* FAQ Sections */}
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500">
                  We couldn't find any matching questions. Try a different
                  search term.
                </p>
              </div>
            ) : searchQuery ? (
              // Flat view for search results
              <div className="space-y-3">
                {filteredFaqs.map((faq) => (
                  <FAQItem
                    key={faq.id}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openItems.includes(faq.id)}
                    onToggle={() => toggleItem(faq.id)}
                  />
                ))}
              </div>
            ) : (
              // Grouped view by category
              <div className="space-y-8">
                {Object.entries(groupedFaqs).map(([category, faqs]) => {
                  const Icon = categoryIcons[category] || HelpCircle;
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {category}
                        </h2>
                        <Badge variant="secondary" className="bg-gray-100">
                          {faqs.length} questions
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {faqs.map((faq) => (
                          <FAQItem
                            key={faq.id}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openItems.includes(faq.id)}
                            onToggle={() => toggleItem(faq.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Still Need Help Section */}
            <div className="mt-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MessageCircle className="w-6 h-6 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Still have questions?
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Can't find the answer you're looking for? We're here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/chat">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat with Support
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="border-gray-200 text-gray-700"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Us: +977 9801234567
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">Powered by QR Menu System</p>
          </div>
        </div>
      </div>
    </div>
  );
}
