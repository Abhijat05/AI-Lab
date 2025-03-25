import axios from 'axios';

const OPENROUTER_API_URL = import.meta.env.VITE_OPENROUTER_API_URL;

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
  sendMessage: async (messages, modelId = DEFAULT_MODEL) => {
    try {
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