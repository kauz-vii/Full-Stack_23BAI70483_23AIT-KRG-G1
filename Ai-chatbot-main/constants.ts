
import { ChatProvider, ChatSettings } from './types';

export const DEFAULT_SETTINGS: ChatSettings = {
  provider: ChatProvider.Gemini,
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  systemPrompt: 'You are a helpful and friendly AI assistant. Respond in markdown format.',
};

export const AVAILABLE_MODELS: Record<ChatProvider, string[]> = {
  [ChatProvider.OpenAI]: ['gpt-4', 'gpt-3.5-turbo'],
  [ChatProvider.Dialogflow]: ['dialogflow-es', 'dialogflow-cx'],
  [ChatProvider.Gemini]: ['gemini-2.5-flash', 'gemini-2.5-pro-preview-03-25', 'gemini-2.5-flash-preview-05-20'],
};
