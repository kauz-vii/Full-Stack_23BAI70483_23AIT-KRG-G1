import React from 'react';
import CollapseIcon from './CollapseIcon';

interface ChatSession {
  id: string;
  title: string;
}

interface HistoryPanelProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isOpen: boolean;
  onNewChat: () => void;
  onSwitchChat: (sessionId: string) => void;
  onDeleteChat: (sessionId: string) => void;
  onToggle: () => void;
}

// Using a smaller PlusIcon for the simple button
const PlusIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const HistoryPanel: React.FC<HistoryPanelProps> = ({ sessions, activeSessionId, isOpen, onNewChat, onSwitchChat, onDeleteChat, onToggle }) => {
  return (
    <aside className={`history-panel ${!isOpen ? 'closed' : ''}`}>
      <button className="history-toggle-button" onClick={onToggle} aria-label="Toggle history panel">
        <CollapseIcon />
      </button>

      {/* REVERTED: This is now a simple, horizontal button again */}
      <div className="history-header">
        <button className="new-chat-button" onClick={onNewChat}>
          <PlusIcon />
          <span>New Chat</span>
        </button>
      </div>

      <nav className="history-list">
        {sessions.map((session) => (
          <div 
            key={session.id} 
            className={`history-item-wrapper ${session.id === activeSessionId ? 'active' : ''}`}
          >
            <button className="history-item-button" onClick={() => onSwitchChat(session.id)}>
              {session.title || "New Chat"}
            </button>
            {/* The delete button is hidden for a cleaner look unless you want it back */}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default HistoryPanel;