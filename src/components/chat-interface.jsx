import React, { useState, useEffect, useRef } from 'react'
import { AIMessage } from "@/components/ai-message"
import { UserMessage } from "@/components/user-message"
import AITextLoading from "@/components/kokonutui/ai-text-loading"
import { cn } from "@/lib/utils"
import { getAIResponse } from "@/lib/ai-service"
import { Bot, Cpu, Globe, Languages, Sparkles, ArrowDown, Trash2, Wand2, Send, BrainCircuit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "motion/react"

const ChatInterface = () => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(() =>
    localStorage.getItem('selectedModel') || "cognitivecomputations/dolphin-mistral-24b-venice-edition:free"
  )
  const messagesEndRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [inputValue, setInputValue] = useState("")

  // Add conversation management
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('conversations');
    return saved ? JSON.parse(saved) : {};
  });
  const [activeConversationId, setActiveConversationId] = useState(() => {
    return localStorage.getItem('activeConversation') || 'default';
  });

  // Load chat history on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory')
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages)
      setMessages(parsedMessages)
      if (parsedMessages.length > 0) {
        setShowWelcome(false)
      }
    }
  }, [])

  // Persist messages
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages))
    }
  }, [messages])

  // Persist selected model
  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('selectedModel', selectedModel)
    }
  }, [selectedModel])

  // Auto-scroll to bottom on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Track scroll to toggle the floating button
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const onScroll = () => {
      const threshold = 80
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      setShowScrollToBottom(distanceFromBottom > threshold)
    }
    el.addEventListener('scroll', onScroll)
    onScroll()
    return () => el.removeEventListener('scroll', onScroll)
  }, [scrollContainerRef])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (message) => {
    if (!message.trim()) return
    
    setShowWelcome(false)
    
    const newUserMessage = {
      role: 'user',
      content: message
    }

    // Update messages with user message
    setMessages(prevMessages => [...prevMessages, newUserMessage])
    
    // Start loading state
    setIsLoading(true)

    try {
      // Get the conversation history for context
      const conversationHistory = [...messages, newUserMessage]
        .map(msg => ({ role: msg.role, content: msg.content }))

      // Call API
      const aiResponse = await fetchAIResponse(conversationHistory, selectedModel)

      // Update messages with AI response
      setMessages(prevMessages => [...prevMessages, {
        role: 'assistant',
        content: aiResponse
      }])
    } catch (error) {
      console.error('Error getting AI response:', error)
      setMessages(prevMessages => [...prevMessages, {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        error: true
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitMessage = () => {
    if (inputValue.trim()) {
      handleSendMessage(inputValue.trim())
      setInputValue("")
    }
  }

  // Handle clear chat with confirmation
  const handleClearChat = () => {
    if (messages.length === 0) return
    
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([])
      localStorage.removeItem('chatHistory')
      setShowWelcome(true)
    }
  }

  const fetchAIResponse = async (messages, model) => {
    try {
      const response = await getAIResponse(messages, model);
      return response;
    } catch (error) {
      console.error("Error in AI response:", error);
      
      if (error.message.includes("API key")) {
        throw new Error("API key not configured. Please add your API key to the .env file.");
      } else if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error("Network error: Unable to reach the API. Please check your internet connection.");
      } else if (error.message.includes("initialize")) {
        throw new Error("Configuration error: Failed to initialize the AI service. Check your API key.");
      } else {
        throw new Error(`Error: ${error.message || "Unknown error occurred"}`);
      }
    }
  }

  // Example prompts for the welcome screen
  const examplePrompts = [
    "Explain how quantum computing works in simple terms",
    "Write a short story about a robot discovering emotions",
    "Create a 7-day workout plan for beginners",
    "Help me debug my JavaScript code that has a memory leak"
  ];

  // Function to handle clicking an example prompt
  const handleExampleClick = (prompt) => {
    handleSendMessage(prompt);
  };

  // Modified AI_MODELS for better readability
  const AI_MODELS = [
    { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", name: "Dolphin Mistral 24B" },
    { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B" },
    { id: "openchat/openchat-7b:free", name: "OpenChat 7B" },
    { id: "meta-llama/llama-3-8b-instruct:free", name: "Llama 3 8B" },
    { id: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free", name: "Nous Hermes 2" },
    { id: "google/gemma-7b-it:free", name: "Google Gemma 7B" }
  ];

  // Add conversation
  const createNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    setConversations(prev => ({
      ...prev,
      [newId]: { title: 'New Conversation', messages: [] }
    }));
    setActiveConversationId(newId);
    setMessages([]);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div
        ref={scrollContainerRef}
        className={cn(
          "flex-1 overflow-y-auto p-4 space-y-6",
          messages.length === 0 ? "flex items-center justify-center" : "",
          "scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/30 scrollbar-track-transparent"
        )}
      >
        <AnimatePresence mode="wait">
          {showWelcome && messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-3xl mx-auto space-y-8 p-4"
            >
              <div className="text-center space-y-3">
                <motion.div 
                  className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center mb-6 ring-4 ring-primary/10"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <BrainCircuit className="h-10 w-10 text-primary" />
                </motion.div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Welcome to UnAi</h2>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  Your intelligent assistant powered by advanced AI models
                </p>
              </div>

              {/* Feature Cards - with improved design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: <Cpu className="h-5 w-5 mr-2 text-primary" />, title: "Powerful AI Models", desc: "Access multiple AI models including Dolphin Mistral, Llama 3, and more." },
                  { icon: <Globe className="h-5 w-5 mr-2 text-primary" />, title: "Fast Responses", desc: "Get answers quickly without requiring logins or complicated setup." },
                  { icon: <Languages className="h-5 w-5 mr-2 text-primary" />, title: "Multilingual Support", desc: "Communicate in multiple languages and get translations on demand." },
                  { icon: <Sparkles className="h-5 w-5 mr-2 text-primary" />, title: "Creative Assistant", desc: "Get help with writing, brainstorming ideas, and creative tasks." }
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    className="border rounded-lg p-4 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all hover:-translate-y-1 hover:border-primary/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  >
                    <div className="flex items-center mb-3">
                      <div className="bg-primary/10 p-2 rounded-md mr-3">
                        {feature.icon}
                      </div>
                      <h3 className="font-medium">{feature.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Example prompts - redesigned */}
              <motion.div 
                className="space-y-4 bg-gradient-to-br from-card/60 to-card/80 backdrop-blur-sm rounded-xl p-6 border shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <h3 className="font-medium text-center flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-primary" /> Try an example prompt <Sparkles className="h-4 w-4 text-primary" />
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {examplePrompts.map((prompt, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="text-left p-4 border bg-background/80 rounded-lg hover:bg-accent/30 transition-colors text-sm group hover:shadow-md hover:border-primary/30"
                      onClick={() => handleExampleClick(prompt)}
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-primary">
                        <Send className="h-3 w-3 opacity-70" />
                        <span className="font-medium">Example {index+1}</span>
                      </div>
                      "{prompt}"
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full space-y-6 max-w-3xl mx-auto"
            >
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.role === 'user' ? (
                    <UserMessage content={message.content} />
                  ) : (
                    <AIMessage content={message.content} error={message.error} />
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <div className="py-1">
                  <AITextLoading className="text-lg" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />

        {showScrollToBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Button
              type="button"
              onClick={scrollToBottom}
              className="fixed bottom-24 right-4 rounded-full bg-primary text-primary-foreground shadow-md p-2 hover:bg-primary/90 hover:scale-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring z-10"
              aria-label="Scroll to bottom"
              title="Scroll to bottom"
              size="icon"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* Improved clear chat button */}
        <AnimatePresence>
          {messages.length > 0 && (
            <motion.div 
              className="fixed bottom-24 left-4 z-10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="rounded-full shadow-lg flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                onClick={handleClearChat}
                title="Clear chat history"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear Chat
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Improved input area */}
      <div className="flex justify-center p-4 border-t border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="w-full max-w-3xl mx-auto">
          <div className="rounded-xl shadow-md border bg-background/80 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative flex flex-col">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitMessage();
                  }
                }}
                placeholder="What can I do for you?"
                className="w-full px-4 py-3 bg-transparent border-none 
                          focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 
                          min-h-[72px] max-h-[200px] overflow-y-auto resize-none"
                disabled={isLoading}
              />
              
              <div className="h-12 flex items-center px-3 border-t border-border/30">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <select
                      className="h-8 pl-2 pr-8 text-xs rounded-md bg-muted/40 
                                border border-border hover:bg-muted 
                                focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      disabled={isLoading}
                    >
                      {AI_MODELS.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Button
                    type="button"
                    className="rounded-md flex items-center gap-1.5 relative overflow-hidden group"
                    size="sm"
                    onClick={handleSubmitMessage}
                    disabled={!inputValue.trim() || isLoading}
                  >
                    <span className="relative z-10">{isLoading ? "Processing..." : "Send"}</span>
                    <Send className="h-3.5 w-3.5 relative z-10" />
                    <span className="absolute inset-0 bg-primary/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-md"></span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface