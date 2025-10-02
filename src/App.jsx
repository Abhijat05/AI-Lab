import React from 'react'
import { ThemeProvider } from "@/components/ui/theme-provider"
import ThemeToggleButton from "@/components/ui/theme-toggle-button"
import ChatInterface from "@/components/chat-interface"
import { Bot, Github, BrainCircuit, Command } from "lucide-react"
import { Button } from "@/components/ui/button"

const App = () => {
  const [mounted, setMounted] = React.useState(false)
  
  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        {/* Enhanced header */}
        <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex-shrink-0">
          <div className="container flex h-16 max-w-screen-2xl items-center px-4">
            <div className="mr-4 flex items-center">
              <div className="rounded-full bg-gradient-to-br from-primary to-blue-600 p-2 shadow-lg">
                <BrainCircuit className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight ml-3 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                UnAi
              </h1>
              <div className="ml-3">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium border border-primary/20">
                  Beta
                </span>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-end space-x-3">
              {mounted && (
                <div className="hidden md:flex items-center border border-border/40 rounded-md h-8 px-2 text-xs text-muted-foreground bg-muted/30">
                  <Command className="h-3 w-3 mr-1" />
                  <span>Enter</span>
                  <span className="mx-1 text-muted-foreground/50">to send</span>
                  <span className="mx-1 text-muted-foreground/50">·</span>
                  <span>Shift + Enter</span>
                  <span className="ml-1 text-muted-foreground/50">for new line</span>
                </div>
              )}

              <Button 
                variant="outline" 
                size="sm"
                asChild
                className="h-8 border-dashed hidden sm:flex hover:border-primary hover:text-primary transition-colors"
              >
                <a 
                  href="https://github.com/Abhijat05/AI-Lab" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="GitHub repository"
                >
                  <Github className="h-4 w-4 mr-1.5" /> Star on GitHub
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                asChild
                className="h-8 w-8 sm:hidden"
              >
                <a 
                  href="https://github.com/Abhijat05/AI-Lab" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="GitHub repository"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <ThemeToggleButton variant="circle" start="center" />
            </div>
          </div>
        </header>
        
        <main className="flex-1 relative overflow-hidden">
          {/* Enhanced background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-full filter blur-[120px] opacity-40 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{animationDuration: '8s'}}></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/5 to-primary/5 rounded-full filter blur-[100px] opacity-40 translate-x-1/3 translate-y-1/3 animate-pulse" style={{animationDuration: '10s', animationDelay: '1s'}}></div>
          </div>
          
          <ChatInterface />
        </main>
        
        {/* Improved footer */}
        <footer className="py-3 px-4 text-center text-xs text-muted-foreground border-t border-border/20 flex-shrink-0 bg-background/80 backdrop-blur-sm">
          <span>© {new Date().getFullYear()} UnAi · Built with modern web technologies · Powered by Advanced AI Models</span>
        </footer>
      </div>
    </ThemeProvider>
  )
}

export default App