import { useState } from 'react';
import { Button } from './ui/button';
import { Send, Loader2 } from 'lucide-react';

export default function ChatInput({ onSendMessage, isLoading }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows="1"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none min-h-[42px] max-h-[120px] text-sm sm:text-base"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="mr-1.5 bg-blue-600 hover:bg-blue-700 h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full flex items-center justify-center"
          size="icon"
        >
          {isLoading ? 
            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : 
            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          }
        </Button>
      </div>
      <p className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-1.5 text-right">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}