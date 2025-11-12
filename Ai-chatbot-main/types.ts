export enum Sender {
  User = 'user',
  Bot = 'bot',
  System = 'system',
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: string;
  error?: boolean;
}

export enum ChatProvider {
  OpenAI = 'OpenAI',
  Dialogflow = 'Dialogflow',
  Gemini = 'Gemini',
}

export interface ChatSettings {
  provider: ChatProvider;
  model: string;
  temperature: number;
  systemPrompt: string;
}

// Add this new Enum for the different models
export enum Model {
  GeminiFlash = 'gemini-1.5-flash-latest',
  GeminiPro = 'gemini-1.5-pro-latest',
  // Add other models if you need them, e.g., for OpenAI
  Gpt4 = 'gpt-4',
  Gpt35 = 'gpt-3.5-turbo'
}

// Add this new interface for a chat session
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  settings: ChatSettings;
}