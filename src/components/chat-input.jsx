import React, { useState, useEffect } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea"
import { ArrowRight, Trash2, ChevronDown, Bot, Check, Sparkles, Info, Cpu, Zap, AlertCircle, SendHorizontal, Mic, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "motion/react"
import ReactMarkdown from 'react-markdown';

export function ChatInput({ 
  onSendMessage, 
  onClearChat, 
  isLoading, 
  selectedModel,
  setSelectedModel 
}) {
  const [inputValue, setInputValue] = useState("")
  const [showTooltip, setShowTooltip] = useState(false)
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 56,
    maxHeight: 200,
  })

  React.useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      
      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInputValue(transcript);
        adjustHeight();
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    
    onSendMessage(inputValue.trim())
    setInputValue("")
    adjustHeight(true) // Reset height
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      recognition?.stop();
      setIsRecording(false);
    } else {
      recognition?.start();
      setIsRecording(true);
    }
  };

  // Available AI models
  const AI_MODELS = [
    "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    "mistralai/mistral-7b-instruct:free",
    "openchat/openchat-7b:free",
    "meta-llama/llama-3-8b-instruct:free",
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free",
    "google/gemma-7b-it:free"
  ]

  // Icons for different models
  const MODEL_ICONS = {
    "cognitivecomputations/dolphin-mistral-24b-venice-edition:free": <Sparkles className="h-4 w-4" />,
    "mistralai/mistral-7b-instruct:free": <Bot className="h-4 w-4" />,
    "openchat/openchat-7b:free": <Zap className="h-4 w-4" />,
    "meta-llama/llama-3-8b-instruct:free": <Cpu className="h-4 w-4" />,
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free": <Sparkles className="h-4 w-4" />,
    "google/gemma-7b-it:free": <Cpu className="h-4 w-4" />
  }

  // Display names for models (for showing shorter names in UI)
  const MODEL_DISPLAY_NAMES = {
    "cognitivecomputations/dolphin-mistral-24b-venice-edition:free": "Dolphin Mistral 24B",
    "mistralai/mistral-7b-instruct:free": "Mistral 7B",
    "openchat/openchat-7b:free": "OpenChat 7B",
    "meta-llama/llama-3-8b-instruct:free": "Llama 3 8B",
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free": "Nous Hermes 2",
    "google/gemma-7b-it:free": "Google Gemma 7B"
  }

  // Get display name or use original model ID
  const getDisplayName = (modelId) => {
    return MODEL_DISPLAY_NAMES[modelId] || modelId
  }

  // Show API info tooltip
  const toggleTooltip = () => {
    setShowTooltip(prev => !prev)
    setTimeout(() => setShowTooltip(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto w-full">
      <div className="relative">
        <div className="relative flex flex-col">
          {showPreview ? (
            <div className="prose dark:prose-invert p-4 min-h-[56px] border rounded-xl">
              <ReactMarkdown>{inputValue}</ReactMarkdown>
            </div>
          ) : (
            <>
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  adjustHeight()
                }}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                disabled={isLoading}
                className={cn(
                  "pr-12 resize-none rounded-xl border-border/50 focus-visible:ring-1 focus-visible:ring-primary focus:border-primary/50",
                  "min-h-[56px] py-3 px-4 transition-colors",
                  "bg-background/80 backdrop-blur-sm",
                  "shadow-sm hover:shadow",
                  isLoading && "opacity-50"
                )}
              />
              
              <AnimatePresence>
                {inputValue.trim() && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="absolute bottom-2.5 right-2.5"
                  >
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading}
                      className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 transition-all hover:scale-105"
                    >
                      <SendHorizontal className="h-4 w-4 text-primary-foreground" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center mt-3 text-xs text-muted-foreground justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 px-2 text-xs border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground transition-colors"
            >
              <div className="bg-primary/10 rounded-full p-0.5">
                {MODEL_ICONS[selectedModel] || <Bot className="h-3 w-3" />}
              </div>
              <span className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                {getDisplayName(selectedModel)}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 max-h-[300px] overflow-y-auto">
            <div className="px-2 py-1.5 text-xs font-medium border-b mb-1 flex items-center">
              <Cpu className="h-3 w-3 mr-1.5 text-primary" />
              Select AI Model
            </div>
            
            {AI_MODELS.map((model) => (
              <DropdownMenuItem
                key={model}
                onClick={() => setSelectedModel(model)}
                className={cn(
                  "flex items-center justify-between transition-colors",
                  selectedModel === model && "bg-primary/10"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="bg-primary/10 rounded-full p-0.5">
                    {MODEL_ICONS[model] || <Bot className="h-3 w-3" />}
                  </span>
                  <span className="font-medium">{getDisplayName(model)}</span>
                </span>
                {selectedModel === model && <Check className="h-3 w-3 text-primary" />}
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              <Info className="h-3 w-3 inline mr-1" /> Advanced AI models
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="text-xs text-muted-foreground">
          <span className="opacity-75">Powered by</span>{" "}
          <span className="font-medium bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Advanced AI
          </span>
        </div>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs">
          {showPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>
    </form>
  )
}