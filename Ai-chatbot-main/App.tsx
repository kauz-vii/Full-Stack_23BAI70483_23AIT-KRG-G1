import React, { useState } from 'react';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import useChat from './hooks/useChat';
import type { ChatSettings } from './types';
import HistoryPanel from './components/HistoryPanel';

const App: React.FC = () => {
  const {
    sessions, activeSessionId, messages, isLoading, error, settings,
    sendMessage, clearChat, summarizeChat, updateSettings, retryLastMessage,
    startNewChat, switchChat, deleteChat,
  } = useChat();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // --- NEW STATE for History Panel ---
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(true);
  
  const [currentInput, setCurrentInput] = useState('');

  const handlePromptClick = (promptText: string) => { setCurrentInput(promptText); };
  const handleSend = (message: string) => { sendMessage(message); setCurrentInput(''); };
  const handleUpdateSettings = (newSettings: Partial<ChatSettings>) => { updateSettings(newSettings); };

  return (
    <div className="flex h-screen w-full flex-col font-sans text-text-primary bg-primary overflow-hidden">
      <Header onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)} />
      
      <div className="flex flex-1 overflow-hidden min-h-0">
        <HistoryPanel 
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewChat={startNewChat}
          onSwitchChat={switchChat}
          onDeleteChat={deleteChat}
          isOpen={isHistoryPanelOpen} // Pass state down
          onToggle={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)} // Pass toggle function down
        />
        
        <SettingsPanel
          isOpen={isSettingsOpen}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClearChat={clearChat}
          onSummarizeChat={summarizeChat}
          onClose={() => setIsSettingsOpen(false)}
          messages={messages}
        />
        
        {/* The main content area now has a conditional class to adjust its margin */}
        <main 
          className={`main-content ${isHistoryPanelOpen ? 'history-open' : ''} ${isSettingsOpen ? 'settings-open' : ''}`}
        >
          <ChatWindow 
            messages={messages} 
            isLoading={isLoading} 
            error={error} 
            onRetry={retryLastMessage}
            onPromptClick={handlePromptClick} 
          />
          <ChatInput 
            value={currentInput}
            onChange={setCurrentInput}
            onSend={handleSend} 
            isLoading={isLoading} 
          />
        </main>
      </div>
    </div>
  );
};

export default App;