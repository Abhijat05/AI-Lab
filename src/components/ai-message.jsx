import React from 'react'
import { cn } from "@/lib/utils"
import { Bot, Copy, Check, Code, MessageSquare } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { motion } from "motion/react"

export function AIMessage({ content, error }) {
  const [copied, setCopied] = React.useState(false)
  const [isHovering, setIsHovering] = React.useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // no-op
    }
  }

  return (
    <div 
      className="flex items-start gap-4 sm:gap-6 group rounded-lg p-3 hover:bg-muted/10 transition-colors"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <motion.div 
        className={cn(
          "flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full border shadow-sm",
          error 
            ? "bg-destructive/10 text-destructive border-destructive/20" 
            : "bg-primary/10 text-primary border-primary/20"
        )}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Bot className="h-5 w-5" />
      </motion.div>

      <motion.div 
        className="relative w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={cn(
          "prose dark:prose-invert prose-pre:bg-muted/80 prose-pre:text-muted-foreground",
          "min-w-0 prose-code:text-primary prose-headings:text-foreground",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "prose-pre:rounded-md prose-pre:border prose-pre:shadow-sm",
          "bg-accent/10 backdrop-blur-sm p-4 rounded-lg rounded-tl-none border border-border/30 shadow-sm",
          "group-hover:border-border/50 transition-colors",
          error && "text-destructive prose-headings:text-destructive prose-a:text-destructive/80 bg-destructive/5 border-destructive/20"
        )}>
          <ReactMarkdown>
            {content}
          </ReactMarkdown>
        </div>

        {!error && (
          <motion.div 
            className="absolute -top-2 -right-2 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovering ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              onClick={onCopy}
              className="rounded-md border bg-card/95 backdrop-blur-sm text-xs px-2 py-1 hover:bg-accent hover:text-accent-foreground shadow-sm transition-colors"
              aria-label="Copy message"
              title="Copy"
            >
              {copied ? 
                <span className="inline-flex items-center gap-1"><Check className="h-3 w-3" /> Copied</span> : 
                <span className="inline-flex items-center gap-1"><Copy className="h-3 w-3" /> Copy</span>
              }
            </button>
            
            <button
              type="button"
              className="rounded-md border bg-card/95 backdrop-blur-sm text-xs px-2 py-1 hover:bg-accent hover:text-accent-foreground shadow-sm transition-colors"
              aria-label="Run code"
              title="Run code"
            >
              <span className="inline-flex items-center gap-1"><Code className="h-3 w-3" /> Run</span>
            </button>
          </motion.div>
        )}
        
        <div className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1 ml-1">
          <MessageSquare className="h-3 w-3" /> AI • Just now
        </div>
      </motion.div>
    </div>
  )
}