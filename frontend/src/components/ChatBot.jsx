import { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import openRouterService, { AVAILABLE_MODELS, DEFAULT_MODEL } from '../services/openRouterService';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Button } from './ui/button';
import { Check, ChevronsUpDown, Laptop, Send, Bot, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Add animation classes for new messages
    const messageElements = document.querySelectorAll('.message-animate');
    messageElements.forEach(el => {
      el.classList.add('animate-in', 'fade-in', 'slide-in-from-bottom-3', 'duration-300');
      // Remove the animation class after animation completes
      setTimeout(() => {
        el.classList.remove('message-animate');
      }, 300);
    });
  }, [messages]);

  const handleSendMessage = async (content) => {
    const userMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Format the messages for the API
      const messageHistory = [
        { role: 'system', content: 'You are a helpful AI assistant. When you reason through a problem, enclose your reasoning in <reasoning> tags.' },
        ...messages,
        userMessage
      ];

      // Create a placeholder for the assistant's response
      const assistantPlaceholder = {
        role: 'assistant',
        content: ''
      };
      
      // Add the placeholder to the messages state
      setMessages(prev => [...prev, assistantPlaceholder]);
      
      // Track the current message index to update it
      const assistantMessageIndex = messages.length + 1;

      await openRouterService.sendMessage(
        messageHistory, 
        selectedModel,
        // Chunk handler callback
        (chunk) => {
          setMessages(currentMessages => {
            const updatedMessages = [...currentMessages];
            // Append the new chunk to the existing content
            updatedMessages[assistantMessageIndex] = {
              ...updatedMessages[assistantMessageIndex],
              content: updatedMessages[assistantMessageIndex].content + chunk
            };
            return updatedMessages;
          });
        }
      );
    } catch (error) {
      console.error('Failed to get response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (value) => {
    setSelectedModel(value);
    setOpen(false);
  };

  const isDisabled = isLoading || messages.length > 0;
  const selectedModelName = AVAILABLE_MODELS.find(model => model.id === selectedModel)?.name;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] w-full max-w-6xl mx-auto rounded-xl shadow-2xl overflow-hidden border border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Header */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-800 to-gray-900 shadow-md">
        <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-2">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">AI Assistant</h2>
          </div>
          
          <Popover open={open && !isDisabled} onOpenChange={!isDisabled ? setOpen : undefined}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-label="Select a model"
                className={cn(
                  "px-2 sm:px-3 py-1 sm:py-1.5 h-auto text-xs sm:text-sm",
                  isDisabled 
                    ? "opacity-80 cursor-not-allowed bg-gray-800 border-gray-700" 
                    : "bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-blue-500 transition-all"
                )}
                disabled={isDisabled}
              >
                <Laptop className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
                <span className="truncate max-w-[80px] sm:max-w-[140px]">{selectedModelName || "Select model"}</span>
                <ChevronsUpDown className="ml-1 sm:ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 border border-gray-700 bg-gray-850 text-white shadow-lg rounded-lg overflow-hidden popover-content-width">
              <Command className="bg-gray-800 border-none">
                <CommandInput placeholder="Search models..." className="text-white bg-gray-800 border-b border-gray-700" />
                <CommandEmpty>
                  <div className="py-6 text-center text-sm text-gray-400">
                    No model found
                  </div>
                </CommandEmpty>
                <CommandGroup className="text-white py-1">
                  {AVAILABLE_MODELS.map((model) => (
                    <CommandItem
                      key={model.id}
                      value={model.id}
                      onSelect={handleModelChange}
                      className="text-white hover:bg-gray-700 aria-selected:bg-blue-600 py-2.5"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-blue-400",
                          selectedModel === model.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {model.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        {messages.length > 0 && (
          <p className="text-[10px] sm:text-xs mt-1 sm:mt-2 text-gray-400">
            Model in use: <span className="text-blue-400">{selectedModelName}</span>
          </p>
        )}
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 p-2 sm:p-4 overflow-y-auto flex flex-col bg-gray-900 scrollbar-thin scrollbar-thumb-gray-800">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-5 p-4">
            <div className="bg-blue-500/10 p-6 rounded-full">
              <Bot className="h-12 w-12 text-blue-400" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-medium text-white">How can I help you today?</h3>
              <p className="text-gray-400">Send a message to start chatting with {selectedModelName}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 w-full max-w-md">
              {[
                "Tell me about yourself",
                "Write a poem about nature",
                "Help me solve a math problem",
                "Give me recipe ideas"
              ].map((suggestion, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-left justify-start h-auto py-2"
                  onClick={() => handleSendMessage(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={index === messages.length - 1 ? 'message-animate' : ''}>
                <ChatMessage message={message} />
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 bg-gray-850 border-t border-gray-800">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}