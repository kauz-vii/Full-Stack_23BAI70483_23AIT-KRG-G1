import type { Message, ChatSettings } from '../types';
import { ChatProvider } from '../types';

// API Configuration - Reads keys from your .env.local file
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''; 

// Debug: Log API key status (remove in production)
if (import.meta.env.DEV) {
  console.log('Gemini API Key configured:', GEMINI_API_KEY ? 'Yes' : 'No');
}

// Convert messages to API format
const formatMessagesForAPI = (messages: Message[], systemPrompt: string): any[] => {
  const apiMessages = [{ role: 'system', content: systemPrompt }];

  messages.forEach(msg => {
    if (msg.sender === 'user') {
      apiMessages.push({ role: 'user', content: msg.text });
    } else if (msg.sender === 'bot') {
      apiMessages.push({ role: 'assistant', content: msg.text });
    }
  });

  return apiMessages;
};

// OpenAI API Integration
const callOpenAI = async (
  messages: Message[],
  settings: ChatSettings,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
  }

  try {
    const formattedMessages = formatMessagesForAPI(messages, settings.systemPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: settings.model === 'gpt-4' ? 'gpt-4' : 'gpt-3.5-turbo',
        messages: formattedMessages,
        temperature: settings.temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch from OpenAI API');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onComplete();
            return;
          }

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    onComplete();
  } catch (err) {
    onError(err as Error);
  }
};

// Gemini API Integration
const callGemini = async (
  messages: Message[],
  settings: ChatSettings,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env.local file.');
  }

  try {
    // Use the model name directly as provided, or default to gemini-2.5-flash
    let modelName = settings.model || 'gemini-2.5-flash';

    // Validate model name - ensure it's a supported model
    const supportedModels = [
      'gemini-2.5-flash',
      'gemini-2.5-pro-preview-03-25',
      'gemini-2.5-flash-preview-05-20',
      'gemini-2.5-flash-lite-preview-06-17'
    ];

    // If model doesn't match exactly, default to gemini-2.5-flash
    if (!supportedModels.includes(modelName)) {
      console.warn(`Model ${modelName} not found, using default: gemini-2.5-flash`);
      modelName = 'gemini-2.5-flash';
    }

    const lastUserMessage = messages[messages.length - 1];

    if (!lastUserMessage || lastUserMessage.sender !== 'user') {
      throw new Error('No user message found');
    }

    // Build conversation history for Gemini API
    const conversationHistory = messages
      .filter(msg => msg.sender !== 'system')
      .slice(-10) // Keep last 10 messages for context
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

    // Build request payload
    const requestBody: any = {
      contents: conversationHistory,
      generationConfig: {
        temperature: settings.temperature,
        topP: 0.95,
        topK: 40,
      }
    };

    // Add system instruction if provided
    if (settings.systemPrompt && settings.systemPrompt.trim()) {
      requestBody.systemInstruction = {
        parts: [{ text: settings.systemPrompt }]
      };
    }

    console.log('Calling Gemini API with model:', modelName);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?key=${GEMINI_API_KEY}`;
    console.log('API URL:', apiUrl.replace(GEMINI_API_KEY, 'API_KEY_HIDDEN'));

    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    } catch (networkError: any) {
      console.error('Network error:', networkError);
      throw new Error(`Network error: ${networkError.message || 'Failed to connect to Gemini API. Please check your internet connection.'}`);
    }

    if (!response.ok) {
      let errorMessage = 'Failed to fetch from Gemini API';
      let errorDetails: any = null;
      
      try {
        const errorText = await response.text();
        console.error('Gemini API Error Response:', errorText);
        
        try {
          errorDetails = JSON.parse(errorText);
          errorMessage = errorDetails.error?.message || errorDetails.message || errorMessage;
          
          // Add more context if available
          if (errorDetails.error?.status) {
            errorMessage += ` (Status: ${errorDetails.error.status})`;
          }
        } catch (parseError) {
          // If JSON parsing fails, use the text as error message
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      console.error('Gemini API Error Details:', errorDetails);
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let buffer = '';
    let isComplete = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Process complete JSON objects from the buffer
      // Gemini streaming API returns JSON objects, potentially in an array format
      // We need to extract complete JSON objects as they arrive
      
      while (buffer.length > 0) {
        // Remove leading whitespace and array brackets
        buffer = buffer.trim();
        if (buffer.startsWith('[')) {
          buffer = buffer.substring(1).trim();
        }
        if (buffer.startsWith(',')) {
          buffer = buffer.substring(1).trim();
        }
        if (buffer.startsWith(']')) {
          buffer = buffer.substring(1).trim();
          isComplete = true;
          break;
        }
        
        // Try to find a complete JSON object
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        let objStart = -1;
        let objEnd = -1;
        
        for (let i = 0; i < buffer.length; i++) {
          const char = buffer[i];
          
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          
          if (char === '"' && !escapeNext) {
            inString = !inString;
            continue;
          }
          
          if (!inString) {
            if (char === '{') {
              if (braceCount === 0) objStart = i;
              braceCount++;
            } else if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                objEnd = i + 1;
                break;
              }
            }
          }
        }
        
        // If we found a complete JSON object, parse it
        if (objStart >= 0 && objEnd > objStart) {
          const jsonStr = buffer.substring(objStart, objEnd);
          buffer = buffer.substring(objEnd);
          
          try {
            const json = JSON.parse(jsonStr);
            
            // Extract text content from candidates
            const candidates = json.candidates || [];
            if (candidates.length > 0) {
              const candidate = candidates[0];
              const content = candidate.content;
              if (content && content.parts) {
                for (const part of content.parts) {
                  if (part.text) {
                    onChunk(part.text);
                  }
                }
              }
              
              // Check if finished
              if (candidate.finishReason && candidate.finishReason !== 'MAX_TOKENS') {
                isComplete = true;
                break;
              }
            }
          } catch (e) {
            console.warn('Failed to parse JSON chunk:', jsonStr.substring(0, 100), e);
            // If parsing fails, we might have a partial object, keep it in buffer
            buffer = jsonStr + buffer;
            break;
          }
        } else {
          // No complete object found, wait for more data
          break;
        }
      }
      
      if (isComplete) break;
    }

    onComplete();
  } catch (err) {
    onError(err as Error);
  }
};

// Fallback mock responses
const getMockResponse = (messages: Message[]): string => {
  const lastUserMessage = messages[messages.length - 1]?.text.toLowerCase().trim() || '';

  if (lastUserMessage.match(/^(hi|hello|hey|greetings)/)) {
    return "Hello there! How can I assist you today?";
  }

  if (lastUserMessage.match(/\b(css|stylesheet|style|styling)\b/)) {
    return "CSS (Cascading Style Sheets) is a language used to style web pages. It controls colors, fonts, spacing, and layout. Would you like to learn more about a specific CSS topic?";
  }

  if (lastUserMessage.match(/\b(minutes?|hours?|time|60)\b/)) {
    return "There are 60 minutes in one hour. Time conversion: 1 hour = 60 minutes = 3,600 seconds. How can I help you with time conversions?";
  }

  return "I'm here to help! However, I'm currently in demo mode. To use real AI responses, please configure an API key (OpenAI or Gemini) in your environment variables. For now, I can provide basic information. What would you like to know?";
};

export const streamChatResponse = async (
  history: Message[],
  settings: ChatSettings,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    // Use real API if configured, otherwise fall back to mock
    if (settings.provider === ChatProvider.OpenAI && OPENAI_API_KEY) {
      await callOpenAI(history, settings, onChunk, onComplete, onError);
      return;
    }

    if (settings.provider === ChatProvider.Gemini && GEMINI_API_KEY) {
      await callGemini(history, settings, onChunk, onComplete, onError);
      return;
    }

    // Fallback to mock response
    await new Promise(res => setTimeout(res, 500));

    if (history[history.length - 1]?.text.toLowerCase().includes("error")) {
      throw new Error("I've encountered a simulated error. Please try again.");
    }

    const responseText = getMockResponse(history);
    const chunks = responseText.match(/.{1,10}/g) || [];

    const stream = (index: number) => {
      if (index < chunks.length) {
        onChunk(chunks[index]);
        setTimeout(() => stream(index + 1), 50);
      } else {
        onComplete();
      }
    };

    stream(0);
  } catch (err) {
    onError(err as Error);
  }
};