
import React from 'react';
import type { ChatSettings, Message } from '../types';
import { ChatProvider } from '../types';
import { AVAILABLE_MODELS } from '../constants';

interface SettingsPanelProps {
  isOpen: boolean;
  settings: ChatSettings;
  messages: Message[];
  onUpdateSettings: (newSettings: Partial<ChatSettings>) => void;
  onClearChat: () => void;
  onSummarizeChat: () => void;
  onClose: () => void;
}

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  settings,
  messages,
  onUpdateSettings,
  onClearChat,
  onSummarizeChat,
  onClose,
}) => {
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as ChatProvider;
    onUpdateSettings({
      provider: newProvider,
      model: AVAILABLE_MODELS[newProvider][0], // default to first model of new provider
    });
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full w-full max-w-xs md:max-w-sm lg:w-80 bg-secondary shadow-lg p-6 transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 40,
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: 'var(--secondary)'
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Settings</h2>
          <button onClick={onClose} className="md:hidden p-1 rounded-full hover:bg-primary transition-colors">
             <CloseIcon className="w-6 h-6"/>
          </button>
        </div>

        <div className="space-y-6">
          {/* Provider Selection */}
          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-text-secondary mb-1">
              AI Provider
            </label>
            <select
              id="provider"
              value={settings.provider}
              onChange={handleProviderChange}
              className="w-full bg-primary border border-border rounded-md p-2 text-text-primary focus:ring-accent focus:border-accent"
            >
              {Object.values(ChatProvider).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-text-secondary mb-1">
              Model
            </label>
            <select
              id="model"
              value={settings.model}
              onChange={(e) => onUpdateSettings({ model: e.target.value })}
              className="w-full bg-primary border border-border rounded-md p-2 text-text-primary focus:ring-accent focus:border-accent"
            >
              {AVAILABLE_MODELS[settings.provider].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Temperature Slider */}
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-text-secondary mb-1">
              Temperature: {settings.temperature.toFixed(1)}
            </label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => onUpdateSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full cursor-pointer"
            />
          </div>
          
          {/* System Prompt */}
          <div>
            <label htmlFor="system-prompt" className="block text-sm font-medium text-text-secondary mb-1">
              System Prompt
            </label>
            <textarea
              id="system-prompt"
              rows={4}
              value={settings.systemPrompt}
              onChange={(e) => onUpdateSettings({ systemPrompt: e.target.value })}
              className="w-full bg-primary border border-border rounded-md p-2 text-text-primary focus:ring-accent focus:border-accent resize-none"
              placeholder="e.g., You are a helpful assistant."
            />
          </div>

          {/* Actions */}
          <div className="border-t border-border pt-6 space-y-3">
            <button
              onClick={onClearChat}
              className="w-full bg-danger hover:bg-danger-hover text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Clear Conversation
            </button>
            <button
              onClick={onSummarizeChat}
              className="w-full bg-secondary hover:bg-primary text-text-primary font-bold py-2 px-4 rounded-md border border-border transition-colors"
            >
              Summarize Context
            </button>
             <a
              href="#"
              onClick={(e) => {
                  const conversationJson = JSON.stringify({messages: messages, settings: settings}, null, 2);
                  const blob = new Blob([conversationJson], {type: 'text/json;charset=utf-8,'});
                  (e.target as HTMLAnchorElement).href = URL.createObjectURL(blob);
              }}
              download="conversation.json"
              className="block text-center w-full bg-secondary hover:bg-primary text-text-primary font-bold py-2 px-4 rounded-md border border-border transition-colors"
            >
              Export Conversation
            </a>
          </div>
        </div>
      </aside>
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/50 z-30 md:hidden" />}
    </>
  );
};

export default SettingsPanel;