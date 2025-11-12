import React, { useState, useEffect } from 'react';
import { streamChatResponse } from '../services/chatService';
import type { Message, ChatSettings, ChatSession } from '../types';
import { Sender, ChatProvider, Model } from '../types';

const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSession = React.useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);
  
  const messages = activeSession?.messages || [];
  const settings = activeSession?.settings || { provider: ChatProvider.Gemini, model: Model.GeminiFlash, temperature: 0.7, systemPrompt: 'You are a helpful and friendly AI assistant.' };

  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem('chatSessions');
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions);
        if (Array.isArray(parsedSessions) && parsedSessions.length > 0) {
          setSessions(parsedSessions);
          const storedActiveId = localStorage.getItem('activeChatSessionId');
          const activeIdIsValid = parsedSessions.some((s: ChatSession) => s.id === storedActiveId);
          setActiveSessionId(storedActiveId && activeIdIsValid ? storedActiveId : parsedSessions[0].id);
        } else {
          startNewChat();
        }
      } else {
        startNewChat();
      }
    } catch (e) { console.error("Failed to load sessions:", e); startNewChat(); }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
        if (activeSessionId) localStorage.setItem('activeChatSessionId', activeSessionId);
      } catch (e) { console.error("Failed to save sessions:", e); }
    }
  }, [sessions, activeSessionId]);
  
  const sendMessage = async (text: string) => {
    if (!activeSessionId) return;
    const newUserMessage: Message = { id: Date.now().toString(), sender: Sender.User, text, timestamp: new Date().toLocaleTimeString() };
    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = { id: botMessageId, sender: Sender.Bot, text: '', timestamp: new Date().toLocaleTimeString() };
    const currentSession = sessions.find(s => s.id === activeSessionId);
    const history = currentSession ? [...currentSession.messages, newUserMessage] : [newUserMessage];
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, newUserMessage, botMessagePlaceholder] } : s));
    setIsLoading(true);
    setError(null);
    await streamChatResponse( history, settings,
      (chunk) => {
        setSessions(prev => prev.map(s => {
          if (s.id !== activeSessionId) return s;
          const updatedMessages = s.messages.map(m => m.id === botMessageId ? { ...m, text: m.text + chunk } : m);
          let newTitle = s.title;
          if (s.title === 'New Chat') { newTitle = history.find(m => m.sender === Sender.User)?.text.substring(0, 30) || 'New Chat'; }
          return { ...s, messages: updatedMessages, title: newTitle };
        }));
      },
      () => { setIsLoading(false); },
      (err) => {
        setError(err.message || 'An unknown error occurred.');
        setIsLoading(false);
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: s.messages.map(m => m.id === botMessageId ? { ...m, text: `Error: ${err.message}`, error: true } : m) } : s));
      }
    );
  };
  
  const startNewChat = () => {
    // --- FIX: Cleanup empty chats before creating a new one ---
    const currentSession = sessions.find(s => s.id === activeSessionId);
    const newSession: ChatSession = { id: `session_${Date.now().toString()}`, title: 'New Chat', messages: [], settings: { provider: ChatProvider.Gemini, model: Model.GeminiFlash, temperature: 0.7, systemPrompt: 'You are a helpful and friendly AI assistant.' } };

    setSessions(prev => {
        // Filter out the previously active session if it was empty
        const cleanedSessions = prev.filter(s => {
            if (s.id === currentSession?.id && s.messages.length === 0) {
                return false; // Remove it
            }
            return true;
        });
        // Add the new session to the cleaned list
        return [newSession, ...cleanedSessions];
    });
    
    setActiveSessionId(newSession.id);
  };

  const switchChat = (sessionId: string) => {
    // --- FIX: Cleanup empty chats when switching away ---
    const departingSession = sessions.find(s => s.id === activeSessionId);
    // If we are leaving an empty chat, remove it before switching
    if (departingSession && departingSession.messages.length === 0) {
      setSessions(prev => prev.filter(s => s.id !== departingSession.id));
    }
    
    setActiveSessionId(sessionId);
  };
  
  const deleteChat = (sessionId: string) => {
    const remainingSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(remainingSessions);
    if (activeSessionId === sessionId) {
      if (remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0].id);
      } else {
        startNewChat();
      }
    }
  };

  // --- (The rest of the file is unchanged) ---
  const clearChat = () => { if (!activeSessionId) return; setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [] } : s)); };
  const updateSettings = (newSettings: Partial<ChatSettings>) => { if (!activeSessionId) return; setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, settings: { ...s.settings, ...newSettings } } : s)); };
  const retryLastMessage = () => {
    if (!activeSessionId || messages.length === 0) return;
    const lastUserMessage = [...messages].reverse().find(m => m.sender === Sender.User);
    if (lastUserMessage) {
      const historyWithoutError = messages.filter(m => !m.error && m.id !== (parseInt(lastUserMessage.id, 10) + 1).toString());
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: historyWithoutError } : s));
      setTimeout(() => sendMessage(lastUserMessage.text), 100);
    }
  };
  const summarizeChat = () => { alert("Summarize feature is not implemented yet."); };

  return { sessions, activeSessionId, messages, isLoading, error, settings, sendMessage, clearChat, summarizeChat, updateSettings, retryLastMessage, startNewChat, switchChat, deleteChat };
};

export default useChat;