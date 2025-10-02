// Direct API implementation

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Fetch AI response from the API
 * @param {Array} messages - Array of message objects with role and content
 * @param {string} model - Model ID for the API
 * @param {Object} options - Optional parameters
 * @param {Function} options.onStream - Optional callback for streaming responses
 * @returns {Promise<string>} - The AI response text
 */
export async function getAIResponse(messages, model, { onStream } = {}) {
  // Check if API key exists
  if (!API_KEY) {
    console.error("API key is not set");
    throw new Error("API key not configured. Please set VITE_OPENROUTER_API_KEY in your .env file");
  }

  try {
    // Send request to API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "UnAi Chat Application"
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: !!onStream // Enable streaming if onStream callback provided
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", errorData);
      throw new Error(`API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    // Handle streaming response
    if (onStream && response.headers.get("content-type")?.includes("text/event-stream")) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0].delta?.content || "";
              if (content) onStream(content);
            } catch (e) {
              console.error("Error parsing stream data:", e);
            }
          }
        }
      }
      
      return ""; // Return empty as full response was streamed
    }

    // Regular non-streaming response
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling AI API:", error);
    
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error: Unable to reach the API. Please check your internet connection.");
    } else {
      throw error;
    }
  }
}