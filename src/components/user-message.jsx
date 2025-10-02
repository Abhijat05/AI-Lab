import React from 'react'
import { cn } from "@/lib/utils"
import { User, Clock } from "lucide-react"
import { motion } from "motion/react"

export function UserMessage({ content }) {
  return (
    <div className="flex items-start gap-4 sm:gap-6 rounded-lg p-3 hover:bg-muted/5 transition-colors group">
      <motion.div 
        className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full border bg-background text-foreground shadow-sm"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <User className="h-5 w-5" />
      </motion.div>
      
      <motion.div 
        className="space-y-1.5 flex-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={cn(
          "prose dark:prose-invert", 
          "min-w-0",
          "bg-background/50 backdrop-blur-sm p-3 rounded-lg rounded-tl-none border border-border/30 shadow-sm",
          "group-hover:border-border/50 transition-colors"
        )}>
          {content.split("\n").map((line, i) => (
            <p key={i} className={line === "" ? "my-3" : undefined}>
              {line || "\u00a0"}
            </p>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground flex items-center gap-1 ml-1">
          <Clock className="h-3 w-3" /> Just now
        </div>
      </motion.div>
    </div>
  )
}