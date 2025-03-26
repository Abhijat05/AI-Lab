import { useState } from 'react';
import { User, Bot, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [copiedCode, setCopiedCode] = useState(null);
  const [showReasoning, setShowReasoning] = useState(false);
  
  // Extract reasoning section if it exists (enclosed in <reasoning> tags)
  const hasReasoning = !isUser && message.content.includes('<reasoning>');
  let displayContent = message.content;
  let reasoningContent = '';
  
  if (hasReasoning) {
    const reasoningRegex = /<reasoning>([\s\S]*?)<\/reasoning>/;
    const match = message.content.match(reasoningRegex);
    
    if (match && match[1]) {
      reasoningContent = match[1].trim();
      displayContent = message.content.replace(reasoningRegex, '').trim();
    }
  }
  
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
      })
      .catch(err => console.error('Failed to copy code:', err));
  };
  
  const toggleReasoning = () => {
    setShowReasoning(prev => !prev);
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={cn(
          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
          isUser ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-gray-700 to-gray-800"
        )}>
          {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-blue-300" />}
        </div>
        
        <div className={cn(
          "py-3 px-4 rounded-xl shadow-sm",
          isUser 
            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none" 
            : "bg-gradient-to-br from-gray-800 to-gray-700 text-white rounded-tl-none"
        )}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-sm markdown-content">
              <ReactMarkdown
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    const code = String(children).replace(/\n$/, '');
                    
                    return !inline && match ? (
                      <div className="relative group">
                        <button 
                          onClick={() => handleCopyCode(code)}
                          className="absolute right-2 top-2 p-1 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          aria-label="Copy code"
                        >
                          {copiedCode === code ? 
                            <Check className="h-4 w-4 text-green-400" /> : 
                            <Copy className="h-4 w-4 text-gray-300" />
                          }
                        </button>
                        <SyntaxHighlighter
                          style={atomDark}
                          language={match[1]}
                          PreTag="div"
                          className="!mt-0 !bg-gray-850 rounded-md"
                          customStyle={{
                            padding: '2.5rem 1rem 1rem 1rem', 
                            marginTop: '0',
                            borderRadius: '0.375rem',
                            backgroundColor: 'rgba(26, 32, 44, 0.8)'
                          }}
                          {...props}
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                  strong: ({node, ...props}) => <span className="font-bold text-blue-300" {...props} />,
                  em: ({node, ...props}) => <span className="italic" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold my-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-md font-bold my-1" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                  li: ({node, ...props}) => <li className="my-1" {...props} />,
                  p: ({node, ...props}) => <p className="my-2" {...props} />,
                }}
              >
                {displayContent}
              </ReactMarkdown>
              
              {hasReasoning && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <button 
                    onClick={toggleReasoning}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    {showReasoning ? 
                      <><ChevronUp size={14} /> Hide reasoning</> : 
                      <><ChevronDown size={14} /> Show reasoning</>
                    }
                  </button>
                  
                  {showReasoning && (
                    <div className="mt-2 p-2 bg-gray-800/50 rounded-md text-gray-300 text-xs">
                      <ReactMarkdown>
                        {reasoningContent}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}