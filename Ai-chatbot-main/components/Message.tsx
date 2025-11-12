import React from 'react';
import type { Message } from '../types';
import { Sender } from '../types';

interface MessageBubbleProps {
  message: Message;
  onRetry: () => void;
  isLoading: boolean; // <-- We added this prop
}

const TypingIndicator: React.FC = () => ( <div className="typing-indicator"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>);

const RetryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0M6.828 6.828A8.25 8.25 0 0118.49 18.49m-4.992-4.992v4.992m0 0h-4.992m4.992 0l-3.182-3.182a8.25 8.25 0 00-11.664 0" />
  </svg>
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRetry, isLoading }) => {
  const isUser = message.sender === Sender.User;

  // --- START: NEW LOGIC FOR THE THINKING BUBBLE ---
  const shouldShowTyping = isLoading && !isUser && !message.text && !message.error;
  
  // Render nothing for empty bot messages that are NOT in a loading state.
  if (!isUser && !message.text && !isLoading) {
    return null;
  }
  // --- END: NEW LOGIC ---

  return (
    <div className={`message-container ${isUser ? 'message-user' : 'message-ai'}`}>
      <div className="avatar">
        {isUser ? 'You' : 'AI'}
      </div>
      <div className={`message-bubble ${shouldShowTyping ? 'thinking-bubble' : ''}`}>
        {shouldShowTyping ? (
          <TypingIndicator />
        ) : (
          <>
            <div 
              className="message-text"
              dangerouslySetInnerHTML={{
                __html: message.text
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br />'),
              }}
            />
            {message.error && (
              <div className="mt-3 pt-3 border-t border-danger/30 flex items-center justify-end">
                <button
                  onClick={onRetry}
                  className="text-xs flex items-center gap-1.5 px-2 py-1 rounded text-accent transition-colors hover:bg-accent-light"
                >
                  <RetryIcon className="w-4 h-4" />
                  Retry
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;