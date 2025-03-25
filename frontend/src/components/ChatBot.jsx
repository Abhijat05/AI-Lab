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

  const handleSendMessage = async (content) => {
    const userMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Format the messages for the API
      const messageHistory = [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        ...messages,
        userMessage
      ];

      const response = await openRouterService.sendMessage(messageHistory, selectedModel);
      
      // Extract the assistant's response
      const assistantMessage = response.choices[0].message;
      setMessages(prev => [...prev, assistantMessage]);
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
    <div className="flex flex-col h-[650px] max-w-3xl mx-auto rounded-xl shadow-2xl overflow-hidden border border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">AI Assistant</h2>
          </div>
          
          <Popover open={open && !isDisabled} onOpenChange={!isDisabled ? setOpen : undefined}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-label="Select a model"
                className={cn(
                  "px-3 py-1.5 h-auto",
                  isDisabled 
                    ? "opacity-70 cursor-not-allowed bg-gray-800 border-gray-700" 
                    : "bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-gray-600"
                )}
                disabled={isDisabled}
              >
                <Laptop className="mr-2 h-4 w-4 text-blue-400" />
                <span className="truncate max-w-[140px]">{selectedModelName || "Select model"}</span>
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0 border border-gray-700 bg-gray-850 text-white shadow-lg">
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
                      className="text-white hover:bg-gray-700 aria-selected:bg-gray-700 py-2"
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
          <p className="text-xs mt-2 text-gray-400">
            Model in use: <span className="text-blue-400">{selectedModelName}</span>
          </p>
        )}
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col bg-gray-900 scrollbar-thin scrollbar-thumb-gray-800">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-5">
            <div className="bg-blue-500/10 p-6 rounded-full">
              <Bot className="h-12 w-12 text-blue-400" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-medium text-white">How can I help you today?</h3>
              <p className="text-gray-400">Send a message to start chatting with {selectedModelName}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-6 w-full max-w-md">
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
              <ChatMessage key={index} message={message} />
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