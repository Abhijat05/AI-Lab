import axios from 'axios';

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Fixed API key - replace with your actual OpenRouter API key
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Available models
export const AVAILABLE_MODELS = [
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1' },
  { id: 'google/gemini-2.0-pro-exp-02-05:free', name: 'Gemini Pro 2.0' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini Flash 2.0' },
  { id: 'google/gemini-2.0-flash-thinking-exp-1219:free', name: ' Gemini 2.0 Flash Thinking' },
  { id: 'rekaai/reka-flash-3:free', name: 'Reka Flash 3 Thinking' }
];

// Default model
export const DEFAULT_MODEL = 'deepseek/deepseek-r1:free';

// Create API service for OpenRouter
const openRouterService = {
  sendMessage: async (messages, modelId = DEFAULT_MODEL, onChunk = null) => {
    try {
      // If no chunk handler is provided, use the regular non-streaming API
      if (!onChunk) {
        const response = await axios.post(
          OPENROUTER_API_URL,
          {
            model: modelId,
            messages: messages,
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.origin, // Required by OpenRouter
              'X-Title': 'AI Chat App', // Name of your application
            }
          }
        );
        
        return response.data;
      }
      
      // Use streaming API with fetch instead of axios for better SSE handling
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Chat App',
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages,
          stream: true,
        }),
      });

      // Check if the response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Create a reader to read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      
      // Read and process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk and add it to the buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines in the buffer
        const lines = buffer.split('\n');
        // Keep the last line in the buffer as it might be incomplete
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine === '' || trimmedLine === 'data: [DONE]') continue;
          
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(trimmedLine.substring(6));
              if (jsonData.choices && jsonData.choices[0]?.delta?.content) {
                onChunk(jsonData.choices[0].delta.content);
              }
            } catch (err) {
              console.error('Error parsing streaming response:', err);
            }
          }
        }
      }
      
      // Process any remaining data in the buffer
      if (buffer.trim() !== '' && buffer.trim() !== 'data: [DONE]') {
        const trimmedLine = buffer.trim();
        if (trimmedLine.startsWith('data: ')) {
          try {
            const jsonData = JSON.parse(trimmedLine.substring(6));
            if (jsonData.choices && jsonData.choices[0]?.delta?.content) {
              onChunk(jsonData.choices[0].delta.content);
            }
          } catch (err) {
            console.error('Error parsing streaming response:', err);
          }
        }
      }
      
      // Return final structure similar to non-streaming response
      return {
        choices: [
          {
            message: {
              role: 'assistant',
              content: '' // The content will be built up via streaming
            }
          }
        ]
      };
    } catch (error) {
      console.error('Error sending message to OpenRouter:', error);
      throw error;
    }
  },
  
  getAvailableModels: () => {
    return AVAILABLE_MODELS;
  }
};

export default openRouterService;