import React, { useRef, useEffect } from 'react';


interface ChatInputProps {
  value: string; 
  onChange: (newText: string) => void; 
  onSend: (text: string) => void; 
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, isLoading }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSend(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="chat-input-area">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={value} // Use the value from props
              onChange={(e) => onChange(e.target.value)} // Use the onChange handler from props
              onKeyDown={handleKeyDown}
              placeholder="How can ThinkAI help you today?"
              className="flex-1 resize-none bg-transparent focus:ring-0" 
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !value.trim()}
              className="send-button"
              aria-label="Send message"
            >
              →
            </button>
          </div>
        </form>
        <div className="input-tags-container">
          <button className="input-tag">ThinkAI</button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;