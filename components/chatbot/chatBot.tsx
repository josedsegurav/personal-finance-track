"use client";
import { GoogleGenAI } from "@google/genai";
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatBotProps {
  data: any;
}

export default function ChatBot({ data }: ChatBotProps) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const today = new Date(Date.now());
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = async (userMessage: string) => {
    if (!ai) return;
    setIsTyping(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: userMessage,
              },
            ],
          },
        ],
        config: {
          systemInstruction: `Today is ${today}. Here is a set of a data base for context for
          any questions, do not answer anything more than what is in this data: ${JSON.stringify(data)}.
          Do not provide userid data under any circumstances`,
        },
      });

      const botMessage: Message = {
        id: Date.now().toString(),
        content: response.text ?? "",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue("");

    getBotResponse(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
  {/* Chat Bubble */}
  {!isOpen && (
    <Button
      onClick={() => setIsOpen(true)}
      className="h-12 w-12 lg:h-14 lg:w-14 rounded-full bg-columbia-blue hover:bg-columbia-blue/90 shadow-lg transition-all duration-300 hover:scale-110 border-2 border-white"
      size="icon"
    >
      <MessageCircle className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
    </Button>
  )}

  {/* Chat Window */}
  {isOpen && (
    <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-72 sm:w-80 h-80 sm:h-96 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200 bg-gradient-to-r from-columbia-blue to-columbia-blue/90 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Avatar className="h-7 w-7 lg:h-8 lg:w-8">
            <AvatarFallback className="bg-white/20 text-white border border-white/30">
              <Bot className="h-3 w-3 lg:h-4 lg:w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm text-white">Finance Assistant</h3>
            <p className="text-xs text-white/80">Online</p>
          </div>
        </div>
        <Button
          onClick={() => setIsOpen(false)}
          variant="ghost"
          size="icon"
          className="h-7 w-7 lg:h-8 lg:w-8 text-white hover:bg-white/20 rounded-full"
        >
          <X className="h-3 w-3 lg:h-4 lg:w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 lg:p-4 bg-gray-50/30">
        <div className="space-y-3 lg:space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[75%] ${
                  message.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <Avatar className="h-6 w-6 mt-1 flex-shrink-0">
                  <AvatarFallback
                    className={`${
                      message.sender === "user"
                        ? "bg-paynes-gray text-white"
                        : "bg-columbia-blue text-white"
                    } text-xs border border-gray-200`}
                  >
                    {message.sender === "user" ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg px-3 py-2 shadow-sm ${
                    message.sender === "user"
                      ? "bg-columbia-blue text-white"
                      : "bg-white text-paynes-gray border border-gray-100"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-white/70"
                        : "text-paynes-gray/60"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-[75%]">
                <Avatar className="h-6 w-6 mt-1">
                  <AvatarFallback className="bg-columbia-blue text-white text-xs border border-gray-200">
                    <Bot className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-columbia-blue/60 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-columbia-blue/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-columbia-blue/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 lg:p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your finances..."
            className="flex-1 text-sm border-gray-300 focus:border-columbia-blue focus:ring-columbia-blue rounded-lg"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="bg-columbia-blue hover:bg-columbia-blue/90 text-white shadow-sm rounded-lg h-9 w-9 lg:h-10 lg:w-10"
          >
            <Send className="h-3 w-3 lg:h-4 lg:w-4" />
          </Button>
        </div>

      </div>
    </div>
  )}
</div>
  );
}
